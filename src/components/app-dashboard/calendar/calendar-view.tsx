"use client";

import { useCallback, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type {
  EventClickArg,
  EventDropArg,
  DateSelectArg,
  EventInput,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";

import type {
  CalendarEventRow,
  CalendarCeremonyEvent,
  CalendarTaskDeadline,
  CalendarWeddingDate,
} from "@/components/app-dashboard/calendar/types";

type Props = {
  personalEvents: CalendarEventRow[];
  weddingDates: CalendarWeddingDate[];
  ceremonyEvents: CalendarCeremonyEvent[];
  taskDeadlines: CalendarTaskDeadline[];
  onSelectSlot: (date: string, time?: string) => void;
  onEventClick: (event: CalendarEventRow) => void;
  onEventDrop: (id: string, startAt: string, endAt: string | null) => void;
  onEventResize: (id: string, startAt: string, endAt: string) => void;
};

const PERSONAL_COLOR = "#6366f1";
const CEREMONY_COLOR = "#ec4899";
const TASK_COLOR = "#f59e0b";
const WEDDING_COLOR = "#10b981";

export function CalendarView({
  personalEvents,
  weddingDates,
  ceremonyEvents,
  taskDeadlines,
  onSelectSlot,
  onEventClick,
  onEventDrop,
  onEventResize,
}: Props) {
  const calRef = useRef<FullCalendar>(null);

  const events: EventInput[] = useMemo(() => {
    const items: EventInput[] = [];

    for (const e of personalEvents) {
      if (e.isAttendee) {
        items.push({
          id: e.id,
          title: e.title,
          start: e.startAt,
          end: e.endAt ?? undefined,
          allDay: e.allDay,
          backgroundColor: (e.color ?? PERSONAL_COLOR) + "80",
          borderColor: e.color ?? PERSONAL_COLOR,
          textColor: "#ffffff",
          editable: false,
          classNames: ["fc-attendee-event"],
          extendedProps: { source: "attendee", raw: e },
        });
      } else {
        items.push({
          id: e.id,
          title: e.title,
          start: e.startAt,
          end: e.endAt ?? undefined,
          allDay: e.allDay,
          backgroundColor: e.color ?? PERSONAL_COLOR,
          borderColor: e.color ?? PERSONAL_COLOR,
          editable: true,
          extendedProps: { source: "personal", raw: e },
        });
      }
    }

    for (const w of weddingDates) {
      items.push({
        id: `wedding-${w.id}`,
        title: w.title,
        start: w.date,
        allDay: true,
        backgroundColor: WEDDING_COLOR,
        borderColor: WEDDING_COLOR,
        editable: false,
        extendedProps: { source: "wedding" },
      });
    }

    for (const c of ceremonyEvents) {
      const start = c.startTime ? `${c.date}T${c.startTime}` : c.date;
      const end = c.endTime ? `${c.date}T${c.endTime}` : undefined;
      items.push({
        id: `ceremony-${c.id}`,
        title: c.cultureLabel ? `${c.cultureLabel}: ${c.title}` : c.title,
        start,
        end,
        allDay: !c.startTime,
        backgroundColor: CEREMONY_COLOR,
        borderColor: CEREMONY_COLOR,
        editable: false,
        extendedProps: { source: "ceremony" },
      });
    }

    for (const t of taskDeadlines) {
      items.push({
        id: `task-${t.id}`,
        title: `📋 ${t.title}`,
        start: t.dueDate,
        allDay: true,
        backgroundColor: TASK_COLOR,
        borderColor: TASK_COLOR,
        editable: false,
        extendedProps: { source: "task" },
      });
    }

    return items;
  }, [personalEvents, weddingDates, ceremonyEvents, taskDeadlines]);

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      const isTimeGrid = arg.view.type.startsWith("timeGrid");
      onSelectSlot(
        arg.dateStr.slice(0, 10),
        isTimeGrid ? arg.dateStr.slice(11, 16) : undefined,
      );
    },
    [onSelectSlot],
  );

  const handleSelect = useCallback(
    (arg: DateSelectArg) => {
      const isTimeGrid = arg.view.type.startsWith("timeGrid");
      onSelectSlot(
        arg.startStr.slice(0, 10),
        isTimeGrid ? arg.startStr.slice(11, 16) : undefined,
      );
    },
    [onSelectSlot],
  );

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const source = arg.event.extendedProps.source as string;
      if (source !== "personal" && source !== "attendee") return;
      const raw = arg.event.extendedProps.raw as CalendarEventRow;
      onEventClick(raw);
    },
    [onEventClick],
  );

  const handleEventDrop = useCallback(
    (arg: EventDropArg) => {
      const id = arg.event.id;
      const startAt = arg.event.startStr;
      const endAt = arg.event.endStr || null;
      onEventDrop(id, startAt, endAt);
    },
    [onEventDrop],
  );

  const handleEventResize = useCallback(
    (arg: EventResizeDoneArg) => {
      const id = arg.event.id;
      const startAt = arg.event.startStr;
      const endAt = arg.event.endStr;
      onEventResize(id, startAt, endAt);
    },
    [onEventResize],
  );

  return (
    <div className="calendar-wrapper rounded-xl border border-border/70 bg-card p-3 sm:p-4">
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        height="auto"
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        weekends={true}
        nowIndicator={true}
        dateClick={handleDateClick}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          meridiem: "short",
        }}
      />
    </div>
  );
}
