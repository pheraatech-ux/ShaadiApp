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
  NowIndicatorContentArg,
  DayHeaderContentArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";

import type {
  CalendarEventRow,
  CalendarCeremonyEvent,
  CalendarTaskDeadline,
  CalendarWeddingDate,
  GoogleCalCachedEvent,
  AnyCalendarEvent,
} from "@/components/app-dashboard/calendar/types";

type Props = {
  personalEvents: CalendarEventRow[];
  weddingDates: CalendarWeddingDate[];
  ceremonyEvents: CalendarCeremonyEvent[];
  taskDeadlines: CalendarTaskDeadline[];
  googleCalEvents?: GoogleCalCachedEvent[];
  onSelectSlot: (date: string, time?: string) => void;
  onEventClick: (event: AnyCalendarEvent, anchorEl: Element) => void;
  onEventDrop: (id: string, startAt: string, endAt: string | null) => void;
  onEventResize: (id: string, startAt: string, endAt: string) => void;
};

const PERSONAL_COLOR = "#6366f1";
const CEREMONY_COLOR = "#ec4899";
const TASK_COLOR = "#f59e0b";
const WEDDING_COLOR = "#10b981";
const GCAL_COLOR = "#4285F4";

function formatNowTime(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes();
  const ampm = d.getHours() < 12 ? "am" : "pm";
  return m === 0 ? `${h}${ampm}` : `${h}:${String(m).padStart(2, "0")}${ampm}`;
}

export function CalendarView({
  personalEvents,
  weddingDates,
  ceremonyEvents,
  taskDeadlines,
  googleCalEvents = [],
  onSelectSlot,
  onEventClick,
  onEventDrop,
  onEventResize,
}: Props) {
  const calRef = useRef<FullCalendar>(null);

  const renderDayHeader = useCallback((arg: DayHeaderContentArg) => {
    if (!arg.view.type.startsWith("timeGrid")) return <>{arg.text}</>;
    const day = arg.date.toLocaleDateString("en-US", { weekday: "long" });
    const dd = String(arg.date.getDate()).padStart(2, "0");
    const mm = String(arg.date.getMonth() + 1).padStart(2, "0");
    return (
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <span className="cal-day-name">{day}</span>
        <span className="cal-day-date">{dd}.{mm}</span>
      </span>
    );
  }, []);

  const renderNowIndicator = useCallback((arg: NowIndicatorContentArg) => {
    if (!arg.isAxis) return null;
    return <span className="fc-now-pill">{formatNowTime(arg.date)}</span>;
  }, []);

  const events: EventInput[] = useMemo(() => {
    const items: EventInput[] = [];

    for (const e of googleCalEvents) {
      items.push({
        id: `gcal-${e.id}`,
        title: e.title,
        start: e.startAt,
        end: e.endAt ?? undefined,
        allDay: e.allDay,
        backgroundColor: GCAL_COLOR + "cc",
        borderColor: GCAL_COLOR,
        textColor: "#ffffff",
        editable: false,
        extendedProps: { source: "gcal", raw: e },
      });
    }

    for (const e of personalEvents) {
      items.push({
        id: e.id,
        title: e.title,
        start: e.startAt,
        end: e.endAt ?? undefined,
        allDay: e.allDay,
        backgroundColor: e.isAttendee ? (e.color ?? PERSONAL_COLOR) + "80" : (e.color ?? PERSONAL_COLOR),
        borderColor: e.color ?? PERSONAL_COLOR,
        textColor: "#ffffff",
        editable: true,
        extendedProps: { source: e.isAttendee ? "attendee" : "personal", raw: e },
      });
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
        extendedProps: { source: "wedding", raw: w },
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
        extendedProps: { source: "ceremony", raw: c },
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
        extendedProps: { source: "task", raw: t },
      });
    }

    return items;
  }, [personalEvents, weddingDates, ceremonyEvents, taskDeadlines, googleCalEvents]);

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
      const source = arg.event.extendedProps.source as AnyCalendarEvent["source"];
      const raw = arg.event.extendedProps.raw;
      if (!raw) return;
      onEventClick({ source, event: raw } as AnyCalendarEvent, arg.el);
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
        nowIndicatorContent={renderNowIndicator}
        dayHeaderContent={renderDayHeader}
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
