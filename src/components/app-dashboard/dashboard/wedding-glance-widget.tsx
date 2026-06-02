"use client";

import { ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { WeddingItem } from "@/components/app-dashboard/dashboard/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toLakh(paise: number) {
  const val = paise / 10_000_000;
  return `₹${val % 1 === 0 ? val : parseFloat(val.toFixed(1))}L`;
}

function getInitials(name: string) {
  return name
    .split("&")
    .map((p) => p.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  "bg-sky-500/20 text-sky-600 dark:text-sky-400",
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
];

type WeddingGlanceWidgetProps = {
  items: WeddingItem[];
  basePath?: string;
};

export function WeddingGlanceWidget({ items, basePath = "/app" }: WeddingGlanceWidgetProps) {
  const sorted = [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
    return a.daysLeft - b.daysLeft;
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-1.5 sm:px-5">
        <div className="flex items-center gap-2">
          <Heart className="size-3.5 text-primary" aria-hidden />
          <p className="text-sm font-semibold text-foreground">Weddings at a glance</p>
        </div>
        <Link
          href={`${basePath}/weddings`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}
        >
          View all →
        </Link>
      </div>

      {/* Column labels */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-1.5 sm:px-5">
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Weddings</span>
        <div className="grid w-48 shrink-0 grid-cols-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Tasks</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Overdue</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Budget</span>
        </div>
        <div className="w-6 shrink-0" />
      </div>

      {/* Rows */}
      <OverlayScrollbarsComponent
        element="div"
        className="min-h-0 flex-1"
options={{
          overflow: { x: "hidden", y: "scroll" },
          scrollbars: { theme: "os-theme-dark", autoHide: "scroll", autoHideSuspend: true, clickScroll: true },
        }}
        defer
      >
        <div className="flex flex-col gap-1.5 px-3 py-3">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No weddings yet.
          </p>
        ) : (
          sorted.map((item, i) => (
            <Link
              key={item.id}
              href={`${basePath}/weddings/${item.id}`}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-2.5 transition-colors hover:bg-muted/30 dark:bg-muted/25"
            >
              {/* Avatar + name */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    AVATAR_COLORS[i % AVATAR_COLORS.length],
                  )}
                >
                  {getInitials(item.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-foreground">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.city} · {item.firstEventDate}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid w-48 shrink-0 grid-cols-3 text-center">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold text-foreground">{item.tasksDone}/{item.tasksTotal}</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className={cn("text-sm font-semibold", item.tasksOverdue > 0 ? "text-destructive" : "text-foreground")}>
                    {item.tasksOverdue}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs font-medium text-foreground">{toLakh(item.budgetSpentPaise)}</p>
                  <p className="text-[10px] text-muted-foreground">/ {toLakh(item.budgetTotalPaise)}</p>
                </div>
              </div>

              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
            </Link>
          ))
        )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
