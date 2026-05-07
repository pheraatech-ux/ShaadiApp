"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, Clock, MapPin, Trash2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CalendarEmployee, CalendarEventRow } from "@/components/app-dashboard/calendar/types";

const PRESET_COLORS = [
  { value: "#6366f1", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#f97316", label: "Orange" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  initialTime?: string;
  event?: CalendarEventRow | null;
  weddings: { id: string; name: string }[];
  employees: CalendarEmployee[];
  readOnly?: boolean;
  onSave: (data: {
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    color: string | null;
    weddingId: string | null;
    eventType: string;
    location: string | null;
    attendeeIds: string[];
    guestEmails: string[];
  }) => void;
  onDelete?: () => void;
  isSaving?: boolean;
};

function toDateLocal(iso: string): string {
  return iso.slice(0, 10);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EventFormDialog({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  event,
  weddings,
  employees,
  readOnly = false,
  onSave,
  onDelete,
  isSaving,
}: Props) {
  const isEditing = Boolean(event);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [weddingId, setWeddingId] = useState<string>("none");
  const [location, setLocation] = useState("");
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]);
  const [guestEmails, setGuestEmails] = useState<string[]>([]);
  const [guestEmailInput, setGuestEmailInput] = useState("");
  const [attendeePopoverOpen, setAttendeePopoverOpen] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setAllDay(event.allDay);
      const start = new Date(event.startAt);
      setStartDate(toDateLocal(event.startAt));
      setStartTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`);
      if (event.endAt) {
        const end = new Date(event.endAt);
        setEndDate(toDateLocal(event.endAt));
        setEndTime(`${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`);
      } else {
        setEndDate(toDateLocal(event.startAt));
        setEndTime("10:00");
      }
      setColor(event.color ?? PRESET_COLORS[0].value);
      setWeddingId(event.weddingId ?? "none");
      setLocation(event.location ?? "");
      setAttendeeIds(event.attendeeIds ?? []);
      setGuestEmails(event.guestEmails ?? []);
    } else {
      setTitle("");
      setDescription("");
      setAllDay(!initialTime);
      const date = initialDate ?? new Date().toISOString().slice(0, 10);
      setStartDate(date);
      setStartTime(initialTime ?? "09:00");
      setEndDate(date);
      setEndTime("10:00");
      setColor(PRESET_COLORS[0].value);
      setWeddingId("none");
      setLocation("");
      setAttendeeIds([]);
      setGuestEmails([]);
    }
    setGuestEmailInput("");
  }, [open, event, initialDate, initialTime]);

  function toggleAttendee(id: string) {
    setAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleGuestEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const email = guestEmailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) return;
    if (guestEmails.includes(email)) {
      setGuestEmailInput("");
      return;
    }
    setGuestEmails((prev) => [...prev, email]);
    setGuestEmailInput("");
  }

  function removeGuestEmail(email: string) {
    setGuestEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let startAt: string;
    let endAt: string | null = null;

    if (allDay) {
      startAt = `${startDate}T00:00:00.000Z`;
      if (endDate && endDate !== startDate) {
        endAt = `${endDate}T00:00:00.000Z`;
      }
    } else {
      startAt = new Date(`${startDate}T${startTime}`).toISOString();
      if (endDate) {
        endAt = new Date(`${endDate}T${endTime}`).toISOString();
      }
    }

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      startAt,
      endAt,
      allDay,
      color,
      weddingId: weddingId === "none" ? null : weddingId,
      eventType: "personal",
      location: location.trim() || null,
      attendeeIds,
      guestEmails,
    });
  }

  const selectedAttendeeNames = employees
    .filter((e) => attendeeIds.includes(e.id))
    .map((e) => e.name);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-muted-foreground" />
            {readOnly ? "Event Details" : isEditing ? "Edit Event" : "New Event"}
            {readOnly && (
              <span className="ml-auto rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
                You&apos;re invited
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="event-sheet-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Title {!readOnly && "*"}</p>
              <Input
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required={!readOnly}
                readOnly={readOnly}
                disabled={readOnly}
                className="h-9"
              />
            </div>

            {/* All-day toggle */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={allDay}
                onClick={() => !readOnly && setAllDay((v) => !v)}
                disabled={readOnly}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  allDay ? "bg-primary" : "bg-muted",
                  readOnly ? "cursor-default opacity-70" : "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block size-4 rounded-full bg-background shadow transition-transform",
                    allDay ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
              <span className="text-sm text-muted-foreground">All day</span>
            </div>

            {/* Date / Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3" /> Start
                </p>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={!readOnly}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="h-9"
                />
                {!allDay && (
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className="h-9"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Clock className="size-3" /> End
                </p>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="h-9"
                />
                {!allDay && (
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className="h-9"
                  />
                )}
              </div>
            </div>

            {/* Location */}
            {(!readOnly || location) && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="size-3" /> Location
                </p>
                <Input
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="h-9"
                />
              </div>
            )}

            {/* Attendees */}
            {employees.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Users className="size-3" /> Attendees
                </p>
                <Popover open={attendeePopoverOpen} onOpenChange={setAttendeePopoverOpen}>
                  <PopoverTrigger
                    className={cn(
                      "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      attendeeIds.length === 0 && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {attendeeIds.length === 0
                        ? "Select employees…"
                        : attendeeIds.length === 1
                        ? selectedAttendeeNames[0]
                        : `${attendeeIds.length} employees selected`}
                    </span>
                    <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted-foreground" />
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    className="w-[var(--radix-popover-trigger-width,320px)] p-1"
                  >
                    <div className="max-h-52 overflow-y-auto">
                      {employees.map((emp) => {
                        const checked = attendeeIds.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => toggleAttendee(emp.id)}
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded border",
                                checked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input",
                              )}
                            >
                              {checked && <Check className="size-2.5" />}
                            </span>
                            <span className="flex-1 truncate">{emp.name}</span>
                            <span className="text-xs capitalize text-muted-foreground">{emp.role}</span>
                          </button>
                        );
                      })}
                    </div>
                    {attendeeIds.length > 0 && (
                      <div className="mt-1 border-t border-border/60 pt-1">
                        <button
                          type="button"
                          onClick={() => setAttendeeIds([])}
                          className="w-full rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {/* Selected attendee pills */}
                {attendeeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {employees
                      .filter((e) => attendeeIds.includes(e.id))
                      .map((emp) => (
                        <span
                          key={emp.id}
                          className="flex items-center gap-1 rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs"
                        >
                          {emp.name}
                          <button
                            type="button"
                            onClick={() => toggleAttendee(emp.id)}
                            className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${emp.name}`}
                          >
                            <X className="size-2.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Guest Emails */}
            {(!readOnly || guestEmails.length > 0) && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Guest Emails</p>
              {!readOnly && (
                <Input
                  ref={emailInputRef}
                  type="email"
                  placeholder="Add email and press Enter…"
                  value={guestEmailInput}
                  onChange={(e) => setGuestEmailInput(e.target.value)}
                  onKeyDown={handleGuestEmailKeyDown}
                  className="h-9"
                  autoComplete="off"
                />
              )}
              {guestEmails.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {guestEmails.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1 rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeGuestEmail(email)}
                        className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${email}`}
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Wedding link */}
            {weddings.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Link to wedding</p>
                <Select value={weddingId} onValueChange={(v) => { setWeddingId(v ?? "none"); }}>
                  <SelectTrigger className="!h-9 w-full text-sm">
                    <span className={weddingId === "none" ? "text-muted-foreground" : ""}>
                      {weddingId === "none"
                        ? "None"
                        : (weddings.find((w) => w.id === weddingId)?.name ?? "None")}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {weddings.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            {(!readOnly || description) && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <textarea
                  placeholder="Optional notes…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70"
                />
              </div>
            )}

            {/* Color */}
            {!readOnly && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Color</p>
                <div className="flex gap-2.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "size-6 rounded-full border-2 transition-transform hover:scale-110",
                        color === c.value ? "border-foreground scale-110" : "border-transparent",
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-border/60 px-5 py-3 flex-row items-center gap-2">
          {readOnly ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          ) : (
            <>
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-auto shrink-0 text-destructive hover:text-destructive"
                  onClick={onDelete}
                  disabled={isSaving}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="event-sheet-form"
                size="sm"
                className="flex-1"
                disabled={isSaving || !title.trim()}
              >
                {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Event"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
