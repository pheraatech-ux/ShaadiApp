-- The recursive exists() in the previous policy caused infinite RLS recursion.
-- Use a SECURITY DEFINER function that bypasses RLS to look up the caller's owner.
create or replace function get_my_company_owner_id()
  returns uuid
  language sql
  security definer
  stable
  set search_path = public
as $$
  select owner_user_id
  from company_employees
  where user_id = auth.uid()
  limit 1
$$;

drop policy if exists "company_employees_select_company_members" on company_employees;

create policy "company_employees_select_company_members"
  on company_employees for select
  using (
    -- Owner/admin sees all their employees
    auth.uid() = owner_user_id
    -- Employee sees their own row
    or auth.uid() = user_id
    -- Employee sees all peers (same company owner) — uses definer fn to avoid recursion
    or owner_user_id = get_my_company_owner_id()
  );
