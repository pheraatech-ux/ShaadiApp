alter table public.budget_items
  add column if not exists allocation_pct numeric(5,2) default null;
