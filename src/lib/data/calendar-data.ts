import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlannerContext, getAccessibleWeddingIds } from "@/lib/data/app-data";
import type { CalendarViewModel, CalendarVendorContext } from "@/components/app-dashboard/calendar/types";

function mapRow(r: {
  id: string; user_id: string; title: string; description: string | null;
  start_at: string; end_at: string | null; all_day: boolean; color: string | null;
  wedding_id: string | null; event_type: string; location: string | null;
  attendee_ids: string[]; guest_emails: string[]; created_at: string; updated_at: string;
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
    location: r.location ?? null,
    attendeeIds: r.attendee_ids ?? [],
    guestEmails: r.guest_emails ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    isAttendee,
  };
}

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
    { data: employeeRows },
    { data: myEmployeeRecord },
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
    supabase
      .from("company_employees")
      .select("id, name, role")
      .eq("owner_user_id", planner.userId)
      .order("name", { ascending: true }),
    // Find this user's own employee record (they might be an employee of someone else)
    supabase
      .from("company_employees")
      .select("id, owner_user_id")
      .eq("user_id", planner.userId)
      .maybeSingle(),
  ]);

  // If the user is an employee, show all peers from that company (not just their own employees)
  const companyOwnerUserId = myEmployeeRecord?.owner_user_id ?? null;
  const peersQuery = companyOwnerUserId
    ? await supabase
        .from("company_employees")
        .select("id, name, role")
        .eq("owner_user_id", companyOwnerUserId)
        .order("name", { ascending: true })
        .then(({ data }) => data ?? [])
    : [];

  // If the user is registered as an employee, fetch events they were invited to
  const attendedRows = myEmployeeRecord?.id
    ? await supabase
        .from("calendar_events")
        .select("*")
        .contains("attendee_ids", [myEmployeeRecord.id])
        .neq("user_id", planner.userId) // exclude own events already fetched
        .order("start_at", { ascending: true })
        .then(({ data }) => data ?? [])
    : [];

  const weddingNameById = new Map(
    (weddingRows ?? []).map((w) => [w.id, w.couple_name]),
  );

  const ownEvents = (personalRows ?? []).map((r) => mapRow(r, false));
  const invitedEvents = attendedRows.map((r) => mapRow(r, true));

  return {
    currentUserId: planner.userId,
    personalEvents: [...ownEvents, ...invitedEvents],
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
    // Admin sees employees they own; employee sees all peers in their company.
    // Deduplicate by id in case the user is both an owner and a peer.
    employees: (() => {
      const owned = (employeeRows ?? []).map((e) => ({ id: e.id, name: e.name, role: e.role }));
      const peers = peersQuery.map((e) => ({ id: e.id, name: e.name, role: e.role }));
      const seen = new Set<string>();
      return [...owned, ...peers].filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
    })(),
  };
});
