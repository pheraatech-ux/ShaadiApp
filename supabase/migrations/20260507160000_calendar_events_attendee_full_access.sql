-- Upgrade attendee access from SELECT-only to full CRUD.
drop policy if exists "Employees can view events they are invited to" on calendar_events;

create policy "Employees can manage events they are invited to"
  on calendar_events for all
  using (
    exists (
      select 1 from company_employees
      where company_employees.user_id = auth.uid()
        and company_employees.id::text = any(calendar_events.attendee_ids)
    )
  )
  with check (
    exists (
      select 1 from company_employees
      where company_employees.user_id = auth.uid()
        and company_employees.id::text = any(calendar_events.attendee_ids)
    )
  );
