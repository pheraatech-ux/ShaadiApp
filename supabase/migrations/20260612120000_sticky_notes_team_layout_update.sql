-- Allow any company member to update public notes (layout changes enforced in app;
-- content/color/pinned still author-only via API).
drop policy if exists "sticky_notes_update_team_public" on public.sticky_notes;

create policy "sticky_notes_update_team_public"
  on public.sticky_notes for update
  to authenticated
  using (
    visibility = 'public'
    and (
      owner_user_id = auth.uid()
      or exists (
        select 1 from public.company_employees ce
        where ce.owner_user_id = sticky_notes.owner_user_id
          and ce.user_id = auth.uid()
          and ce.employment_status = 'active'
      )
    )
  )
  with check (
    visibility = 'public'
    and (
      owner_user_id = auth.uid()
      or exists (
        select 1 from public.company_employees ce
        where ce.owner_user_id = sticky_notes.owner_user_id
          and ce.user_id = auth.uid()
          and ce.employment_status = 'active'
      )
    )
  );
