-- Allow any authenticated user to read other users' profiles.
-- Required for displaying teammate names across the app (tasks, comments, team views).
create policy "Authenticated users can read all profiles"
on public.profiles
for select
to authenticated
using (true);
