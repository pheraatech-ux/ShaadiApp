do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('high', 'medium', 'low');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_visibility') then
    create type public.task_visibility as enum ('team_only', 'client_family', 'vendor');
  end if;
end
$$;

alter table public.tasks
  add column if not exists description text,
  add column if not exists priority public.task_priority not null default 'medium',
  add column if not exists linked_event_id uuid references public.wedding_events (id) on delete set null,
  add column if not exists raised_by_user_id uuid references public.profiles (id) on delete set null,
  add column if not exists visibility public.task_visibility[] not null default array['team_only']::public.task_visibility[];

update public.tasks
set raised_by_user_id = (
  select wm.user_id
  from public.wedding_members wm
  where wm.wedding_id = tasks.wedding_id
    and wm.role = 'owner'
    and wm.status = 'active'
  limit 1
)
where raised_by_user_id is null;

alter table public.tasks
  add constraint tasks_visibility_non_empty check (coalesce(array_length(visibility, 1), 0) > 0);
