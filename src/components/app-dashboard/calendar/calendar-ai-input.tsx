"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Sparkles, Send, Check, X, CalendarPlus, Pencil, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEmployee, CalendarEventRow, CalendarVendorContext, CreateCalendarEventInput, UpdateCalendarEventInput } from "@/components/app-dashboard/calendar/types";

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

function formatPreviewDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarAiInput({ existingEvents, vendors, employees, weddings, onConfirmCreate, onConfirmUpdate }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    setResult(null);
    setMessage("");
  }

  function handleDiscard() {
    setResult(null);
  }

  const matchedEvent = result?.action === "update"
    ? existingEvents.find((e) => e.id === result.input.eventId)
    : null;

  return (
    <div className="space-y-2">
      {/* Input bar */}
      <div className={cn(
        "flex items-end gap-2 rounded-xl border bg-card px-3 py-2 transition-colors",
        loading ? "border-primary/40" : "border-border/70 focus-within:border-primary/50",
      )}>
        <Sparkles className={cn("mb-1.5 size-4 shrink-0", loading ? "text-primary animate-pulse" : "text-muted-foreground")} />
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "Book a tasting with Tandoori Nights next Tuesday at 4 PM" or "Move the Vardaan meeting 2 hours later"'
          rows={1}
          disabled={loading}
          className="flex-1 resize-none bg-transparent py-0.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
          style={{ minHeight: "1.5rem", maxHeight: "4.5rem" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="mb-0.5 size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
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
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            {result.action === "create"
              ? <><CalendarPlus className="size-3.5" /> Create new event</>
              : <><Pencil className="size-3.5" /> Update event</>
            }
          </div>

          {result.action === "create" && (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{result.input.title}</p>
              {result.input.startAt && (
                <p className="text-xs text-muted-foreground">
                  {result.input.allDay
                    ? new Date(result.input.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : formatPreviewDate(result.input.startAt)}
                  {result.input.endAt && !result.input.allDay && ` → ${formatPreviewDate(result.input.endAt)}`}
                </p>
              )}
              {result.input.description && (
                <p className="text-xs text-muted-foreground">{result.input.description}</p>
              )}
            </div>
          )}

          {result.action === "update" && matchedEvent && (
            <div className="space-y-1 text-sm">
              <p className="text-xs text-muted-foreground">Updating: <span className="font-medium text-foreground">{matchedEvent.title}</span></p>
              {result.input.title && <p className="text-xs">New title: <span className="font-medium">{result.input.title}</span></p>}
              {result.input.startAt && (
                <p className="text-xs">
                  New time: <span className="font-medium">{result.input.allDay
                    ? new Date(result.input.startAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : formatPreviewDate(result.input.startAt)}
                  </span>
                </p>
              )}
              {result.input.description && <p className="text-xs">Note: {result.input.description}</p>}
            </div>
          )}

          {result.action === "update" && !matchedEvent && (
            <p className="text-xs text-muted-foreground">Could not match event — it may have already been deleted.</p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <Button size="sm" className="h-7 rounded-lg gap-1.5 text-xs" onClick={handleConfirm} disabled={result.action === "update" && !matchedEvent}>
              <Check className="size-3" /> Apply
            </Button>
            <Button size="sm" variant="ghost" className="h-7 rounded-lg gap-1.5 text-xs text-muted-foreground" onClick={handleDiscard}>
              <X className="size-3" /> Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
