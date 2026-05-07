"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CalendarEventRow } from "@/components/app-dashboard/calendar/types";

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
  onSave: (data: {
    title: string;
    description: string | null;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    color: string | null;
    weddingId: string | null;
    eventType: string;
  }) => void;
  onDelete?: () => void;
  isSaving?: boolean;
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateLocal(iso: string): string {
  return iso.slice(0, 10);
}

export function EventFormDialog({
  open,
  onOpenChange,
  initialDate,
  initialTime,
  event,
  weddings,
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
    }
  }, [open, event, initialDate, initialTime]);

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
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            {isEditing ? "Edit Event" : "New Event"}
          </DialogTitle>
        </DialogHeader>

        <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Title *</p>
            <Input
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-9"
            />
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={allDay}
              onClick={() => setAllDay((v) => !v)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                allDay ? "bg-primary" : "bg-muted",
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
                required
                className="h-9"
              />
              {!allDay && (
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
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
                className="h-9"
              />
              {!allDay && (
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-9"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <textarea
              placeholder="Optional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Wedding link */}
          {weddings.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Link to wedding</p>
              <Select value={weddingId} onValueChange={(v) => setWeddingId(v ?? "none")}>
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue placeholder="None" />
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

          {/* Color */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Color</p>
            <div className="flex gap-2">
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
        </form>

        <DialogFooter className="flex items-center gap-2">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isSaving}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="event-form" size="sm" disabled={isSaving || !title.trim()}>
            {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
