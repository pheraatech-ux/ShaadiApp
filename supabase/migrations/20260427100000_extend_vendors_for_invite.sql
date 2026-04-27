alter table public.vendors
  add column if not exists invite_status text not null default 'not_invited'
    check (invite_status in ('not_invited', 'invited', 'active')),
  add column if not exists invited_at timestamptz,
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_vendors_user_id
on public.vendors (user_id)
where user_id is not null;

drop policy if exists "vendors_select_own_user" on public.vendors;
create policy "vendors_select_own_user"
on public.vendors
for select
to authenticated
using (user_id = auth.uid());
