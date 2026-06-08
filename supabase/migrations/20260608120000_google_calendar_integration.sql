-- Google Calendar tokens: one row per user who has connected GCal
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  text NOT NULL,
  refresh_token text,
  expiry_date   bigint,
  scope         text,
  token_type    text DEFAULT 'Bearer',
  calendar_id   text NOT NULL DEFAULT 'primary',
  connected_email text,
  connected_at  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON google_calendar_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Track the corresponding Google Calendar event ID for pushed events
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS gcal_event_id text;

-- Cache for events pulled from Google Calendar (read-only display)
CREATE TABLE IF NOT EXISTS google_calendar_cached_events (
  id          text    NOT NULL,
  user_id     uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text    NOT NULL DEFAULT '(No title)',
  description text,
  start_at    timestamptz NOT NULL,
  end_at      timestamptz,
  all_day     boolean NOT NULL DEFAULT false,
  location    text,
  html_link   text,
  calendar_id text    NOT NULL DEFAULT 'primary',
  synced_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, user_id)
);

ALTER TABLE google_calendar_cached_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON google_calendar_cached_events
  FOR ALL USING (auth.uid() = user_id);
