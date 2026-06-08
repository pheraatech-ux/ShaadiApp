import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  CalendarEventRow,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  GoogleCalCachedEvent,
  GoogleCalStatus,
} from "@/components/app-dashboard/calendar/types";

export const calendarQueryKey = () => ["calendar-events"] as const;

async function fetchCalendarEvents(): Promise<CalendarEventRow[]> {
  const res = await fetch("/api/calendar", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch calendar events");
  const data = (await res.json()) as { events: CalendarEventRow[] };
  return data.events;
}

export function useCalendarQuery(initialData: CalendarEventRow[]) {
  return useQuery({
    queryKey: calendarQueryKey(),
    queryFn: fetchCalendarEvents,
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCalendarEventInput): Promise<CalendarEventRow> => {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to create event");
      }
      const data = (await res.json()) as { event: CalendarEventRow };
      return data.event;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: calendarQueryKey() });
      const previous = queryClient.getQueryData<CalendarEventRow[]>(calendarQueryKey());
      const optimistic: CalendarEventRow = {
        id: `optimistic-${Date.now()}`,
        userId: "",
        title: input.title,
        description: input.description ?? null,
        startAt: input.startAt,
        endAt: input.endAt ?? null,
        allDay: input.allDay,
        color: input.color ?? null,
        weddingId: input.weddingId ?? null,
        eventType: input.eventType ?? "personal",
        location: input.location ?? null,
        attendeeIds: input.attendeeIds ?? [],
        guestEmails: input.guestEmails ?? [],
        gcalEventId: null,
        isAttendee: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<CalendarEventRow[]>(calendarQueryKey(), (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarQueryKey(), context.previous);
      }
      toast.error("Failed to create event");
    },
    onSuccess: () => {
      toast.success("Event created");
      queryClient.invalidateQueries({ queryKey: calendarQueryKey() });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateCalendarEventInput & { id: string }): Promise<CalendarEventRow> => {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to update event");
      }
      const data = (await res.json()) as { event: CalendarEventRow };
      return data.event;
    },
    onMutate: async ({ id, ...input }) => {
      await queryClient.cancelQueries({ queryKey: calendarQueryKey() });
      const previous = queryClient.getQueryData<CalendarEventRow[]>(calendarQueryKey());
      queryClient.setQueryData<CalendarEventRow[]>(calendarQueryKey(), (old) =>
        (old ?? []).map((e) =>
          e.id === id
            ? {
                ...e,
                ...(input.title !== undefined && { title: input.title }),
                ...(input.startAt !== undefined && { startAt: input.startAt }),
                ...(input.endAt !== undefined && { endAt: input.endAt }),
                ...(input.allDay !== undefined && { allDay: input.allDay }),
                ...(input.color !== undefined && { color: input.color }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.weddingId !== undefined && { weddingId: input.weddingId }),
              }
            : e,
        ),
      );
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarQueryKey(), context.previous);
      }
      toast.error("Failed to update event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarQueryKey() });
    },
  });
}

// ── Google Calendar ────────────────────────────────────────────────────────────

export const gcalStatusQueryKey = () => ["gcal-status"] as const;
export const gcalEventsQueryKey = () => ["gcal-events"] as const;

export function useGoogleCalStatus(initialStatus: GoogleCalStatus) {
  return useQuery({
    queryKey: gcalStatusQueryKey(),
    queryFn: async (): Promise<GoogleCalStatus> => {
      const res = await fetch("/api/auth/google-calendar/status", { credentials: "include" });
      if (!res.ok) return { connected: false, email: null, connectedAt: null };
      return res.json() as Promise<GoogleCalStatus>;
    },
    initialData: initialStatus,
    initialDataUpdatedAt: Date.now(),
    staleTime: 60 * 1000,
  });
}

export function useGoogleCalSync(initialEvents: GoogleCalCachedEvent[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: gcalEventsQueryKey(),
    queryFn: async (): Promise<GoogleCalCachedEvent[]> => {
      // Return cached data — actual sync is triggered imperatively
      return queryClient.getQueryData<GoogleCalCachedEvent[]>(gcalEventsQueryKey()) ?? initialEvents;
    },
    initialData: initialEvents,
    initialDataUpdatedAt: Date.now(),
    staleTime: Infinity,
  });

  const sync = useMutation({
    mutationFn: async (): Promise<{
      pulled: number;
      pushed: number;
      removed: number;
      syncedAt: string;
      events: GoogleCalCachedEvent[];
    }> => {
      const res = await fetch("/api/calendar/google/sync", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Sync failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      type RawRow = {
        id: string; user_id: string; title: string; description: string | null;
        start_at: string; end_at: string | null; all_day: boolean;
        location: string | null; html_link: string | null;
        calendar_id: string; synced_at: string;
      };
      const mapped: GoogleCalCachedEvent[] = (data.events as unknown as RawRow[]).map((r) => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        description: r.description,
        startAt: r.start_at,
        endAt: r.end_at,
        allDay: r.all_day,
        location: r.location,
        htmlLink: r.html_link,
        calendarId: r.calendar_id,
        syncedAt: r.synced_at,
      }));
      queryClient.setQueryData<GoogleCalCachedEvent[]>(gcalEventsQueryKey(), mapped);
      void queryClient.invalidateQueries({ queryKey: calendarQueryKey() });
      const parts = [`${data.pulled} from Google Calendar`];
      if (data.pushed > 0) parts.push(`${data.pushed} pushed`);
      if (data.removed > 0) parts.push(`${data.removed} removed`);
      toast.success(`Synced: ${parts.join(", ")}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const disconnect = useMutation({
    mutationFn: async (): Promise<void> => {
      const res = await fetch("/api/auth/google-calendar/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
    },
    onSuccess: () => {
      queryClient.setQueryData<GoogleCalCachedEvent[]>(gcalEventsQueryKey(), []);
      queryClient.invalidateQueries({ queryKey: gcalStatusQueryKey() });
      toast.success("Google Calendar disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect Google Calendar");
    },
  });

  return { events: query.data ?? initialEvents, sync, disconnect };
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: calendarQueryKey() });
      const previous = queryClient.getQueryData<CalendarEventRow[]>(calendarQueryKey());
      queryClient.setQueryData<CalendarEventRow[]>(calendarQueryKey(), (old) =>
        (old ?? []).filter((e) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(calendarQueryKey(), context.previous);
      }
      toast.error("Failed to delete event");
    },
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: calendarQueryKey() });
    },
  });
}
