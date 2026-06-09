"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CalendarCheck, ClipboardList, BookHeart } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

import { CalendarAiInput } from "@/components/app-dashboard/calendar/calendar-ai-input";
import { CalendarView } from "@/components/app-dashboard/calendar/calendar-view";
import { EventFormDialog } from "@/components/app-dashboard/calendar/event-form-dialog";
import { EventDetailModal } from "@/components/app-dashboard/calendar/event-detail-modal";
import {
  useCalendarQuery,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useGoogleCalSync,
} from "@/components/app-dashboard/calendar/use-calendar-query";
import type { AnyCalendarEvent, CalendarEventRow, CalendarViewModel } from "@/components/app-dashboard/calendar/types";

type Props = {
  view: CalendarViewModel;
  showAiInput?: boolean;
};

export function CalendarWorkspace({ view, showAiInput = true }: Props) {
  const searchParams = useSearchParams();
  const { data: personalEvents } = useCalendarQuery(view.personalEvents);
  const { events: googleCalEvents, sync, disconnect } = useGoogleCalSync(view.googleCalEvents);

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [editingEvent, setEditingEvent] = useState<CalendarEventRow | null>(null);
  const [clickedEvent, setClickedEvent] = useState<AnyCalendarEvent | null>(null);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const isMutating = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  const syncMutate = sync.mutate;

  // Show toast when Google Calendar connects/errors via OAuth redirect
  useEffect(() => {
    if (searchParams.get("gcal_connected") === "1") {
      toast.success("Google Calendar connected!");
      window.history.replaceState({}, "", window.location.pathname);
      syncMutate();
    } else if (searchParams.get("gcal_error")) {
      toast.error("Google Calendar connection failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, syncMutate]);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const today = todayDate.toISOString().slice(0, 10);
  const oneWeekOutDate = new Date(todayDate);
  oneWeekOutDate.setDate(oneWeekOutDate.getDate() + 7);
  const oneWeekOut = oneWeekOutDate.toISOString();

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

  const handleEventClick = useCallback((anyEvent: AnyCalendarEvent, el: Element) => {
    setClickedEvent(anyEvent);
    setAnchorEl(el);
    setDetailOpen(true);
  }, []);

  const handleDetailEdit = useCallback(() => {
    if (!clickedEvent || (clickedEvent.source !== "personal" && clickedEvent.source !== "attendee")) return;
    setEditingEvent(clickedEvent.event as CalendarEventRow);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setDialogOpen(true);
  }, [clickedEvent]);

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

  const handleDetailDelete = useCallback(() => {
    if (!clickedEvent || clickedEvent.source !== "personal") return;
    const event = clickedEvent.event as CalendarEventRow;
    deleteEvent.mutate(event.id, { onSuccess: () => setDetailOpen(false) });
  }, [clickedEvent, deleteEvent]);

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

      {/* Calendar */}
      <CalendarView
        personalEvents={personalEvents}
        weddingDates={view.weddingDates}
        ceremonyEvents={view.ceremonyEvents}
        taskDeadlines={view.taskDeadlines}
        googleCalEvents={googleCalEvents}
        googleCalStatus={view.googleCalStatus}
        sync={sync}
        disconnect={disconnect}
        onNewEvent={openNewEventDialog}
        headerActions={
          showAiInput ? (
            <CalendarAiInput
              existingEvents={personalEvents}
              vendors={view.vendors}
              employees={view.employees}
              weddings={view.weddings.map((w) => ({ id: w.id, name: w.name }))}
              onConfirmCreate={(input) => createEvent.mutate(input)}
              onConfirmUpdate={(id, input) => updateEvent.mutate({ id, ...input })}
            />
          ) : undefined
        }
        onSelectSlot={handleSelectSlot}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />

      <EventDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        clickedEvent={clickedEvent}
        anchorEl={anchorEl}
        employees={view.employees}
        onEdit={handleDetailEdit}
        onDelete={handleDetailDelete}
        isDeleting={deleteEvent.isPending}
      />

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialDate={selectedDate}
        initialTime={selectedTime}
        event={editingEvent}
        weddings={view.weddings.map((w) => ({ id: w.id, name: w.name }))}
        employees={view.employees}
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
