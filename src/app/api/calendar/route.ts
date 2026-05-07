import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { CreateCalendarEventInput } from "@/components/app-dashboard/calendar/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true });

    if (error) throw error;

    const events = (data ?? []).map((r) => ({
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
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ events });
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
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      event: {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        startAt: data.start_at,
        endAt: data.end_at,
        allDay: data.all_day,
        color: data.color,
        weddingId: data.wedding_id,
        eventType: data.event_type,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create calendar event." }, { status: 500 });
  }
}
