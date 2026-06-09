"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Flame, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import type { UpcomingEventItem } from "./types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "upcoming-panel-open";

type DateGroup = {
  label: string;
  sublabel: string | null;
  isToday: boolean;
  items: UpcomingEventItem[];
};

function buildDateGroups(items: UpcomingEventItem[], todayStr: string): DateGroup[] {
  const groups = new Map<string, UpcomingEventItem[]>();
  for (const item of items) {
    const existing = groups.get(item.dateStr) ?? [];
    existing.push(item);
    groups.set(item.dateStr, existing);
  }

  const today = new Date(todayStr + "T00:00:00");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const result: DateGroup[] = [];
  for (const [dateStr, groupItems] of groups) {
    let label: string;
    let sublabel: string | null = null;
    let isToday = false;

    if (dateStr === todayStr) {
      label = "Today";
      sublabel = today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      isToday = true;
    } else if (dateStr === tomorrowStr) {
      label = "Tomorrow";
      sublabel = tomorrow.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    } else {
      const d = new Date(dateStr + "T00:00:00");
      label = d.toLocaleDateString("en-IN", { weekday: "long" });
      sublabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }

    result.push({ label, sublabel, isToday, items: groupItems });
  }

  return result;
}

function formatTime(startAt: string): string {
  const d = new Date(startAt);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

type ItemRowProps = {
  item: UpcomingEventItem;
  basePath?: string;
};

function ItemRow({ item, basePath = "/app" }: ItemRowProps) {
  const href = item.weddingSlug
    ? item.kind === "ceremony"
      ? `${basePath}/weddings/${item.weddingSlug}#events`
      : item.kind === "wedding"
        ? `${basePath}/weddings/${item.weddingSlug}`
        : `${basePath}/calendar`
    : `${basePath}/calendar`;

  const icon =
    item.kind === "wedding" ? (
      <Heart className="size-3 text-amber-500" />
    ) : item.kind === "ceremony" ? (
      <Flame className="size-3 text-rose-500" />
    ) : (
      <Calendar className="size-3 text-violet-500" />
    );

  const iconBg =
    item.kind === "wedding"
      ? "bg-amber-500/12"
      : item.kind === "ceremony"
        ? "bg-rose-500/12"
        : "bg-violet-500/12";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-start gap-2.5 overflow-hidden rounded-xl border border-border/50 bg-card px-3 py-2.5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        "transition-all duration-150 hover:border-border/80 hover:bg-muted/40 hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)]",
      )}
    >
      {/* type icon */}
      <div className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md", iconBg)}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold leading-tight text-foreground">{item.title}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {item.startAt && !item.allDay ? (
            <span className="text-[10.5px] font-medium tabular-nums text-muted-foreground/70">
              {formatTime(item.startAt)}
            </span>
          ) : (
            <span className="text-[10.5px] text-muted-foreground/50">All day</span>
          )}
          {item.weddingName && (
            <>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
                  item.kind === "wedding"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : item.kind === "ceremony"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                )}
              >
                {item.weddingName}
              </span>
            </>
          )}
          {item.cultureLabel && (
            <>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span className="text-[10.5px] text-muted-foreground/60">{item.cultureLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* left accent bar */}
      <div
        className={cn("absolute left-0 top-1/2 h-[55%] w-0.5 -translate-y-1/2 rounded-r-full opacity-0 transition-opacity duration-150 group-hover:opacity-100")}
        style={
          item.color && item.kind === "calendar"
            ? { backgroundColor: item.color }
            : undefined
        }
      />
    </Link>
  );
}

type UpcomingEventsPanelProps = {
  items: UpcomingEventItem[];
  todayStr: string;
  basePath?: string;
};

export function UpcomingEventsPanel({ items, todayStr, basePath = "/app" }: UpcomingEventsPanelProps) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(open));
  }, [open]);

  const groups = buildDateGroups(items, todayStr);
  const totalCount = items.length;

  return (
    <div
      className={cn(
        "relative flex flex-col border-l border-border/60 bg-card transition-[width] duration-300 ease-in-out overflow-hidden shrink-0",
        open ? "w-[272px]" : "w-10",
      )}
    >
      {/* Collapsed strip — just the toggle button */}
      {!open && (
        <div className="flex flex-col items-center pt-4">
          <button
            onClick={() => setOpen(true)}
            title="Show upcoming events"
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground",
              "hover:bg-muted hover:text-foreground transition-colors duration-150",
            )}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          {totalCount > 0 && (
            <span className="mt-2 w-6 rounded-full bg-rose-500/15 py-0.5 text-center text-[9px] font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {totalCount}
            </span>
          )}
        </div>
      )}

      {/* Expanded panel */}
      {open && (
        <>
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-md bg-violet-500/15">
                <Sparkles className="size-3 text-violet-500" />
              </div>
              <p className="text-[12.5px] font-semibold tracking-tight text-foreground">Upcoming</p>
              {totalCount > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-muted-foreground">
                  {totalCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              title="Collapse panel"
              className="flex size-6 items-center justify-center rounded-lg text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors duration-150"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          {/* Subtitle */}
          {groups.length > 0 && (
            <p className="shrink-0 px-3.5 pt-2 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/50">
              Next 7 days
            </p>
          )}

          {/* Content */}
          {groups.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col px-2.5 py-2.5">
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-violet-400/40 bg-violet-500/10">
                  <Sparkles className="size-4 text-violet-500" aria-hidden />
                </span>
                <p className="text-[12px] font-medium text-foreground">All clear</p>
                <p className="text-[11px] text-muted-foreground">No events or ceremonies in the next 7 days.</p>
              </div>
            </div>
          ) : (
            <OverlayScrollbarsComponent
              element="div"
              className="min-h-0 flex-1"
              options={{
                overflow: { x: "hidden", y: "scroll" },
                scrollbars: { theme: "os-theme-dark", autoHide: "scroll", autoHideSuspend: true, clickScroll: true },
              }}
              defer
            >
              <div className="flex flex-col gap-4 px-2.5 pb-4">
                {groups.map((group) => (
                  <div key={group.label}>
                    {/* Date group header */}
                    <div className="mb-1.5 flex items-baseline gap-1.5 px-1">
                      <span
                        className={cn(
                          "text-[11px] font-bold tracking-tight",
                          group.isToday ? "text-foreground" : "text-muted-foreground/80",
                        )}
                      >
                        {group.label}
                      </span>
                      {group.sublabel && (
                        <span className="text-[10px] text-muted-foreground/45">{group.sublabel}</span>
                      )}
                      {group.isToday && (
                        <span className="ml-auto rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                          Now
                        </span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <ItemRow key={item.id} item={item} basePath={basePath} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </OverlayScrollbarsComponent>
          )}
        </>
      )}
    </div>
  );
}
