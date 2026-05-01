-- Business financials tables for the planner's own business metrics.
-- Scoped to the authenticated user (owner_user_id = auth.uid()).
-- Separate from wedding client budgets.

-- ─────────────────────────────────────────
-- Revenue entries
-- ─────────────────────────────────────────
create table public.business_revenue_entries (
  id             uuid        not null default gen_random_uuid(),
  owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
  category       text        not null,
  amount_paise   bigint      not null check (amount_paise > 0),
  entry_date     date        not null,
  description    text        not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint business_revenue_entries_pkey primary key (id)
);

create index idx_business_revenue_entries_owner
  on public.business_revenue_entries (owner_user_id, entry_date desc);

alter table public.business_revenue_entries enable row level security;

create policy "business_revenue_entries_rw_owner"
  on public.business_revenue_entries
  to authenticated
  using  (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create trigger set_business_revenue_entries_updated_at
  before update on public.business_revenue_entries
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- Custom expense categories
-- ─────────────────────────────────────────
create table public.business_expense_categories (
  id             uuid        not null default gen_random_uuid(),
  owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
  label          text        not null,
  created_at     timestamptz not null default now(),
  constraint business_expense_categories_pkey primary key (id)
);

create index idx_business_expense_categories_owner
  on public.business_expense_categories (owner_user_id, created_at asc);

alter table public.business_expense_categories enable row level security;

create policy "business_expense_categories_rw_owner"
  on public.business_expense_categories
  to authenticated
  using  (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- ─────────────────────────────────────────
-- Expense entries
-- ─────────────────────────────────────────
create table public.business_expense_entries (
  id             uuid        not null default gen_random_uuid(),
  owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
  category_id    text        not null,
  category_label text        not null,
  amount_paise   bigint      not null check (amount_paise > 0),
  entry_date     date        not null,
  description    text        not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint business_expense_entries_pkey primary key (id)
);

create index idx_business_expense_entries_owner
  on public.business_expense_entries (owner_user_id, entry_date desc);

alter table public.business_expense_entries enable row level security;

create policy "business_expense_entries_rw_owner"
  on public.business_expense_entries
  to authenticated
  using  (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create trigger set_business_expense_entries_updated_at
  before update on public.business_expense_entries
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- Overdue receivables
-- ─────────────────────────────────────────
create table public.business_overdue_receivables (
  id             uuid        not null default gen_random_uuid(),
  owner_user_id  uuid        not null references public.profiles (id) on delete cascade,
  client_name    text        not null,
  amount_paise   bigint      not null check (amount_paise > 0),
  due_since      date        not null,
  created_at     timestamptz not null default now(),
  constraint business_overdue_receivables_pkey primary key (id)
);

create index idx_business_overdue_receivables_owner
  on public.business_overdue_receivables (owner_user_id, due_since asc);

alter table public.business_overdue_receivables enable row level security;

create policy "business_overdue_receivables_rw_owner"
  on public.business_overdue_receivables
  to authenticated
  using  (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());
