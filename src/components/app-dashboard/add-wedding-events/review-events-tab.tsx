"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CULTURE_MAP,
  getEventsForCultures,
  type CultureId,
  type WeddingEvent,
} from "../../../../weddingCultures";

type AiPhase = "prompt" | "generating" | "ready" | "done";

type ReviewEventsTabProps = {
  selectedCultures: CultureId[];
  reviewEvents: WeddingEvent[];
  onReviewEventsChange: (next: WeddingEvent[]) => void;
  onAiResolved?: () => void;
};

function getLoadingMessages(selectedCultures: CultureId[]) {
  const cultureLabel =
    selectedCultures.length === 0
      ? "your cultures"
      : selectedCultures.map((id) => CULTURE_MAP[id].shortName).join(" + ");
  return [
    "Analysing your wedding profile...",
    `Mapping ${cultureLabel} traditions...`,
    "Sourcing key ceremonies and rituals...",
    "Building your event timeline...",
    "Cross-referencing cultural customs...",
    "Finalising the event sequence...",
  ];
}

function reorderEvents(items: WeddingEvent[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ReviewEventsTab({
  selectedCultures,
  reviewEvents,
  onReviewEventsChange,
  onAiResolved,
}: ReviewEventsTabProps) {
  const [aiPhase, setAiPhase] = useState<AiPhase>("prompt");
  const [msgIndex, setMsgIndex] = useState(0);
  const [tickVisible, setTickVisible] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverEventId, setDragOverEventId] = useState<string | null>(null);

  const loadingMessages = getLoadingMessages(selectedCultures);

  useEffect(() => {
    if (aiPhase !== "generating") return;
    setMsgIndex(0);
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);
    const readyTimer = setTimeout(() => {
      setAiPhase("ready");
    }, 4800);
    return () => {
      clearInterval(msgInterval);
      clearTimeout(readyTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPhase]);

  useEffect(() => {
    if (aiPhase !== "ready") return;
    setTickVisible(false);
    const tickTimer = setTimeout(() => setTickVisible(true), 60);
    const doneTimer = setTimeout(() => {
      onReviewEventsChange(getEventsForCultures(selectedCultures));
      onAiResolved?.();
      setAiPhase("done");
    }, 1400);
    return () => {
      clearTimeout(tickTimer);
      clearTimeout(doneTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPhase]);

  if (selectedCultures.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
        Select at least one culture to review events.
      </div>
    );
  }

  const cultureLabel = selectedCultures.map((id) => CULTURE_MAP[id].shortName).join(" + ");

  // ── AI Prompt ─────────────────────────────────────────────────
  if (aiPhase === "prompt") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500">
          <Sparkles className="size-7 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            Want starter events for a {cultureLabel} wedding?
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            ShaadiOS AI can suggest ceremonies and rituals based on {cultureLabel} traditions.
            Experienced planners often skip this and build their own list.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              onReviewEventsChange([]);
              onAiResolved?.();
              setAiPhase("done");
            }}
          >
            Skip, I'll add my own
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 hover:from-violet-700 hover:to-emerald-700"
            onClick={() => setAiPhase("generating")}
          >
            <Sparkles className="size-4" />
            Yes, generate starter events
          </Button>
        </div>
      </div>
    );
  }

  // ── Generating ────────────────────────────────────────────────
  if (aiPhase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
        <div className="relative flex size-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <Loader2 className="size-7 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground transition-all duration-500">
            {loadingMessages[msgIndex]}
          </p>
          <p className="text-xs text-muted-foreground">ShaadiOS AI is working on it</p>
        </div>
        <div className="flex gap-1.5">
          {loadingMessages.map((_, i) => (
            <span
              key={i}
              className={cn(
                "block h-1 rounded-full transition-all duration-500",
                i === msgIndex ? "w-5 bg-emerald-500" : "w-1.5 bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Ready tick ────────────────────────────────────────────────
  if (aiPhase === "ready") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
        <div
          className={cn(
            "flex size-20 items-center justify-center rounded-full bg-emerald-500 transition-all duration-500",
            tickVisible ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <Check
            className={cn(
              "text-white transition-all delay-150 duration-300",
              tickVisible ? "size-10 opacity-100" : "size-6 opacity-0",
            )}
            strokeWidth={3}
          />
        </div>
        <p
          className={cn(
            "text-base font-semibold text-foreground transition-all delay-200 duration-300",
            tickVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          Ready
        </p>
      </div>
    );
  }

  // ── Done — normal events view ──────────────────────────────────
  const effectiveExpandedEventId =
    expandedEventId && reviewEvents.some((event) => event.id === expandedEventId)
      ? expandedEventId
      : reviewEvents[0]?.id ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{reviewEvents.length} events</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedCultures.map((cultureId) => (
            <Badge key={cultureId} variant="outline" className="rounded-full text-[11px]">
              {CULTURE_MAP[cultureId].shortName}
            </Badge>
          ))}
        </div>
      </div>

      {reviewEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
          No events yet. Add custom events below.
        </div>
      ) : (
        <div className="space-y-2">
          {reviewEvents.map((event) => {
            const isExpanded = effectiveExpandedEventId === event.id;
            const eventCultures = event.cultures.filter((cultureId) => selectedCultures.includes(cultureId));
            const isDragTarget = dragOverEventId === event.id && draggedEventId !== event.id;

            return (
              <Card
                key={event.id}
                draggable
                onDragStart={() => setDraggedEventId(event.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverEventId(event.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!draggedEventId) return;
                  onReviewEventsChange(reorderEvents(reviewEvents, draggedEventId, event.id));
                  setDraggedEventId(null);
                  setDragOverEventId(null);
                }}
                onDragEnd={() => {
                  setDraggedEventId(null);
                  setDragOverEventId(null);
                }}
                className={cn("py-0 transition-colors", isDragTarget && "ring-2 ring-emerald-500/60")}
              >
                <CardContent className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <div className="pt-1 text-muted-foreground">
                      <GripVertical className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setExpandedEventId((prev) => (prev === event.id ? null : event.id))}
                        className="flex w-full items-start justify-between gap-3 text-left"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold">{event.name}</h4>
                            <Badge variant="outline" className="rounded-md text-[10px]">
                              {event.duration}
                            </Badge>
                            {eventCultures.map((cultureId) => (
                              <Badge key={cultureId} variant="secondary" className="rounded-md text-[10px]">
                                {CULTURE_MAP[cultureId].shortName}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Drag to reorder · tap to expand</p>
                        </div>
                        <div className="mt-0.5 shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="mt-4 space-y-3 border-t border-border/70 pt-3">
                          <p className="text-sm leading-relaxed text-foreground">{event.description}</p>
                          <p className="text-sm leading-relaxed text-muted-foreground">{event.culturalSignificance}</p>
                        </div>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="mt-0.5 rounded-md text-muted-foreground hover:text-destructive"
                      onClick={() => onReviewEventsChange(reviewEvents.filter((item) => item.id !== event.id))}
                      aria-label={`Remove ${event.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Button variant="outline" className="w-full rounded-xl border-dashed text-sm">
        <Plus className="size-4" />
        Add custom event
      </Button>

      <div className="rounded-xl border border-violet-200/60 bg-violet-100/60 px-3 py-2 text-xs text-violet-900 dark:border-violet-400/40 dark:bg-violet-950/30 dark:text-violet-100">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-4 items-center justify-center rounded bg-violet-600 text-[10px] font-semibold text-white">
            A
          </span>
          <p>
            Tasks for each event are pre-populated when you open the workspace. Each task is tagged to its event, has a
            suggested deadline based on your wedding date, and can be edited or deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
