create extension if not exists "pgcrypto";

create type public.wedding_status as enum ('upcoming', 'completed', 'cancelled');
create type public.wedding_member_role as enum ('owner', 'lead', 'coordinator', 'viewer');
create type public.wedding_member_status as enum ('active', 'invited', 'removed');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.vendor_status as enum ('pending', 'confirmed', 'declined');

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  bride_name text not null,
  groom_name text not null,
  couple_name text not null,
  city text,
  venue_name text,
  wedding_date date,
  cultures text[] not null default '{}'::text[],
  status public.wedding_status not null default 'upcoming',
  total_budget_paise bigint not null default 0,
  spent_budget_paise bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_members (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  invited_email text,
  display_name text,
  role public.wedding_member_role not null default 'viewer',
  status public.wedding_member_status not null default 'invited',
  created_at timestamptz not null default now(),
  unique (wedding_id, user_id),
  unique (wedding_id, invited_email)
);

create table if not exists public.wedding_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  title text not null,
  event_date date,
  culture_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  title text not null,
  assignee_user_id uuid references public.profiles (id) on delete set null,
  status public.task_status not null default 'todo',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  name text not null,
  category text not null default 'General',
  notes text,
  status public.vendor_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  category text not null,
  allocated_paise bigint not null default 0,
  spent_paise bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  author_user_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  title text not null,
  file_url text,
  created_by_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_weddings_updated_at on public.weddings;
create trigger set_weddings_updated_at
before update on public.weddings
for each row execute procedure public.set_updated_at();

create or replace function public.is_wedding_member(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.wedding_members wm
    where wm.wedding_id = target_wedding_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  );
$$;

create or replace function public.is_wedding_admin(target_wedding_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.wedding_members wm
    where wm.wedding_id = target_wedding_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'lead')
      and wm.status = 'active'
  );
$$;

create or replace function public.add_wedding_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wedding_members (wedding_id, user_id, display_name, role, status)
  values (new.id, new.creator_id, 'Owner', 'owner', 'active')
  on conflict (wedding_id, user_id) do update
    set role = 'owner',
        status = 'active';
  return new;
end;
$$;

drop trigger if exists on_wedding_created_add_owner on public.weddings;
create trigger on_wedding_created_add_owner
after insert on public.weddings
for each row execute procedure public.add_wedding_owner_membership();

create index if not exists idx_wedding_members_user on public.wedding_members (user_id, status);
create index if not exists idx_wedding_members_wedding on public.wedding_members (wedding_id, status);
create index if not exists idx_tasks_wedding on public.tasks (wedding_id, status, due_date);
create index if not exists idx_tasks_assignee on public.tasks (assignee_user_id);
create index if not exists idx_wedding_events_wedding on public.wedding_events (wedding_id, event_date);
create index if not exists idx_vendors_wedding on public.vendors (wedding_id, status);

alter table public.weddings enable row level security;
alter table public.wedding_members enable row level security;
alter table public.wedding_events enable row level security;
alter table public.tasks enable row level security;
alter table public.vendors enable row level security;
alter table public.budget_items enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;

create policy "weddings_select_member"
on public.weddings
for select
to authenticated
using (public.is_wedding_member(id));

create policy "weddings_insert_creator"
on public.weddings
for insert
to authenticated
with check (creator_id = auth.uid());

create policy "weddings_update_owner"
on public.weddings
for update
to authenticated
using (public.is_wedding_admin(id))
with check (public.is_wedding_admin(id));

create policy "wedding_members_select_member"
on public.wedding_members
for select
to authenticated
using (public.is_wedding_member(wedding_id));

create policy "wedding_members_insert_owner"
on public.wedding_members
for insert
to authenticated
with check (public.is_wedding_admin(wedding_id));

create policy "wedding_members_update_owner"
on public.wedding_members
for update
to authenticated
using (public.is_wedding_admin(wedding_id))
with check (public.is_wedding_admin(wedding_id));

create policy "wedding_events_rw_member"
on public.wedding_events
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "tasks_rw_member"
on public.tasks
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "vendors_rw_member"
on public.vendors
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "budget_rw_member"
on public.budget_items
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "messages_rw_member"
on public.messages
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));

create policy "documents_rw_member"
on public.documents
for all
to authenticated
using (public.is_wedding_member(wedding_id))
with check (public.is_wedding_member(wedding_id));
