create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  title text not null,
  is_default boolean not null default false,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.message_thread_members (
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  added_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

create unique index if not exists idx_message_threads_single_default
  on public.message_threads (wedding_id)
  where is_default = true;

create index if not exists idx_message_threads_wedding_created
  on public.message_threads (wedding_id, created_at desc);

create index if not exists idx_message_thread_members_user
  on public.message_thread_members (user_id, created_at desc);

alter table public.messages
  add column if not exists thread_id uuid references public.message_threads (id) on delete set null;

create index if not exists idx_messages_thread_created
  on public.messages (thread_id, created_at desc);

insert into public.message_threads (wedding_id, title, is_default, created_by_user_id)
select w.id, 'General', true, w.creator_id
from public.weddings w
where not exists (
  select 1
  from public.message_threads mt
  where mt.wedding_id = w.id
    and mt.is_default = true
);

insert into public.message_thread_members (thread_id, user_id, added_by_user_id)
select mt.id, wm.user_id, coalesce(mt.created_by_user_id, wm.user_id)
from public.message_threads mt
join public.wedding_members wm
  on wm.wedding_id = mt.wedding_id
where mt.is_default = true
  and wm.status = 'active'
  and wm.user_id is not null
on conflict (thread_id, user_id) do nothing;

update public.messages m
set thread_id = mt.id
from public.message_threads mt
where mt.wedding_id = m.wedding_id
  and mt.is_default = true
  and m.thread_id is null;

alter table public.messages
  alter column thread_id set not null;

create or replace function public.is_message_thread_member(target_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.message_thread_members mtm
    join public.message_threads mt on mt.id = mtm.thread_id
    where mtm.thread_id = target_thread_id
      and mtm.user_id = auth.uid()
      and public.is_wedding_member(mt.wedding_id)
  );
$$;

alter table public.message_threads enable row level security;
alter table public.message_thread_members enable row level security;

drop policy if exists "messages_rw_member" on public.messages;

create policy "messages_rw_thread_member"
on public.messages
for all
to authenticated
using (public.is_message_thread_member(thread_id))
with check (public.is_message_thread_member(thread_id));

create policy "message_threads_rw_member"
on public.message_threads
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "message_thread_members_select_member"
on public.message_thread_members
for select
to authenticated
using (
  exists (
    select 1
    from public.message_threads mt
    where mt.id = message_thread_members.thread_id
      and public.is_wedding_member(mt.wedding_id)
  )
);

create policy "message_thread_members_insert_member"
on public.message_thread_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.message_threads mt
    where mt.id = message_thread_members.thread_id
      and public.is_wedding_member(mt.wedding_id)
  )
  and exists (
    select 1
    from public.message_threads mt
    join public.wedding_members wm on wm.wedding_id = mt.wedding_id
    where mt.id = message_thread_members.thread_id
      and wm.user_id = message_thread_members.user_id
      and wm.status = 'active'
  )
);

create policy "message_thread_members_delete_member"
on public.message_thread_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.message_threads mt
    where mt.id = message_thread_members.thread_id
      and public.is_wedding_member(mt.wedding_id)
  )
);
