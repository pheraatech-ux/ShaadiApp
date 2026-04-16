alter table public.vendors
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists instagram_handle text,
  add column if not exists quoted_price_paise bigint not null default 0,
  add column if not exists advance_paid_paise bigint not null default 0,
  add column if not exists whatsapp_invite_status text not null default 'not_sent',
  add column if not exists whatsapp_invited_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vendors_whatsapp_invite_status_check'
  ) then
    alter table public.vendors
      add constraint vendors_whatsapp_invite_status_check
      check (whatsapp_invite_status in ('not_sent', 'sent', 'joined'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vendors_advance_not_exceed_quote_check'
  ) then
    alter table public.vendors
      add constraint vendors_advance_not_exceed_quote_check
      check (advance_paid_paise <= quoted_price_paise);
  end if;
end
$$;
