alter table calendar_events
  add column if not exists location      text,
  add column if not exists attendee_ids  text[] not null default '{}',
  add column if not exists guest_emails  text[] not null default '{}';
