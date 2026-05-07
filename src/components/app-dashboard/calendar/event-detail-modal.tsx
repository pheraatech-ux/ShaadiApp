"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Pencil, Trash2, MapPin, Clock, Users, Mail, AlignLeft, BookHeart, ClipboardList, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AnyCalendarEvent, CalendarEmployee } from "@/components/app-dashboard/calendar/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clickedEvent: AnyCalendarEvent | null;
  anchorEl: Element | null;
  employees: CalendarEmployee[];
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

function dateLabel(d: Date): string {
  // "Monday, March 23 2026" (no comma before year)
  return d
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .replace(/,(\s+\d{4})$/, "$1");
}

function timeLabel(d: Date, withMeridiem: boolean): string {
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes();
  const suffix = withMeridiem ? (d.getHours() < 12 ? "am" : "pm") : "";
  return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, "0")}${suffix}`;
}

function formatEventTime(startIso: string, endIso: string | null, allDay: boolean): string {
  const start = new Date(startIso);
  const label = dateLabel(start);

  if (allDay) return `${label} • All day`;

  if (!endIso) {
    return `${label} • ${timeLabel(start, true)}`;
  }

  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();

  if (!sameDay) {
    return `${label} ${timeLabel(start, true)} → ${dateLabel(end)} ${timeLabel(end, true)}`;
  }

  const sameMeridiem = (start.getHours() < 12) === (end.getHours() < 12);
  return `${label} • ${timeLabel(start, !sameMeridiem)} - ${timeLabel(end, true)}`;
}

function formatDate(iso: string): string {
  return dateLabel(new Date(iso));
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return timeLabel(d, true);
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

export function EventDetailModal({
  open,
  onOpenChange,
  clickedEvent,
  anchorEl,
  employees,
  onEdit,
  onDelete,
  isDeleting,
}: Props) {
  if (!clickedEvent) return null;

  const { source } = clickedEvent;
  const isOwned = source === "personal";

  const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e.name]));

  function getTitle(): string {
    if (source === "personal" || source === "attendee") {
      return (clickedEvent!.event as import("./types").CalendarEventRow).title;
    }
    if (source === "wedding") {
      return (clickedEvent!.event as import("./types").CalendarWeddingDate).title;
    }
    if (source === "ceremony") {
      const e = clickedEvent!.event as import("./types").CalendarCeremonyEvent;
      return e.cultureLabel ? `${e.cultureLabel}: ${e.title}` : e.title;
    }
    if (source === "task") {
      return (clickedEvent!.event as import("./types").CalendarTaskDeadline).title;
    }
    return "";
  }

  function getDescription(): string | null {
    if (source === "personal" || source === "attendee") {
      return (clickedEvent!.event as import("./types").CalendarEventRow).description ?? null;
    }
    return null;
  }

  function renderRows() {
    if (source === "personal" || source === "attendee") {
      const e = clickedEvent!.event as import("./types").CalendarEventRow;

      const timeStr = formatEventTime(e.startAt, e.endAt, e.allDay);

      const attendeeNames = e.attendeeIds
        .map((id) => employeeMap[id] ?? id)
        .filter(Boolean);

      return (
        <div className="space-y-2.5">
          {source === "attendee" && (
            <Badge variant="secondary" className="text-xs">Invited</Badge>
          )}

          <Row icon={<Clock className="size-3.5" />}>{timeStr}</Row>

          {e.location && (
            <Row icon={<MapPin className="size-3.5" />}>{e.location}</Row>
          )}

          {attendeeNames.length > 0 && (
            <Row icon={<Users className="size-3.5" />}>
              {attendeeNames.join(", ")}
            </Row>
          )}

          {e.guestEmails.length > 0 && (
            <Row icon={<Mail className="size-3.5" />}>
              {e.guestEmails.join(", ")}
            </Row>
          )}

          {e.eventType && e.eventType !== "other" && e.eventType !== "personal" && (
            <Row icon={<Tag className="size-3.5" />}>
              <span className="capitalize">{e.eventType.replace(/_/g, " ")}</span>
            </Row>
          )}
        </div>
      );
    }

    if (source === "wedding") {
      const e = clickedEvent!.event as import("./types").CalendarWeddingDate;
      return (
        <div className="space-y-2.5">
          <Row icon={<Clock className="size-3.5" />}>{formatDate(e.date)} (All day)</Row>
          <Row icon={<BookHeart className="size-3.5" />}>Wedding day</Row>
        </div>
      );
    }

    if (source === "ceremony") {
      const e = clickedEvent!.event as import("./types").CalendarCeremonyEvent;
      return (
        <div className="space-y-2.5">
          <Row icon={<Clock className="size-3.5" />}>
            {formatDate(e.date)}
            {e.startTime && (
              <span className="ml-1">
                {formatTime(e.startTime)}
                {e.endTime && ` → ${formatTime(e.endTime)}`}
              </span>
            )}
          </Row>
          <Row icon={<BookHeart className="size-3.5" />}>{e.weddingName}</Row>
          {e.cultureLabel && (
            <Row icon={<Tag className="size-3.5" />}>{e.cultureLabel}</Row>
          )}
        </div>
      );
    }

    if (source === "task") {
      const e = clickedEvent!.event as import("./types").CalendarTaskDeadline;
      return (
        <div className="space-y-2.5">
          <Row icon={<Clock className="size-3.5" />}>Due {formatDate(e.dueDate)}</Row>
          <Row icon={<BookHeart className="size-3.5" />}>{e.weddingName}</Row>
          <Row icon={<ClipboardList className="size-3.5" />}>
            <span className="capitalize">{e.status.replace(/_/g, " ")}</span>
            {" · "}
            <span className="capitalize">{e.priority} priority</span>
          </Row>
        </div>
      );
    }

    return null;
  }

  const title = getTitle();
  const description = getDescription();

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => onOpenChange(next)}
      modal={false}
    >
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={anchorEl}
          side="bottom"
          align="start"
          sideOffset={6}
          alignOffset={0}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            className={cn(
              "w-80 origin-(--transform-origin) rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden",
              "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-snug">{title}</p>
                {description && (
                  <div className="mt-1.5 flex items-start gap-2">
                    <AlignLeft className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground line-clamp-4">{description}</p>
                  </div>
                )}
              </div>
              <PopoverPrimitive.Close
                render={
                  <Button variant="ghost" size="icon-sm" className="shrink-0 -mt-1 -mr-1" />
                }
              >
                <X className="size-3.5" />
                <span className="sr-only">Close</span>
              </PopoverPrimitive.Close>
            </div>

            {/* Body */}
            <div className="px-4 pb-3">
              {renderRows()}
            </div>

            {/* Footer — only for owned events */}
            {isOwned && (
              <div className="flex items-center justify-between border-t px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit();
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              </div>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
