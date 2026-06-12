alter table public.sticky_notes
  add column if not exists pos_x double precision,
  add column if not exists pos_y double precision;
