import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type EventRow = {
  id: string;
  title: string;
  event_date: string | null;
  culture_label: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  venue_address: string | null;
  notes: string | null;
  created_at: string;
};

async function getWeddingIdBySlug(request: NextRequest, weddingSlug: string) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorResponse: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();

  if (error || !wedding) return { errorResponse: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };

  return { supabase, weddingId: wedding.id, userId: user.id };
}

function rowToEvent(e: EventRow) {
  return {
    id: e.id,
    title: e.title,
    eventDate: e.event_date ?? null,
    cultureLabel: e.culture_label ?? null,
    startTime: e.start_time ?? null,
    endTime: e.end_time ?? null,
    venue: e.venue ?? null,
    venueAddress: e.venue_address ?? null,
    notes: e.notes ?? null,
    createdAt: e.created_at,
  };
}

const SELECT_COLS = "id, title, event_date, culture_label, start_time, end_time, venue, venue_address, notes, created_at";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId } = lookup;

    const { data, error } = await supabase
      .from("wedding_events")
      .select(SELECT_COLS)
      .eq("wedding_id", weddingId)
      .order("event_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ events: (data ?? []).map((e) => rowToEvent(e as EventRow)) });
  } catch {
    return NextResponse.json({ error: "Unable to fetch events." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const body = (await request.json()) as {
      title?: string;
      eventDate?: string | null;
      cultureLabel?: string | null;
      startTime?: string | null;
      endTime?: string | null;
      venue?: string | null;
      venueAddress?: string | null;
      notes?: string | null;
    };

    const title = body.title?.trim();
    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId } = lookup;

    const { data, error } = await supabase
      .from("wedding_events")
      .insert({
        wedding_id: weddingId,
        title,
        event_date: body.eventDate ?? null,
        culture_label: body.cultureLabel ?? null,
        start_time: body.startTime ?? null,
        end_time: body.endTime ?? null,
        venue: body.venue?.trim() ?? null,
        venue_address: body.venueAddress?.trim() ?? null,
        notes: body.notes?.trim() ?? null,
      })
      .select(SELECT_COLS)
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message ?? "Unable to create event." }, { status: 400 });

    return NextResponse.json({ event: rowToEvent(data as EventRow) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create event." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const body = (await request.json()) as {
      eventId?: string;
      title?: string;
      eventDate?: string | null;
      cultureLabel?: string | null;
      startTime?: string | null;
      endTime?: string | null;
      venue?: string | null;
      venueAddress?: string | null;
      notes?: string | null;
    };

    if (!body.eventId) return NextResponse.json({ error: "eventId is required." }, { status: 400 });

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId } = lookup;

    const updates: {
      title?: string;
      event_date?: string | null;
      culture_label?: string | null;
      start_time?: string | null;
      end_time?: string | null;
      venue?: string | null;
      venue_address?: string | null;
      notes?: string | null;
    } = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (body.eventDate !== undefined) updates.event_date = body.eventDate ?? null;
    if (body.cultureLabel !== undefined) updates.culture_label = body.cultureLabel ?? null;
    if (body.startTime !== undefined) updates.start_time = body.startTime ?? null;
    if (body.endTime !== undefined) updates.end_time = body.endTime ?? null;
    if (body.venue !== undefined) updates.venue = body.venue?.trim() ?? null;
    if (body.venueAddress !== undefined) updates.venue_address = body.venueAddress?.trim() ?? null;
    if (body.notes !== undefined) updates.notes = body.notes?.trim() ?? null;

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No updates provided." }, { status: 400 });

    const { error } = await supabase
      .from("wedding_events")
      .update(updates)
      .eq("id", body.eventId)
      .eq("wedding_id", weddingId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update event." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { eventId?: string };
    if (!body.eventId) return NextResponse.json({ error: "eventId is required." }, { status: 400 });

    const lookup = await getWeddingIdBySlug(request, weddingSlug);
    if ("errorResponse" in lookup) return lookup.errorResponse;
    const { supabase, weddingId } = lookup;

    const { error } = await supabase
      .from("wedding_events")
      .delete()
      .eq("id", body.eventId)
      .eq("wedding_id", weddingId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete event." }, { status: 500 });
  }
}
