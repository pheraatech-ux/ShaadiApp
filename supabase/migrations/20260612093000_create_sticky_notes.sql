create table if not exists public.sticky_notes (
  id             uuid        primary key default gen_random_uuid(),
  -- owner_user_id is the planner's user id — acts as the "company" identifier.
  -- For employees, this is their planner's user_id (from company_employees.owner_user_id).
  owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
  author_user_id uuid        not null references public.profiles (id) on delete cascade,
  content        text        not null default '',
  color          text        not null default 'yellow'
                             check (color in ('yellow', 'pink', 'blue', 'green', 'purple')),
  visibility     text        not null default 'private'
                             check (visibility in ('public', 'private')),
  pinned         boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_sticky_notes_owner_visibility
  on public.sticky_notes (owner_user_id, visibility, created_at desc);

create index if not exists idx_sticky_notes_author
  on public.sticky_notes (author_user_id, created_at desc);

-- Auto-update updated_at on edit
create or replace function public.sticky_notes_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger sticky_notes_updated_at
  before update on public.sticky_notes
  for each row execute function public.sticky_notes_set_updated_at();

alter table public.sticky_notes enable row level security;

-- SELECT: public notes visible to the same company (planner + their active employees);
--         private notes visible only to the author.
create policy "sticky_notes_select"
  on public.sticky_notes for select
  to authenticated
  using (
    (
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
    or (
      visibility = 'private'
      and author_user_id = auth.uid()
    )
  );

-- INSERT: author must be the authenticated user; owner_user_id must be valid for them
-- (either they are the planner, or they are an active employee of that planner).
create policy "sticky_notes_insert"
  on public.sticky_notes for insert
  to authenticated
  with check (
    author_user_id = auth.uid()
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

-- UPDATE/DELETE: only the original author
create policy "sticky_notes_update"
  on public.sticky_notes for update
  to authenticated
  using (author_user_id = auth.uid())
  with check (author_user_id = auth.uid());

create policy "sticky_notes_delete"
  on public.sticky_notes for delete
  to authenticated
  using (author_user_id = auth.uid());
