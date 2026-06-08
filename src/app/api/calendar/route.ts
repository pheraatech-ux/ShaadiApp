import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { pushNewEventToGcal } from "@/lib/google-calendar/push-helpers";
import type { CreateCalendarEventInput } from "@/components/app-dashboard/calendar/types";

function mapRow(r: {
  id: string; user_id: string; title: string; description: string | null;
  start_at: string; end_at: string | null; all_day: boolean; color: string | null;
  wedding_id: string | null; event_type: string; location: string | null;
  attendee_ids: string[]; guest_emails: string[]; gcal_event_id?: string | null;
  created_at: string; updated_at: string;
}, isAttendee = false) {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    startAt: r.start_at,
    endAt: r.end_at,
    allDay: r.all_day,
    color: r.color,
    weddingId: r.wedding_id,
    eventType: r.event_type,
    location: r.location,
    attendeeIds: r.attendee_ids ?? [],
    guestEmails: r.guest_emails ?? [],
    gcalEventId: r.gcal_event_id ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isAttendee,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    // Own events + find if this user is an employee anywhere
    const [{ data, error }, { data: myEmployeeRecord }] = await Promise.all([
      supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_at", { ascending: true }),
      supabase
        .from("company_employees")
        .select("id, owner_user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (error) throw error;

    const ownEvents = (data ?? []).map((r) => mapRow(r, false));

    // Events the user was invited to as an employee
    const attendedEvents = myEmployeeRecord?.id
      ? await supabase
          .from("calendar_events")
          .select("*")
          .contains("attendee_ids", [myEmployeeRecord.id])
          .neq("user_id", user.id)
          .order("start_at", { ascending: true })
          .then(({ data: d }) => (d ?? []).map((r) => mapRow(r, true)))
      : [];

    return NextResponse.json({ events: [...ownEvents, ...attendedEvents] });
  } catch {
    return NextResponse.json({ error: "Unable to fetch calendar events." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = (await request.json()) as CreateCalendarEventInput;

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body.startAt) {
      return NextResponse.json({ error: "Start date is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        title: body.title.trim(),
        description: body.description ?? null,
        start_at: body.startAt,
        end_at: body.endAt ?? null,
        all_day: body.allDay ?? false,
        color: body.color ?? null,
        wedding_id: body.weddingId ?? null,
        event_type: body.eventType ?? "personal",
        location: body.location ?? null,
        attendee_ids: body.attendeeIds ?? [],
        guest_emails: body.guestEmails ?? [],
      })
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: push to Google Calendar if the user has it connected
    void pushNewEventToGcal(supabase, user.id, {
      id: data.id,
      title: data.title,
      description: data.description,
      start_at: data.start_at,
      end_at: data.end_at,
      all_day: data.all_day,
      location: data.location,
      gcal_event_id: data.gcal_event_id ?? null,
    }, request.url).catch(() => {});

    return NextResponse.json({ event: mapRow(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create calendar event." }, { status: 500 });
  }
}
