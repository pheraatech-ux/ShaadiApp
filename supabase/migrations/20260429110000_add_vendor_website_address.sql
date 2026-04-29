alter table public.vendors
  add column if not exists website_url text null,
  add column if not exists address     text null;
