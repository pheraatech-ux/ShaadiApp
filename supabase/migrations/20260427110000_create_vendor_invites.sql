create table if not exists public.vendor_invites (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  token text,
  token_hash text not null,
  expires_at timestamptz not null,
  delivery_channel text not null default 'link' check (delivery_channel in ('link', 'email')),
  created_at timestamptz not null default now(),
  last_sent_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by_user_id uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz
);

create unique index if not exists idx_vendor_invites_token_hash
on public.vendor_invites (token_hash);

create unique index if not exists idx_vendor_invites_active_per_vendor
on public.vendor_invites (vendor_id)
where claimed_at is null and revoked_at is null;

create index if not exists idx_vendor_invites_owner_created
on public.vendor_invites (owner_user_id, created_at desc);

create index if not exists idx_vendor_invites_vendor_created
on public.vendor_invites (vendor_id, created_at desc);

alter table public.vendor_invites enable row level security;

drop policy if exists "vendor_invites_select_owner" on public.vendor_invites;
create policy "vendor_invites_select_owner"
on public.vendor_invites
for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists "vendor_invites_insert_owner" on public.vendor_invites;
create policy "vendor_invites_insert_owner"
on public.vendor_invites
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "vendor_invites_update_owner" on public.vendor_invites;
create policy "vendor_invites_update_owner"
on public.vendor_invites
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "vendor_invites_delete_owner" on public.vendor_invites;
create policy "vendor_invites_delete_owner"
on public.vendor_invites
for delete
to authenticated
using (owner_user_id = auth.uid());
