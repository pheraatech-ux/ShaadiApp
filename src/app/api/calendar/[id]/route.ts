import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { UpdateCalendarEventInput } from "@/components/app-dashboard/calendar/types";

type RouteContext = { params: Promise<{ id: string }> };

function mapRow(r: {
  id: string; user_id: string; title: string; description: string | null;
  start_at: string; end_at: string | null; all_day: boolean; color: string | null;
  wedding_id: string | null; event_type: string; location: string | null;
  attendee_ids: string[]; guest_emails: string[]; created_at: string; updated_at: string;
}) {
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
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = (await request.json()) as UpdateCalendarEventInput;

    const update: {
      title?: string;
      description?: string | null;
      start_at?: string;
      end_at?: string | null;
      all_day?: boolean;
      color?: string | null;
      wedding_id?: string | null;
      event_type?: string;
      location?: string | null;
      attendee_ids?: string[];
      guest_emails?: string[];
      updated_at?: string;
    } = { updated_at: new Date().toISOString() };

    if (body.title !== undefined) update.title = body.title.trim();
    if (body.description !== undefined) update.description = body.description;
    if (body.startAt !== undefined) update.start_at = body.startAt;
    if (body.endAt !== undefined) update.end_at = body.endAt;
    if (body.allDay !== undefined) update.all_day = body.allDay;
    if (body.color !== undefined) update.color = body.color;
    if (body.weddingId !== undefined) update.wedding_id = body.weddingId;
    if (body.eventType !== undefined) update.event_type = body.eventType;
    if (body.location !== undefined) update.location = body.location;
    if (body.attendeeIds !== undefined) update.attendee_ids = body.attendeeIds;
    if (body.guestEmails !== undefined) update.guest_emails = body.guestEmails;

    const { data, error } = await supabase
      .from("calendar_events")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

    return NextResponse.json({ event: mapRow(data) });
  } catch {
    return NextResponse.json({ error: "Unable to update calendar event." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete calendar event." }, { status: 500 });
  }
}
