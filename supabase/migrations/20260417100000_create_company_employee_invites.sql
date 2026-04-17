create table if not exists public.company_employee_invites (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.company_employees (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  delivery_channel text not null default 'link' check (delivery_channel in ('link', 'whatsapp', 'email')),
  created_at timestamptz not null default now(),
  last_sent_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by_user_id uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz
);

create unique index if not exists idx_company_employee_invites_token_hash
on public.company_employee_invites (token_hash);

create unique index if not exists idx_company_employee_invites_active_per_employee
on public.company_employee_invites (employee_id)
where claimed_at is null and revoked_at is null;

create index if not exists idx_company_employee_invites_owner_created
on public.company_employee_invites (owner_user_id, created_at desc);

create index if not exists idx_company_employee_invites_employee_created
on public.company_employee_invites (employee_id, created_at desc);

alter table public.company_employee_invites enable row level security;

drop policy if exists "company_employee_invites_select_owner" on public.company_employee_invites;
create policy "company_employee_invites_select_owner"
on public.company_employee_invites
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists "company_employee_invites_insert_owner" on public.company_employee_invites;
create policy "company_employee_invites_insert_owner"
on public.company_employee_invites
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "company_employee_invites_update_owner" on public.company_employee_invites;
create policy "company_employee_invites_update_owner"
on public.company_employee_invites
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "company_employee_invites_delete_owner" on public.company_employee_invites;
create policy "company_employee_invites_delete_owner"
on public.company_employee_invites
for delete
to authenticated
using (owner_user_id = auth.uid());

create or replace function public.claim_company_employee_invite(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text,
  p_user_phone text default null
)
returns table (
  result text,
  employee_id uuid,
  owner_user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.company_employee_invites%rowtype;
  employee_row public.company_employees%rowtype;
  email_match boolean := false;
  phone_match boolean := false;
  normalized_user_phone text;
  normalized_invite_phone text;
begin
  select *
  into invite_row
  from public.company_employee_invites
  where token_hash = p_token_hash
  order by created_at desc
  limit 1
  for update;

  if not found then
    return query select 'invalid', null::uuid, null::uuid;
    return;
  end if;

  select *
  into employee_row
  from public.company_employees
  where id = invite_row.employee_id
  for update;

  if not found then
    return query select 'invalid', null::uuid, null::uuid;
    return;
  end if;

  if invite_row.revoked_at is not null then
    return query select 'revoked', employee_row.id, employee_row.owner_user_id;
    return;
  end if;

  if invite_row.claimed_at is not null then
    return query select 'claimed', employee_row.id, employee_row.owner_user_id;
    return;
  end if;

  if invite_row.expires_at <= now() then
    return query select 'expired', employee_row.id, employee_row.owner_user_id;
    return;
  end if;

  if employee_row.email is not null and p_user_email is not null then
    email_match := lower(trim(employee_row.email)) = lower(trim(p_user_email));
  end if;

  normalized_user_phone := nullif(regexp_replace(coalesce(p_user_phone, ''), '[^0-9+]', '', 'g'), '');
  normalized_invite_phone := nullif(regexp_replace(coalesce(employee_row.phone, ''), '[^0-9+]', '', 'g'), '');
  if normalized_user_phone is not null and normalized_invite_phone is not null then
    phone_match := normalized_user_phone = normalized_invite_phone;
  end if;

  if not email_match and not phone_match then
    return query select 'identity_mismatch', employee_row.id, employee_row.owner_user_id;
    return;
  end if;

  update public.company_employee_invites
  set claimed_at = now(),
      claimed_by_user_id = p_user_id
  where id = invite_row.id
    and claimed_at is null
    and revoked_at is null
    and expires_at > now();

  if not found then
    return query select 'claimed', employee_row.id, employee_row.owner_user_id;
    return;
  end if;

  update public.company_employees
  set user_id = p_user_id,
      employment_status = 'active'
  where id = employee_row.id;

  return query select 'accepted', employee_row.id, employee_row.owner_user_id;
end;
$$;
