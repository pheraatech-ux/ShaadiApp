"use client";

import { Calendar, CalendarDays, ChevronRight, Flame, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import type { UpcomingEventItem } from "./types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    const d = new Date(dateStr + "T00:00:00");
    let label: string;
    let sublabel: string | null = null;
    let isToday = false;

    if (dateStr === todayStr) {
      label = "Today";
      sublabel = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      isToday = true;
    } else if (dateStr === tomorrowStr) {
      label = "Tomorrow";
      sublabel = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    } else {
      label = d.toLocaleDateString("en-IN", { weekday: "long" });
      sublabel = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }

    result.push({ label, sublabel, isToday, items: groupItems });
  }

  return result;
}

function formatTime(startAt: string): string {
  return new Date(startAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function ItemRow({ item, basePath }: { item: UpcomingEventItem; basePath: string }) {
  const href =
    item.weddingSlug
      ? item.kind === "ceremony"
        ? `${basePath}/weddings/${item.weddingSlug}#events`
        : item.kind === "wedding"
          ? `${basePath}/weddings/${item.weddingSlug}`
          : `${basePath}/calendar`
      : `${basePath}/calendar`;

  const accent =
    item.kind === "wedding"
      ? { bar: "bg-amber-400", icon: <Heart className="size-2.5 text-amber-500" />, iconBg: "bg-amber-500/12", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" }
      : item.kind === "ceremony"
        ? { bar: "bg-rose-400", icon: <Flame className="size-2.5 text-rose-500" />, iconBg: "bg-rose-500/12", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400" }
        : { bar: "bg-violet-400", icon: <Calendar className="size-2.5 text-violet-500" />, iconBg: "bg-violet-500/12", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400" };

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-2.5 overflow-hidden rounded-xl border border-border/60 bg-card px-3.5 py-2.5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        "transition-all duration-150 hover:border-border hover:bg-muted/40 hover:shadow-[0_1px_4px_rgba(0,0,0,0.07)]",
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-1/2 h-[55%] w-0.5 -translate-y-1/2 rounded-r-full", accent.bar)} />

      {/* Type icon */}
      <div className={cn("flex size-5 shrink-0 items-center justify-center rounded-md", accent.iconBg)}>
        {accent.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold leading-tight text-foreground">{item.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {item.startAt && !item.allDay ? (
            <span className="text-[10.5px] tabular-nums text-muted-foreground/70">{formatTime(item.startAt)}</span>
          ) : (
            <span className="text-[10.5px] text-muted-foreground/45">All day</span>
          )}
          {item.weddingName && item.kind !== "wedding" && (
            <>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span className={cn("rounded px-1 py-px text-[9.5px] font-semibold uppercase tracking-wide", accent.badge)}>
                {item.weddingName}
              </span>
            </>
          )}
          {item.cultureLabel && (
            <>
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span className="truncate text-[10.5px] text-muted-foreground/60">{item.cultureLabel}</span>
            </>
          )}
        </div>
      </div>

      <ChevronRight className="size-3 shrink-0 text-muted-foreground/30 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

type UpcomingEventsWidgetProps = {
  items: UpcomingEventItem[];
  todayStr: string;
  basePath?: string;
};

export function UpcomingEventsWidget({ items, todayStr, basePath = "/app" }: UpcomingEventsWidgetProps) {
  const groups = buildDateGroups(items, todayStr);
  const totalCount = items.length;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-violet-500/15">
            <Sparkles className="size-3 text-violet-500" />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Upcoming</p>
          {totalCount > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
              {totalCount}
            </span>
          )}
        </div>
        <Link
          href={`${basePath}/calendar`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 rounded-full text-xs text-muted-foreground hover:text-foreground")}
        >
          <CalendarDays className="size-3" />
          Calendar
        </Link>
      </div>

      {/* Column labels */}
      {groups.length > 0 && (
        <div className="flex shrink-0 items-center border-b border-border/50 bg-muted/20 px-4 py-1.5 sm:px-5">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
            Next 7 days
          </span>
        </div>
      )}

      {/* Scrollable list */}
      {groups.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-violet-400/40 bg-violet-500/10">
              <Sparkles className="size-4 text-violet-500" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">No events or ceremonies in the next 7 days.</p>
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
          <div className="flex flex-col gap-3.5 px-3 py-3">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date group header */}
                <div className="mb-1.5 flex items-baseline gap-1.5 px-1">
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-tight",
                      group.isToday ? "text-foreground" : "text-muted-foreground/70",
                    )}
                  >
                    {group.label}
                  </span>
                  {group.sublabel && (
                    <span className="text-[10px] text-muted-foreground/40">{group.sublabel}</span>
                  )}
                  {group.isToday && (
                    <span className="ml-auto rounded-full bg-emerald-500/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Now
                    </span>
                  )}
                </div>
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
    </div>
  );
}
