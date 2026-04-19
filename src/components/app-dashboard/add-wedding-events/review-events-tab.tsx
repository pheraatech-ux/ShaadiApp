"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CULTURE_MAP, TASKS_BY_EVENT, type CultureId, type WeddingEvent } from "../../../../weddingCultures";

type ReviewEventsTabProps = {
  selectedCultures: CultureId[];
  reviewEvents: WeddingEvent[];
  onReviewEventsChange: (next: WeddingEvent[]) => void;
};

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
}: ReviewEventsTabProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragOverEventId, setDragOverEventId] = useState<string | null>(null);
  const effectiveExpandedEventId =
    expandedEventId && reviewEvents.some((event) => event.id === expandedEventId)
      ? expandedEventId
      : reviewEvents[0]?.id ?? null;

  if (selectedCultures.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
        Select at least one culture to review events.
      </div>
    );
  }

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
          No events selected. Add custom events or go back to choose cultures.
        </div>
      ) : (
        <div className="space-y-2">
          {reviewEvents.map((event) => {
            const isExpanded = effectiveExpandedEventId === event.id;
            const eventTaskTemplates = TASKS_BY_EVENT[event.id] ?? [];
            const visibleTasks = eventTaskTemplates.slice(0, 3);
            const hiddenTaskCount = Math.max(eventTaskTemplates.length - visibleTasks.length, 0);
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
                          <p className="text-xs text-muted-foreground">Drag to reorder and tap event name to expand.</p>
                        </div>
                        <div className="mt-0.5 shrink-0 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="mt-4 space-y-3 border-t border-border/70 pt-3">
                          <div>
                            <p className="text-sm leading-relaxed text-foreground">{event.description}</p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.culturalSignificance}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {visibleTasks.map((task) => (
                              <Badge key={task.id} variant="secondary" className="h-auto rounded-md px-2 py-1 text-[11px]">
                                {task.text}
                              </Badge>
                            ))}
                            {hiddenTaskCount > 0 ? (
                              <Badge variant="outline" className="h-auto rounded-md px-2 py-1 text-[11px]">
                                +{hiddenTaskCount} more tasks
                              </Badge>
                            ) : null}
                          </div>
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
