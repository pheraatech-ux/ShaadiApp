create table calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  title       text not null,
  description text,
  start_at    timestamptz not null,
  end_at      timestamptz,
  all_day     boolean not null default false,
  color       text,
  wedding_id  uuid references weddings(id) on delete set null,
  event_type  text not null default 'personal',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "Users manage own calendar events"
  on calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
