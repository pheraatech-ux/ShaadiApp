"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ClockIcon, Loader2, MapPinIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useAddEvent,
  useDeleteEvent,
  useUpdateEvent,
  type EventData,
} from "@/components/wedding-workspace/overview/use-events-query";

const CULTURE_OPTIONS = [
  { value: "Punjabi", label: "Punjabi" },
  { value: "Tamil", label: "Tamil" },
  { value: "Telugu", label: "Telugu" },
  { value: "Kannada", label: "Kannada" },
  { value: "Malayalam", label: "Kerala / Malayalam" },
  { value: "Bengali", label: "Bengali" },
  { value: "Gujarati", label: "Gujarati" },
  { value: "Maharashtrian", label: "Maharashtrian" },
  { value: "Rajasthani", label: "Rajasthani" },
  { value: "Hindu (Hindi belt)", label: "Hindi belt" },
  { value: "Sindhi", label: "Sindhi" },
  { value: "Kodava", label: "Kodava" },
  { value: "Assamese", label: "Assamese" },
  { value: "Odia", label: "Odia" },
  { value: "Manipuri", label: "Manipuri" },
  { value: "UP / Bihari", label: "UP / Bihari" },
  { value: "Kashmiri Pandit", label: "Kashmiri Pandit" },
  { value: "Jain", label: "Jain" },
  { value: "Parsi", label: "Parsi" },
] as const;

const NOTES_MAX = 500;

type EventSheetProps = {
  weddingSlug: string;
  mode: "add" | "edit";
  event?: EventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventSheet({ weddingSlug, mode, event, open, onOpenChange }: EventSheetProps) {
  const addEvent = useAddEvent(weddingSlug);
  const updateEvent = useUpdateEvent(weddingSlug);
  const deleteEvent = useDeleteEvent(weddingSlug);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [cultureLabel, setCultureLabel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(event?.title ?? "");
      setEventDate(event?.eventDate ?? "");
      setCultureLabel(event?.cultureLabel ?? "");
      setStartTime(event?.startTime ?? "");
      setEndTime(event?.endTime ?? "");
      setVenue(event?.venue ?? "");
      setVenueAddress(event?.venueAddress ?? "");
      setNotes(event?.notes ?? "");
    }
  }, [open, event]);

  const isBusy = addEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  function close() {
    if (!isBusy) onOpenChange(false);
  }

  function buildPayload() {
    return {
      title: title.trim(),
      eventDate: eventDate || null,
      cultureLabel: cultureLabel || null,
      startTime: startTime || null,
      endTime: endTime || null,
      venue: venue.trim() || null,
      venueAddress: venueAddress.trim() || null,
      notes: notes.trim() || null,
    };
  }

  function handleSave() {
    if (!title.trim() || isBusy) return;
    if (mode === "add") {
      addEvent.mutate(buildPayload(), { onSuccess: close });
    } else if (event) {
      updateEvent.mutate({ eventId: event.id, ...buildPayload() }, { onSuccess: close });
    }
  }

  function handleDelete() {
    if (!event || isBusy) return;
    deleteEvent.mutate(event.id, { onSuccess: close });
  }

  const canSave = title.trim().length > 0 && !isBusy;

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!isBusy) onOpenChange(next); }}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-[15px] font-semibold">
            {mode === "add" ? "Add event" : "Edit event"}
          </SheetTitle>
          <button
            onClick={close}
            disabled={isBusy}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <span className="text-sm leading-none">✕</span>
          </button>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Event name */}
          <Field label="Event name" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mehendi"
              disabled={isBusy}
              className="h-9 text-[13px]"
            />
          </Field>

          {/* Ceremony type */}
          <Field label="Ceremony type">
            <Select
              value={cultureLabel}
              onValueChange={(v) => setCultureLabel(v ?? "")}
              disabled={isBusy}
            >
              <SelectTrigger className="h-9 w-full text-[13px]">
                <SelectValue placeholder="Select culture…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {CULTURE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Event date */}
          <Field label="Event date" icon={<CalendarIcon className="size-3.5" />}>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={isBusy}
              className="h-9 text-[13px]"
            />
          </Field>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" icon={<ClockIcon className="size-3.5" />} hint="optional">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isBusy}
                className="h-9 text-[13px]"
              />
            </Field>
            <Field label="End time" icon={<ClockIcon className="size-3.5" />} hint="optional">
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isBusy}
                className="h-9 text-[13px]"
              />
            </Field>
          </div>

          {/* Venue */}
          <Field label="Venue" icon={<MapPinIcon className="size-3.5" />} required>
            <Input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. The Leela Palace, Chennai"
              disabled={isBusy}
              className="h-9 text-[13px]"
            />
          </Field>

          {/* Venue address */}
          <Field label="Venue address">
            <textarea
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Full address…"
              rows={2}
              disabled={isBusy}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
            />
          </Field>

          {/* Notes */}
          <Field label="Notes" hint="optional">
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
                placeholder="Add any notes about this event…"
                rows={3}
                disabled={isBusy}
                className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
              />
              <span className="absolute right-2.5 bottom-2 text-[10px] text-muted-foreground/50">
                {notes.length}/{NOTES_MAX}
              </span>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-5 py-4">
          {mode === "edit" && (
            <div className="mb-3 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isBusy}
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {deleteEvent.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Delete event
              </Button>
              <p className="text-[11px] text-muted-foreground">This action cannot be undone.</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={close} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!canSave}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {(addEvent.isPending || updateEvent.isPending) && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              {mode === "add" ? "Add event" : "Save changes"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Small layout helper ──────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-auto text-[11px] font-normal text-muted-foreground">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}
