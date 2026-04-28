"use client";

import { useMemo, useState } from "react";
import { Filter, MapPinIcon, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventSheet } from "@/components/wedding-workspace/overview/event-sheet";
import { useEventsQuery, type EventData } from "@/components/wedding-workspace/overview/use-events-query";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";
import { cn } from "@/lib/utils";

type Tab = "all" | "upcoming" | "completed";

const TODAY = new Date().toISOString().slice(0, 10);

function isUpcoming(eventDate: string | null) {
  if (!eventDate) return true;
  return eventDate >= TODAY;
}

function formatDateParts(dateStr: string | null) {
  if (!dateStr) return { month: "TBD", day: "—", weekday: "" };
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

const CULTURE_BADGE: Record<string, string> = {
  Punjabi: "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200",
  Tamil: "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100",
  Telugu: "border-teal-500/40 bg-teal-500/15 text-teal-800 dark:text-teal-200",
  Kannada: "border-lime-500/40 bg-lime-500/15 text-lime-800 dark:text-lime-200",
  Bengali: "border-indigo-500/40 bg-indigo-500/15 text-indigo-800 dark:text-indigo-200",
  Gujarati: "border-orange-500/40 bg-orange-500/15 text-orange-800 dark:text-orange-200",
};

function cultureBadgeClass(label: string | null) {
  if (!label) return "border-border/60 bg-muted/50 text-muted-foreground";
  return (
    CULTURE_BADGE[label] ?? "border-violet-500/40 bg-violet-500/15 text-violet-800 dark:text-violet-200"
  );
}

type TimelinePanelProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function TimelinePanel({ workspace }: TimelinePanelProps) {
  const { data: events } = useEventsQuery(workspace.id, workspace.timelineEvents);

  const [tab, setTab] = useState<Tab>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const counts = useMemo(() => {
    const upcoming = events.filter((e) => isUpcoming(e.eventDate)).length;
    return { all: events.length, upcoming, completed: events.length - upcoming };
  }, [events]);

  const visible = useMemo(() => {
    let filtered = events;
    if (tab === "upcoming") filtered = events.filter((e) => isUpcoming(e.eventDate));
    if (tab === "completed") filtered = events.filter((e) => !isUpcoming(e.eventDate));
    return [...filtered].sort((a, b) => {
      if (!a.eventDate && !b.eventDate) return 0;
      if (!a.eventDate) return sortAsc ? 1 : -1;
      if (!b.eventDate) return sortAsc ? -1 : 1;
      return sortAsc
        ? a.eventDate.localeCompare(b.eventDate)
        : b.eventDate.localeCompare(a.eventDate);
    });
  }, [events, tab, sortAsc]);

  function openAdd() {
    setSheetMode("add");
    setSelectedEvent(null);
    setSheetOpen(true);
  }

  function openEdit(event: EventData) {
    setSheetMode("edit");
    setSelectedEvent(event);
    setSheetOpen(true);
  }

  return (
    <section className="flex flex-col rounded-xl border border-border/70 bg-card">
      {/* Top header */}
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Event timeline</h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => setSortAsc((p) => !p)}
            title="Toggle sort direction"
          >
            <SlidersHorizontal className="size-3" />
            {sortAsc ? "Earliest first" : "Latest first"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            title="Filter"
          >
            <Filter className="size-3" />
            Filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openAdd}
            className="h-7 gap-1 px-2 text-xs text-primary hover:text-primary"
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border/70 px-4">
        {(["all", "upcoming", "completed"] as const).map((t) => {
          const labels: Record<Tab, string> = {
            all: `All events (${counts.all})`,
            upcoming: `Upcoming (${counts.upcoming})`,
            completed: `Completed (${counts.completed})`,
          };
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                tab === t
                  ? "border-violet-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* Event rows */}
      <div className="max-h-[380px] min-h-[80px] overflow-y-auto divide-y divide-border/50">
        {visible.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {tab === "completed" ? "No completed events yet." : "No events yet. Add your first one."}
          </p>
        ) : (
          visible.map((event) => {
            const { month, day, weekday } = formatDateParts(event.eventDate);
            const past = !isUpcoming(event.eventDate);

            return (
              <article
                key={event.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                  past && "opacity-70",
                )}
              >
                {/* Date block */}
                <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-violet-600/10 border border-violet-500/20 py-1.5 text-center dark:bg-violet-600/20">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    {month}
                  </span>
                  <span className="text-lg font-bold leading-none text-foreground">{day}</span>
                  <span className="text-[9px] font-medium uppercase text-muted-foreground">{weekday}</span>
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn("text-sm font-medium", past && "line-through decoration-muted-foreground/50")}>
                      {event.title}
                    </span>
                    {event.cultureLabel && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-4 rounded-sm px-1.5 text-[10px] font-medium",
                          cultureBadgeClass(event.cultureLabel),
                        )}
                      >
                        {event.cultureLabel}
                      </Badge>
                    )}
                  </div>
                  {event.venue ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/70">
                      <MapPinIcon className="size-2.5 shrink-0" />
                      {event.venue}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground/40">
                      {past ? "Completed" : event.eventDate ? formatRelativeDate(event.eventDate) : "Date TBD"}
                    </p>
                  )}
                </div>

                {/* Time */}
                {(event.startTime || event.endTime) && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-foreground">
                      {formatTime(event.startTime)}
                    </p>
                    {event.endTime && (
                      <p className="text-[10px] text-muted-foreground/60">
                        – {formatTime(event.endTime)}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <button
                  type="button"
                  onClick={() => openEdit(event)}
                  className="shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Event options"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </article>
            );
          })
        )}
      </div>


      <EventSheet
        weddingSlug={workspace.id}
        mode={sheetMode}
        event={selectedEvent}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </section>
  );
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatRelativeDate(dateStr: string): string {
  const today = new Date(TODAY);
  const target = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return `In ${diff} days`;
  if (diff <= 30) return `In ${Math.round(diff / 7)} weeks`;
  return target.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
