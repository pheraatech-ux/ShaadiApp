import { google } from "googleapis";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildAuthedClient } from "@/lib/google-calendar/client";
import type { GCalTokenSet } from "@/lib/google-calendar/client";

type CalendarRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  location: string | null;
  gcal_event_id: string | null;
};

function buildResource(evt: CalendarRow) {
  return {
    summary: evt.title,
    description: evt.description ?? undefined,
    location: evt.location ?? undefined,
    start: evt.all_day
      ? { date: evt.start_at.slice(0, 10) }
      : { dateTime: evt.start_at },
    end: evt.all_day
      ? { date: (evt.end_at ?? evt.start_at).slice(0, 10) }
      : { dateTime: evt.end_at ?? evt.start_at },
  };
}

async function getTokenRow(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("access_token, refresh_token, expiry_date, token_type, calendar_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data as {
    access_token: string;
    refresh_token: string | null;
    expiry_date: number | null;
    token_type: string | null;
    calendar_id: string;
  } | null;
}

async function persistRefreshedToken(
  supabase: SupabaseClient,
  userId: string,
  newTokens: GCalTokenSet,
) {
  await supabase
    .from("google_calendar_tokens")
    .update({
      access_token: newTokens.access_token,
      expiry_date: newTokens.expiry_date ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/** Push a new event to Google Calendar and store the gcal_event_id. */
export async function pushNewEventToGcal(
  supabase: SupabaseClient,
  userId: string,
  evt: CalendarRow,
  requestUrl: string,
): Promise<void> {
  const tokenRow = await getTokenRow(supabase, userId);
  if (!tokenRow) return;

  const { origin } = new URL(requestUrl);
  const redirectUri = `${origin}/api/auth/google-calendar/callback`;

  const authClient = buildAuthedClient(tokenRow, redirectUri, (newTokens) => {
    void persistRefreshedToken(supabase, userId, newTokens);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cal = google.calendar({ version: "v3", auth: authClient as any });
  const calendarId = tokenRow.calendar_id ?? "primary";

  const { data: created } = await cal.events.insert({
    calendarId,
    requestBody: buildResource(evt),
  });

  if (created?.id) {
    await supabase
      .from("calendar_events")
      .update({ gcal_event_id: created.id })
      .eq("id", evt.id);
  }
}

/** Update an existing Google Calendar event. */
export async function updateGcalEvent(
  supabase: SupabaseClient,
  userId: string,
  evt: CalendarRow,
  requestUrl: string,
): Promise<void> {
  if (!evt.gcal_event_id) return;
  const tokenRow = await getTokenRow(supabase, userId);
  if (!tokenRow) return;

  const { origin } = new URL(requestUrl);
  const redirectUri = `${origin}/api/auth/google-calendar/callback`;

  const authClient = buildAuthedClient(tokenRow, redirectUri, (newTokens) => {
    void persistRefreshedToken(supabase, userId, newTokens);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cal = google.calendar({ version: "v3", auth: authClient as any });
  const calendarId = tokenRow.calendar_id ?? "primary";

  await cal.events.patch({
    calendarId,
    eventId: evt.gcal_event_id,
    requestBody: buildResource(evt),
  });
}

/** Delete a Google Calendar event. */
export async function deleteGcalEvent(
  supabase: SupabaseClient,
  userId: string,
  gcalEventId: string,
  requestUrl: string,
): Promise<void> {
  const tokenRow = await getTokenRow(supabase, userId);
  if (!tokenRow) return;

  const { origin } = new URL(requestUrl);
  const redirectUri = `${origin}/api/auth/google-calendar/callback`;

  const authClient = buildAuthedClient(tokenRow, redirectUri, (newTokens) => {
    void persistRefreshedToken(supabase, userId, newTokens);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cal = google.calendar({ version: "v3", auth: authClient as any });
  const calendarId = tokenRow.calendar_id ?? "primary";

  await cal.events.delete({ calendarId, eventId: gcalEventId });
}
