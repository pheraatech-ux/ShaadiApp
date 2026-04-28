"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { WorkspaceTimelineEvent } from "@/components/wedding-workspace/overview/types";

export type EventData = {
  id: string;
  title: string;
  eventDate: string | null;
  cultureLabel: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  venueAddress: string | null;
  notes: string | null;
  createdAt?: string;
};

export function eventsQueryKey(weddingSlug: string) {
  return ["events", weddingSlug] as const;
}

function initialFromWorkspace(events: WorkspaceTimelineEvent[]): EventData[] {
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate,
    cultureLabel: e.tags[0] ?? null,
    startTime: null,
    endTime: null,
    venue: null,
    venueAddress: null,
    notes: null,
  }));
}

async function fetchEvents(weddingSlug: string): Promise<EventData[]> {
  const res = await fetch(`/api/weddings/${weddingSlug}/events`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch events");
  const data = (await res.json()) as { events: EventData[] };
  return data.events;
}

export function useEventsQuery(weddingSlug: string, initialEvents: WorkspaceTimelineEvent[]) {
  return useQuery({
    queryKey: eventsQueryKey(weddingSlug),
    queryFn: () => fetchEvents(weddingSlug),
    initialData: () => initialFromWorkspace(initialEvents),
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function sortByDate(events: EventData[]): EventData[] {
  return [...events].sort((a, b) => {
    if (!a.eventDate && !b.eventDate) return 0;
    if (!a.eventDate) return 1;
    if (!b.eventDate) return -1;
    return a.eventDate.localeCompare(b.eventDate);
  });
}

// ─── Add ──────────────────────────────────────────────────────────────────────

export type EventInput = Omit<EventData, "id" | "createdAt">;

export function useAddEvent(weddingSlug: string) {
  const queryClient = useQueryClient();
  const key = eventsQueryKey(weddingSlug);

  return useMutation({
    mutationFn: async (input: EventInput) => {
      const res = await fetch(`/api/weddings/${weddingSlug}/events`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          eventDate: input.eventDate,
          cultureLabel: input.cultureLabel,
          startTime: input.startTime,
          endTime: input.endTime,
          venue: input.venue,
          venueAddress: input.venueAddress,
          notes: input.notes,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to create event");
      }
      const data = (await res.json()) as { event: EventData };
      return data.event;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EventData[]>(key);

      const tempId = `temp-${Date.now()}`;
      const optimistic: EventData = { ...input, id: tempId };

      queryClient.setQueryData<EventData[]>(key, (old = []) =>
        sortByDate([...old, optimistic]),
      );

      toast.success(`"${input.title}" added`);
      return { previous, tempId };
    },
    onError: (_err, input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
      toast.error(`Failed to add "${input.title}"`);
    },
    onSuccess: (real, _input, ctx) => {
      queryClient.setQueryData<EventData[]>(key, (old = []) =>
        old.map((e) => (e.id === ctx?.tempId ? real : e)),
      );
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdateEventInput = EventInput & { eventId: string };

export function useUpdateEvent(weddingSlug: string) {
  const queryClient = useQueryClient();
  const key = eventsQueryKey(weddingSlug);

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const res = await fetch(`/api/weddings/${weddingSlug}/events`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: input.eventId,
          title: input.title,
          eventDate: input.eventDate,
          cultureLabel: input.cultureLabel,
          startTime: input.startTime,
          endTime: input.endTime,
          venue: input.venue,
          venueAddress: input.venueAddress,
          notes: input.notes,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to update event");
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EventData[]>(key);

      queryClient.setQueryData<EventData[]>(key, (old = []) =>
        sortByDate(
          old.map((e) =>
            e.id === input.eventId ? { ...e, ...input, id: input.eventId } : e,
          ),
        ),
      );

      toast.success("Event updated");
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
      toast.error("Failed to update event");
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteEvent(weddingSlug: string) {
  const queryClient = useQueryClient();
  const key = eventsQueryKey(weddingSlug);

  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/weddings/${weddingSlug}/events`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to delete event");
      }
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EventData[]>(key);
      const deleted = previous?.find((e) => e.id === eventId);

      queryClient.setQueryData<EventData[]>(key, (old = []) =>
        old.filter((e) => e.id !== eventId),
      );

      toast.success(deleted ? `"${deleted.title}" deleted` : "Event deleted");
      return { previous };
    },
    onError: (_err, _eventId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
      toast.error("Failed to delete event");
    },
  });
}
