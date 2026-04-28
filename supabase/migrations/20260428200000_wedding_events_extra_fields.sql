-- Add venue, time, and notes fields to wedding_events

ALTER TABLE wedding_events
  ADD COLUMN IF NOT EXISTS start_time     TIME,
  ADD COLUMN IF NOT EXISTS end_time       TIME,
  ADD COLUMN IF NOT EXISTS venue          TEXT,
  ADD COLUMN IF NOT EXISTS venue_address  TEXT,
  ADD COLUMN IF NOT EXISTS notes          TEXT;
