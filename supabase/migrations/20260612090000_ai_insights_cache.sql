create table ai_insights_cache (
  id           uuid        primary key default gen_random_uuid(),
  planner_id   uuid        not null references profiles(id) on delete cascade,
  insights     jsonb       not null default '[]',
  generated_at timestamptz not null default now(),
  constraint ai_insights_cache_planner_id_key unique (planner_id)
);

alter table ai_insights_cache enable row level security;

create policy "Users can manage own insights cache"
  on ai_insights_cache
  for all
  using (planner_id = auth.uid())
  with check (planner_id = auth.uid());
