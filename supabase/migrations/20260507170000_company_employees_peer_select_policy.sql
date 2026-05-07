-- Allow employees to view all peers in their company (same owner).
-- Previous policy only allowed owner or the employee themselves.
drop policy if exists "company_employees_select_owner_or_self" on company_employees;

create policy "company_employees_select_owner_or_peer"
  on company_employees for select
  using (
    auth.uid() = owner_user_id
    or auth.uid() = user_id
    or exists (
      select 1 from company_employees ce2
      where ce2.owner_user_id = company_employees.owner_user_id
        and ce2.user_id = auth.uid()
    )
  );
