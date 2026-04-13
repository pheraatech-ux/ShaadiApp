create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  author_user_id uuid references public.profiles (id) on delete set null,
  body text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_comments_task on public.task_comments (task_id, created_at desc);
create index if not exists idx_task_comments_wedding on public.task_comments (wedding_id, created_at desc);

alter table public.task_comments enable row level security;

create policy "task_comments_rw_member"
on public.task_comments
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));
