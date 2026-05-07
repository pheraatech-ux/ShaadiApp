-- Allow employees to view calendar events they have been invited to.
-- attendee_ids stores company_employees.id values as text; cast uuid to text for comparison.
create policy "Employees can view events they are invited to"
  on calendar_events for select
  using (
    exists (
      select 1 from company_employees
      where company_employees.user_id = auth.uid()
        and company_employees.id::text = any(calendar_events.attendee_ids)
    )
  );
