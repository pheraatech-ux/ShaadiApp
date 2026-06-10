"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
  DatesSetArg,
  EventContentArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";

import type {
  CalendarEventRow,
  CalendarCeremonyEvent,
  CalendarTaskDeadline,
  CalendarWeddingDate,
  GoogleCalCachedEvent,
  GoogleCalStatus,
  AnyCalendarEvent,
} from "@/components/app-dashboard/calendar/types";
import {
  CalendarViewModeSelector,
  type CalendarViewMode,
} from "@/components/app-dashboard/calendar/calendar-view-mode-selector";
import {
  CalendarEventFilter,
  getDefaultEventFilters,
  type CalendarEventFilterType,
} from "@/components/app-dashboard/calendar/calendar-event-filter";
import { GoogleCalMenu, GoogleIcon } from "@/components/app-dashboard/calendar/google-cal-menu";
import { useToolbarScrollExpand } from "@/components/app-dashboard/use-toolbar-scroll-expand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UseMutationResult } from "@tanstack/react-query";

type GcalSyncResult = {
  pulled: number;
  pushed: number;
  removed: number;
  syncedAt: string;
};

type Props = {
  personalEvents: CalendarEventRow[];
  weddingDates: CalendarWeddingDate[];
  ceremonyEvents: CalendarCeremonyEvent[];
  taskDeadlines: CalendarTaskDeadline[];
  googleCalEvents?: GoogleCalCachedEvent[];
  googleCalStatus: GoogleCalStatus;
  sync: UseMutationResult<GcalSyncResult, Error, void, unknown>;
  disconnect: UseMutationResult<void, Error, void, unknown>;
  headerActions?: React.ReactNode;
  onNewEvent?: () => void;
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

function formatGcalEventLabel(start: Date, allDay: boolean): string {
  if (allDay) {
    return start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return start.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function CalendarView({
  personalEvents,
  weddingDates,
  ceremonyEvents,
  taskDeadlines,
  googleCalEvents = [],
  googleCalStatus,
  sync,
  disconnect,
  headerActions,
  onNewEvent,
  onSelectSlot,
  onEventClick,
  onEventDrop,
  onEventResize,
}: Props) {
  const calRef = useRef<FullCalendar>(null);
  const { shellRef, barRef, progress, layout, barHeight, isFloating, floatStyle } =
    useToolbarScrollExpand();
  const [currentView, setCurrentView] = useState<CalendarViewMode>("dayGridMonth");
  const [viewTitle, setViewTitle] = useState("");
  const [eventFilters, setEventFilters] = useState(() =>
    getDefaultEventFilters(googleCalStatus.connected),
  );

  const gcalVisible = eventFilters.has("gcal");

  const handleGcalVisibleChange = useCallback((visible: boolean) => {
    setEventFilters((prev) => {
      const next = new Set(prev);
      if (visible) {
        next.add("gcal");
      } else {
        next.delete("gcal");
      }
      return next;
    });
  }, []);

  const handleViewChange = useCallback((view: CalendarViewMode) => {
    calRef.current?.getApi().changeView(view);
  }, []);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setViewTitle(arg.view.title);
    const viewType = arg.view.type;
    if (
      viewType === "dayGridMonth" ||
      viewType === "timeGridWeek" ||
      viewType === "timeGridDay"
    ) {
      setCurrentView(viewType);
    }
    // Let OverlayScrollbars recalculate main scroll height after grid resizes
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

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

  const renderEventContent = useCallback((arg: EventContentArg) => {
    if (arg.event.extendedProps.source !== "gcal") return true;

    const start = arg.event.start;
    if (!start) return true;

    const dateLabel = formatGcalEventLabel(start, arg.event.allDay);
    const title = arg.event.title;

    return (
      <div className="flex min-w-0 items-center gap-1 px-0.5 leading-tight">
        <GoogleIcon className="size-2.5 shrink-0" />
        <span className="min-w-0 truncate text-[0.68rem] font-medium">
          <span className="opacity-90">{dateLabel}</span>
          {" · "}
          {title}
        </span>
      </div>
    );
  }, []);

  const events: EventInput[] = useMemo(() => {
    const items: EventInput[] = [];
    const show = (type: CalendarEventFilterType) => eventFilters.has(type);

    if (show("gcal")) {
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
          classNames: ["cal-gcal-event"],
          extendedProps: { source: "gcal", raw: e },
        });
      }
    }

    for (const e of personalEvents) {
      const source = e.isAttendee ? "attendee" : "personal";
      const filterType: CalendarEventFilterType = e.isAttendee ? "invited" : "personal";
      if (!show(filterType)) continue;

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
        extendedProps: { source, raw: e },
      });
    }

    if (show("wedding")) {
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
    }

    if (show("ceremony")) {
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
    }

    if (show("task")) {
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
    }

    return items;
  }, [personalEvents, weddingDates, ceremonyEvents, taskDeadlines, googleCalEvents, eventFilters]);

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

  const radius = 12 * (1 - progress);
  const padX = 8 + progress * (layout.paddingX - 8);
  const padY = 8 + progress * 4;

  return (
    <div className="overflow-visible rounded-xl border border-border/70 bg-card">
      <div ref={shellRef}>
        {isFloating && barHeight > 0 ? (
          <div aria-hidden className="pointer-events-none" style={{ height: barHeight }} />
        ) : null}
        <div
          ref={barRef}
          className={isFloating ? undefined : "sticky top-0 z-30"}
          style={floatStyle}
        >
          <div
            className={cn(
              progress > 0 &&
                "border border-border/70 bg-gradient-to-b from-card to-card/80 shadow-sm",
              progress > 0.4 &&
                "border-x-transparent bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85",
              progress > 0.85 && "rounded-none border-t-0 border-b-border/70",
              progress === 0 && "px-3 pt-3 sm:px-4 sm:pt-4",
            )}
            style={
              progress > 0
                ? {
                    borderRadius: progress > 0.85 ? 0 : radius,
                    paddingLeft: padX,
                    paddingRight: padX,
                    paddingTop: padY,
                    paddingBottom: padY,
                  }
                : undefined
            }
          >
            <div className="grid min-h-9 grid-cols-[1fr_auto_1fr] items-center gap-2">
              {/* Left — AI + event filters */}
              <div className="flex items-center gap-2">
                {headerActions}
                <CalendarEventFilter
                  selected={eventFilters}
                  onChange={setEventFilters}
                  googleCalConnected={googleCalStatus.connected}
                />
              </div>

              {/* Center — date navigation */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="shrink-0 rounded-lg shadow-none"
                  onClick={() => calRef.current?.getApi().prev()}
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <h2 className="truncate px-0.5 text-[1.0625rem] font-semibold leading-none text-foreground">
                  {viewTitle}
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  className="shrink-0 rounded-lg shadow-none"
                  onClick={() => calRef.current?.getApi().next()}
                  aria-label="Next"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="shrink-0 rounded-lg px-3 text-xs font-medium shadow-none"
                  onClick={() => calRef.current?.getApi().today()}
                >
                  Today
                </Button>
              </div>

              {/* Right — Google, view mode, new event */}
              <div className="flex items-center justify-end gap-2">
                <GoogleCalMenu
                  initialStatus={googleCalStatus}
                  sync={sync}
                  disconnect={disconnect}
                  gcalVisible={gcalVisible}
                  onGcalVisibleChange={handleGcalVisibleChange}
                />
                <CalendarViewModeSelector value={currentView} onChange={handleViewChange} />
                {onNewEvent && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 shrink-0 rounded-lg gap-1.5 px-3 text-xs font-semibold"
                    onClick={onNewEvent}
                  >
                    <Plus className="size-3.5" />
                    New Event
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-wrapper mt-3 px-3 pb-3 sm:px-4 sm:pb-4">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          height="auto"
          stickyHeaderDates={false}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          nowIndicator={true}
          nowIndicatorContent={renderNowIndicator}
          eventContent={renderEventContent}
          dayHeaderContent={renderDayHeader}
          datesSet={handleDatesSet}
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
    </div>
  );
}
