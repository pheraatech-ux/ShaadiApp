import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { UpdateCalendarEventInput } from "@/components/app-dashboard/calendar/types";

type RouteContext = { params: Promise<{ id: string }> };

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

    const { data, error } = await supabase
      .from("calendar_events")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

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
    });
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
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete calendar event." }, { status: 500 });
  }
}
