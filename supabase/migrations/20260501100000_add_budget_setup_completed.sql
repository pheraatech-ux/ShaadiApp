alter table public.weddings
  add column if not exists budget_setup_completed boolean not null default false;
