-- Drop any previous attempt at the peer policy (idempotent)
drop policy if exists "company_employees_select_owner_or_self" on company_employees;
drop policy if exists "company_employees_select_owner_or_peer" on company_employees;

-- Anyone who is the owner, OR is an employee of that owner, can read all
-- employees in that company. This lets the attendees dropdown show everyone.
create policy "company_employees_select_company_members"
  on company_employees for select
  using (
    -- The admin/owner can always see their own employees
    auth.uid() = owner_user_id
    -- The employee can see themselves
    or auth.uid() = user_id
    -- Any employee can see all peers (same owner = same company)
    or exists (
      select 1 from company_employees ce2
      where ce2.owner_user_id = company_employees.owner_user_id
        and ce2.user_id = auth.uid()
    )
  );
