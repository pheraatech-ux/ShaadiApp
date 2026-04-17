alter table public.company_employee_invites
  add column if not exists token text;

create unique index if not exists idx_company_employee_invites_token
on public.company_employee_invites (token)
where token is not null;
