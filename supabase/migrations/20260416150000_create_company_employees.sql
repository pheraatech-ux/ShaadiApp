do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'company_employee_role'
  ) then
    create type public.company_employee_role as enum ('coordinator', 'assistant', 'viewer');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'company_employee_status'
  ) then
    create type public.company_employee_status as enum ('invited', 'active', 'inactive');
  end if;
end
$$;

create table if not exists public.company_employees (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  role public.company_employee_role not null default 'assistant',
  employment_status public.company_employee_status not null default 'invited',
  invited_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_employees_owner on public.company_employees (owner_user_id, created_at desc);
create index if not exists idx_company_employees_user on public.company_employees (user_id);
create unique index if not exists idx_company_employees_owner_phone on public.company_employees (owner_user_id, phone);
create unique index if not exists idx_company_employees_owner_email on public.company_employees (owner_user_id, lower(email))
where email is not null;

alter table public.company_employees enable row level security;

drop policy if exists "company_employees_select_owner_or_self" on public.company_employees;
create policy "company_employees_select_owner_or_self"
on public.company_employees
for select
to authenticated
using (owner_user_id = auth.uid() or user_id = auth.uid());

drop policy if exists "company_employees_insert_owner" on public.company_employees;
create policy "company_employees_insert_owner"
on public.company_employees
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "company_employees_update_owner" on public.company_employees;
create policy "company_employees_update_owner"
on public.company_employees
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "company_employees_delete_owner" on public.company_employees;
create policy "company_employees_delete_owner"
on public.company_employees
for delete
to authenticated
using (owner_user_id = auth.uid());
