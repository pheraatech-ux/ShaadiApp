import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlannerContext, getAccessibleWeddingIds } from "@/lib/data/app-data";
import type { CalendarViewModel, CalendarVendorContext } from "@/components/app-dashboard/calendar/types";

export const getCalendarView = cache(async (): Promise<CalendarViewModel> => {
  const [planner, weddingIds] = await Promise.all([
    getPlannerContext(),
    getAccessibleWeddingIds(),
  ]);

  const supabase = await createSupabaseServerClient();

  const [
    { data: weddingRows },
    { data: ceremonyRows },
    { data: taskRows },
    { data: personalRows },
    { data: vendorRows },
  ] = await Promise.all([
    supabase
      .from("weddings")
      .select("id, slug, couple_name, wedding_date")
      .in("id", weddingIds.length ? weddingIds : ["__none__"]),
    supabase
      .from("wedding_events")
      .select("id, wedding_id, title, event_date, start_time, end_time, culture_label")
      .in("wedding_id", weddingIds.length ? weddingIds : ["__none__"])
      .not("event_date", "is", null),
    supabase
      .from("tasks")
      .select("id, wedding_id, title, due_date, status, priority")
      .in("wedding_id", weddingIds.length ? weddingIds : ["__none__"])
      .not("due_date", "is", null)
      .neq("status", "done"),
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", planner.userId)
      .order("start_at", { ascending: true }),
    supabase
      .from("vendors")
      .select("id, name, category, wedding_id")
      .in("wedding_id", weddingIds.length ? weddingIds : ["__none__"]),
  ]);

  const weddingNameById = new Map(
    (weddingRows ?? []).map((w) => [w.id, w.couple_name]),
  );

  return {
    currentUserId: planner.userId,
    personalEvents: (personalRows ?? []).map((r) => ({
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
    })),
    weddingDates: (weddingRows ?? [])
      .filter((w) => Boolean(w.wedding_date))
      .map((w) => ({
        id: w.id,
        title: `${w.couple_name} — Wedding Day`,
        date: w.wedding_date as string,
      })),
    ceremonyEvents: (ceremonyRows ?? []).map((e) => ({
      id: e.id,
      weddingId: e.wedding_id,
      weddingName: weddingNameById.get(e.wedding_id) ?? "Wedding",
      title: e.title,
      date: e.event_date as string,
      startTime: e.start_time,
      endTime: e.end_time,
      cultureLabel: e.culture_label,
    })),
    taskDeadlines: (taskRows ?? []).map((t) => ({
      id: t.id,
      weddingId: t.wedding_id,
      weddingName: weddingNameById.get(t.wedding_id) ?? "Wedding",
      title: t.title,
      dueDate: t.due_date as string,
      status: t.status,
      priority: t.priority,
    })),
    weddings: (weddingRows ?? []).map((w) => ({
      id: w.id,
      slug: w.slug,
      name: w.couple_name,
    })),
    vendors: (vendorRows ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      weddingName: weddingNameById.get(v.wedding_id) ?? "Wedding",
    })),
  };
});
