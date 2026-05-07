import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  CalendarEventRow,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
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
