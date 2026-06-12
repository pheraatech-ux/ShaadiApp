alter table public.sticky_notes
  add column if not exists width_pct double precision,
  add column if not exists height_pct double precision;

-- pos_x / pos_y are stored as fractions of canvas size (0–1) for responsive layout.
-- Legacy rows may still hold pixel values (> 1); the client converts on read/write.
