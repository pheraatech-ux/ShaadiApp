"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import {
  Sparkles, Send, Check, X, CalendarPlus, Pencil, Loader2, Clock, Calendar, FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  CalendarEmployee,
  CalendarEventRow,
  CalendarVendorContext,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/components/app-dashboard/calendar/types";

type AiCreateInput = CreateCalendarEventInput;
type AiUpdateInput = UpdateCalendarEventInput & { eventId: string };

type AiResult =
  | { action: "create"; input: AiCreateInput }
  | { action: "update"; input: AiUpdateInput };

type WeddingContext = { id: string; name: string };

type Props = {
  existingEvents: CalendarEventRow[];
  vendors: CalendarVendorContext[];
  employees: CalendarEmployee[];
  weddings: WeddingContext[];
  onConfirmCreate: (input: CreateCalendarEventInput) => void;
  onConfirmUpdate: (id: string, input: UpdateCalendarEventInput) => void;
};

const EXAMPLE_PROMPTS = [
  "Book a venue walkthrough next Thursday at 2 PM",
  "Move the caterer meeting 1 hour later",
  "Add a mehendi rehearsal on Saturday at 11 AM",
];

function formatDate(iso: string, allDay: boolean) {
  if (allDay) {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarAiInput({
  existingEvents,
  vendors,
  employees,
  weddings,
  onConfirmCreate,
  onConfirmUpdate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function resetState() {
    setMessage("");
    setError(null);
    setResult(null);
    setLoading(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetState();
  }

  async function handleSubmit() {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/calendar/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: text,
          existingEvents: existingEvents.map((e) => ({
            id: e.id,
            title: e.title,
            startAt: e.startAt,
            endAt: e.endAt,
            allDay: e.allDay,
          })),
          vendors,
          employees,
          weddings,
        }),
      });

      const data = (await res.json()) as AiResult & { error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleConfirm() {
    if (!result) return;
    if (result.action === "create") {
      onConfirmCreate(result.input);
    } else {
      const { eventId, ...rest } = result.input;
      onConfirmUpdate(eventId, rest);
    }
    handleOpenChange(false);
  }

  function handleDiscard() {
    setResult(null);
    setMessage("");
    inputRef.current?.focus();
  }

  const matchedEvent =
    result?.action === "update"
      ? existingEvents.find((e) => e.id === result.input.eventId)
      : null;

  const canApply = result && (result.action === "create" || !!matchedEvent);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-9 rounded-lg gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-3.5" />
        Ask AI
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">AI Scheduling</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Describe what you want in plain English
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4">
            {/* Example chips — only show when no result yet */}
            {!result && !loading && (
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setMessage(prompt);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-colors",
                loading
                  ? "border-primary/40"
                  : "border-border/70 focus-within:border-primary/50",
              )}
            >
              <Sparkles
                className={cn(
                  "size-4 shrink-0",
                  loading ? "text-primary animate-pulse" : "text-muted-foreground/50",
                )}
              />
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "Book a tasting next Tuesday at 4 PM"'
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent py-0 text-sm leading-5 placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
                style={{ minHeight: "1.25rem", maxHeight: "5rem" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>

            {/* Error */}
            {error && (
              <p className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            {/* Confirmation card */}
            {result && (
              <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
                {/* Card header badge */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-xs font-medium",
                    result.action === "create"
                      ? "bg-primary/8 text-primary border-b border-primary/15"
                      : "bg-amber-500/8 text-amber-600 border-b border-amber-500/15 dark:text-amber-400",
                  )}
                >
                  {result.action === "create" ? (
                    <><CalendarPlus className="size-3.5" /> Creating new event</>
                  ) : (
                    <><Pencil className="size-3.5" /> Updating event</>
                  )}
                </div>

                {/* Card body */}
                <div className="px-4 py-3 space-y-2.5">
                  {result.action === "create" && (
                    <>
                      <p className="text-sm font-semibold leading-snug">
                        {result.input.title}
                      </p>
                      {result.input.startAt && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 mt-px shrink-0" />
                          <span>
                            {formatDate(result.input.startAt, result.input.allDay ?? false)}
                            {result.input.endAt && !result.input.allDay && (
                              <> &rarr; {formatTime(result.input.endAt)}</>
                            )}
                          </span>
                        </div>
                      )}
                      {result.input.allDay && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="size-3.5 shrink-0" />
                          <span>All day</span>
                        </div>
                      )}
                      {result.input.description && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <FileText className="size-3.5 mt-px shrink-0" />
                          <span>{result.input.description}</span>
                        </div>
                      )}
                    </>
                  )}

                  {result.action === "update" && matchedEvent && (
                    <>
                      <div className="text-xs text-muted-foreground">
                        Updating:{" "}
                        <span className="font-medium text-foreground">
                          {matchedEvent.title}
                        </span>
                      </div>
                      {result.input.title && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Pencil className="size-3.5 shrink-0" />
                          New title:{" "}
                          <span className="font-medium text-foreground">
                            {result.input.title}
                          </span>
                        </div>
                      )}
                      {result.input.startAt && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 mt-px shrink-0" />
                          <span>
                            New time:{" "}
                            <span className="font-medium text-foreground">
                              {formatDate(
                                result.input.startAt,
                                result.input.allDay ?? false,
                              )}
                            </span>
                          </span>
                        </div>
                      )}
                      {result.input.description && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <FileText className="size-3.5 mt-px shrink-0" />
                          <span>{result.input.description}</span>
                        </div>
                      )}
                    </>
                  )}

                  {result.action === "update" && !matchedEvent && (
                    <p className="text-xs text-muted-foreground">
                      Could not match this event — it may have already been deleted.
                    </p>
                  )}
                </div>

                {/* Card actions */}
                <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-4 py-3">
                  <Button
                    size="sm"
                    className="h-8 flex-1 rounded-lg gap-1.5 text-xs"
                    onClick={handleConfirm}
                    disabled={!canApply}
                  >
                    <Check className="size-3.5" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1 rounded-lg gap-1.5 text-xs"
                    onClick={handleDiscard}
                  >
                    <X className="size-3.5" />
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
