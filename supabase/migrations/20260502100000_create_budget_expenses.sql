create table if not exists budget_expenses (
  id uuid primary key default gen_random_uuid(),
  budget_item_id uuid not null references budget_items(id) on delete cascade,
  wedding_id uuid not null references weddings(id) on delete cascade,
  description text not null,
  amount_paise bigint not null default 0,
  status text not null default 'pending' check (status in ('paid', 'pending')),
  created_at timestamptz not null default now()
);

alter table budget_expenses enable row level security;

create policy "budget_expenses_select" on budget_expenses
  for select using (
    wedding_id in (
      select wm.wedding_id from wedding_members wm
      where wm.user_id = auth.uid() and wm.status = 'active'
    )
  );

create policy "budget_expenses_insert" on budget_expenses
  for insert with check (
    wedding_id in (
      select wm.wedding_id from wedding_members wm
      where wm.user_id = auth.uid() and wm.status = 'active'
    )
  );

create policy "budget_expenses_update" on budget_expenses
  for update using (
    wedding_id in (
      select wm.wedding_id from wedding_members wm
      where wm.user_id = auth.uid() and wm.status = 'active'
    )
  );

create policy "budget_expenses_delete" on budget_expenses
  for delete using (
    wedding_id in (
      select wm.wedding_id from wedding_members wm
      where wm.user_id = auth.uid() and wm.status = 'active'
    )
  );
