"use client";

import { useCallback, useState } from "react";
import { CalendarDays, CalendarCheck, ClipboardList, BookHeart, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CalendarView } from "@/components/app-dashboard/calendar/calendar-view";
import { EventFormDialog } from "@/components/app-dashboard/calendar/event-form-dialog";
import {
  useCalendarQuery,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "@/components/app-dashboard/calendar/use-calendar-query";
import type { CalendarEventRow, CalendarViewModel } from "@/components/app-dashboard/calendar/types";

type Props = {
  view: CalendarViewModel;
};

export function CalendarWorkspace({ view }: Props) {
  const { data: personalEvents } = useCalendarQuery(view.personalEvents);

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEventRow | null>(null);

  const isMutating = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  const today = new Date().toISOString().slice(0, 10);
  const oneWeekOut = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const upcomingCount = personalEvents.filter((e) => e.startAt >= today).length;
  const thisWeekCount = personalEvents.filter((e) => e.startAt >= today && e.startAt <= oneWeekOut).length;

  const openNewEventDialog = useCallback(() => {
    setEditingEvent(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setDialogOpen(true);
  }, []);

  const handleSelectSlot = useCallback((date: string, time?: string) => {
    setEditingEvent(null);
    setSelectedDate(date);
    setSelectedTime(time);
    setDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEventRow) => {
    setEditingEvent(event);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: Parameters<typeof createEvent.mutate>[0]) => {
      if (editingEvent) {
        updateEvent.mutate(
          { id: editingEvent.id, ...data },
          { onSuccess: () => setDialogOpen(false) },
        );
      } else {
        createEvent.mutate(data, { onSuccess: () => setDialogOpen(false) });
      }
    },
    [editingEvent, createEvent, updateEvent],
  );

  const handleDelete = useCallback(() => {
    if (!editingEvent) return;
    deleteEvent.mutate(editingEvent.id, { onSuccess: () => setDialogOpen(false) });
  }, [editingEvent, deleteEvent]);

  const handleEventDrop = useCallback(
    (id: string, startAt: string, endAt: string | null) => {
      updateEvent.mutate({ id, startAt, endAt: endAt ?? undefined });
    },
    [updateEvent],
  );

  const handleEventResize = useCallback(
    (id: string, startAt: string, endAt: string) => {
      updateEvent.mutate({ id, startAt, endAt });
    },
    [updateEvent],
  );

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="size-4 text-indigo-400" />}
          label="Personal Events"
          value={upcomingCount}
          sub="upcoming"
        />
        <StatCard
          icon={<CalendarCheck className="size-4 text-sky-400" />}
          label="This Week"
          value={thisWeekCount}
          sub="events"
        />
        <StatCard
          icon={<ClipboardList className="size-4 text-amber-400" />}
          label="Task Deadlines"
          value={view.taskDeadlines.length}
          sub="open tasks with dates"
        />
        <StatCard
          icon={<BookHeart className="size-4 text-emerald-400" />}
          label="Weddings"
          value={view.weddingDates.length}
          sub="on your calendar"
        />
      </section>

      {/* Legend + New Event button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <LegendDot color="#6366f1" label="Personal events" />
          <LegendDot color="#10b981" label="Wedding days" />
          <LegendDot color="#ec4899" label="Ceremony events" />
          <LegendDot color="#f59e0b" label="Task deadlines" />
        </div>
        <Button size="sm" className="h-8 rounded-xl gap-1.5 shrink-0" onClick={openNewEventDialog}>
          <Plus className="size-3.5" />
          New Event
        </Button>
      </div>

      {/* Calendar */}
      <CalendarView
        personalEvents={personalEvents}
        weddingDates={view.weddingDates}
        ceremonyEvents={view.ceremonyEvents}
        taskDeadlines={view.taskDeadlines}
        onSelectSlot={handleSelectSlot}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialDate={selectedDate}
        initialTime={selectedTime}
        event={editingEvent}
        weddings={view.weddings.map((w) => ({ id: w.id, name: w.name }))}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
        isSaving={isMutating}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <article className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </article>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
