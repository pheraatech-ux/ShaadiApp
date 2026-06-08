import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

import { buildAuthedClient, getRedirectUri } from "@/lib/google-calendar/client";
import type { GCalTokenSet } from "@/lib/google-calendar/client";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

const PULL_DAYS_BACK = 30;
const PULL_DAYS_FORWARD = 365;

function isShaadiAppOrigin(item: {
  extendedProperties?: { private?: Record<string, string | undefined> } | null;
}): boolean {
  return item.extendedProperties?.private?.source === "shaadiapp";
}

/** POST /api/calendar/google/sync
 *
 *  Two-way sync:
 *  - PULL  → fetches GCal-only events and caches them for display.
 *  - PUSH  → pushes any local personal events missing a gcal_event_id.
 *  - DELETE → removes local rows (and stale cache) when events were deleted in GCal. */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: tokenRow } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "Google Calendar not connected." }, { status: 400 });
  }

  const redirectUri = getRedirectUri(request.url);

  let refreshedTokens: Partial<GCalTokenSet> = {};
  const authClient = buildAuthedClient(tokenRow, redirectUri, (newTokens) => {
    refreshedTokens = newTokens;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cal = google.calendar({ version: "v3", auth: authClient as any });
  const calendarId = tokenRow.calendar_id ?? "primary";

  try {
    const timeMin = new Date(Date.now() - PULL_DAYS_BACK * 86_400_000).toISOString();
    const timeMax = new Date(Date.now() + PULL_DAYS_FORWARD * 86_400_000).toISOString();

    const { data: gcalList } = await cal.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 500,
    });

    const items = (gcalList?.items ?? []).filter(
      (item) => item.id && item.status !== "cancelled",
    );

    const pulledIds = new Set(items.map((i) => i.id!));

    // Local events previously pushed to GCal — used to dedupe pull + detect deletions
    const { data: linkedLocal } = await supabase
      .from("calendar_events")
      .select("id, gcal_event_id")
      .eq("user_id", user.id)
      .not("gcal_event_id", "is", null);

    const linkedGcalIds = new Set(
      (linkedLocal ?? []).map((e) => e.gcal_event_id).filter(Boolean) as string[],
    );

    // Events deleted in GCal but still in our calendar_events table
    const orphanedLocalIds = (linkedLocal ?? [])
      .filter((e) => e.gcal_event_id && !pulledIds.has(e.gcal_event_id))
      .map((e) => e.id);

    if (orphanedLocalIds.length > 0) {
      await supabase.from("calendar_events").delete().in("id", orphanedLocalIds);
    }

    // Only cache GCal-native events (not ones we pushed from ShaadiApp)
    const gcalOnlyItems = items.filter(
      (item) => !isShaadiAppOrigin(item) && !linkedGcalIds.has(item.id!),
    );

    // Replace cache entirely so deletions in GCal are reflected
    await supabase
      .from("google_calendar_cached_events")
      .delete()
      .eq("user_id", user.id);

    if (gcalOnlyItems.length > 0) {
      const toInsert = gcalOnlyItems.map((item) => ({
        id: item.id!,
        user_id: user.id,
        title: item.summary ?? "(No title)",
        description: item.description ?? null,
        start_at: item.start?.dateTime ?? `${item.start?.date}T00:00:00Z`,
        end_at: item.end?.dateTime ?? (item.end?.date ? `${item.end.date}T00:00:00Z` : null),
        all_day: Boolean(item.start?.date && !item.start?.dateTime),
        location: item.location ?? null,
        html_link: item.htmlLink ?? null,
        calendar_id: calendarId,
        synced_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("google_calendar_cached_events")
        .insert(toInsert);

      if (insertError) {
        console.error("[calendar/google/sync] cache insert:", insertError);
      }
    }

    // Push local events not yet linked to GCal
    const { data: unpushedRows } = await supabase
      .from("calendar_events")
      .select("id, title, description, start_at, end_at, all_day, location, gcal_event_id")
      .eq("user_id", user.id)
      .is("gcal_event_id", null);

    let pushed = 0;
    for (const evt of unpushedRows ?? []) {
      try {
        const resource = {
          summary: evt.title,
          description: evt.description ?? undefined,
          location: evt.location ?? undefined,
          start: evt.all_day
            ? { date: evt.start_at.slice(0, 10) }
            : { dateTime: evt.start_at },
          end: evt.all_day
            ? { date: (evt.end_at ?? evt.start_at).slice(0, 10) }
            : { dateTime: evt.end_at ?? evt.start_at },
          extendedProperties: { private: { source: "shaadiapp", local_id: evt.id } },
        };
        const { data: created } = await cal.events.insert({ calendarId, requestBody: resource });
        if (created?.id) {
          await supabase
            .from("calendar_events")
            .update({ gcal_event_id: created.id })
            .eq("id", evt.id);
          pushed++;
        }
      } catch {
        // Skip individual push failures — non-fatal
      }
    }

    if (refreshedTokens.access_token) {
      await supabase
        .from("google_calendar_tokens")
        .update({
          access_token: refreshedTokens.access_token,
          expiry_date: refreshedTokens.expiry_date ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    const { data: cachedEvents } = await supabase
      .from("google_calendar_cached_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true });

    return NextResponse.json({
      success: true,
      pulled: gcalOnlyItems.length,
      pushed,
      removed: orphanedLocalIds.length,
      syncedAt: new Date().toISOString(),
      events: cachedEvents ?? [],
    });
  } catch (err) {
    console.error("[calendar/google/sync]", err);
    return NextResponse.json(
      { error: "Sync failed. Try reconnecting Google Calendar." },
      { status: 500 },
    );
  }
}
