"use client";

import { useState } from "react";
import { ChevronRight, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { AddWeddingFlowDialog } from "@/components/app-dashboard/dashboard/add-wedding-flow-dialog";
import { WeddingItem } from "@/components/app-dashboard/dashboard/types";
import { Button, buttonVariants } from "@/components/ui/button";
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

const AVATAR_PALETTES = [
  { bg: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-400/30" },
  { bg: "bg-rose-500/15 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-400/30" },
  { bg: "bg-sky-500/15 dark:bg-sky-500/20", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-400/30" },
  { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-400/30" },
  { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-400/30" },
];

type WeddingGlanceWidgetProps = {
  items: WeddingItem[];
  basePath?: string;
  canCreateWedding?: boolean;
};

export function WeddingGlanceWidget({
  items,
  basePath = "/app",
  canCreateWedding = true,
}: WeddingGlanceWidgetProps) {
  const [addWeddingOpen, setAddWeddingOpen] = useState(false);

  const sorted = [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === "upcoming" ? -1 : 1;
    return a.daysLeft - b.daysLeft;
  });

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
          <div className="flex size-5 items-center justify-center rounded-md bg-rose-500/15">
            <Heart className="size-3 text-rose-500" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Weddings at a glance</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={`${basePath}/weddings`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs text-muted-foreground hover:text-foreground")}
          >
            View all
          </Link>
          {canCreateWedding ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-xl text-xs"
              onClick={() => setAddWeddingOpen(true)}
            >
              <Plus />
              New wedding
            </Button>
          ) : null}
        </div>
      </div>

      {/* Column labels */}
      {sorted.length > 0 && (
        <div className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-1.5 sm:px-5">
          <span className="flex-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
            Weddings
          </span>
          <div className="grid w-48 shrink-0 grid-cols-3 text-center">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">Tasks</span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">Overdue</span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">Budget</span>
          </div>
          <div className="w-4 shrink-0" />
        </div>
      )}

      {/* Rows */}
      {sorted.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-rose-400/40 bg-rose-500/10">
              <Heart className="size-4 text-rose-500" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {canCreateWedding ? "No weddings yet" : "No weddings assigned"}
              </p>
              <p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                {canCreateWedding
                  ? "Add your first couple to start planning tasks, budgets, and timelines in one place."
                  : "Weddings you are added to will appear here."}
              </p>
            </div>
            {canCreateWedding ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 rounded-xl text-xs"
                onClick={() => setAddWeddingOpen(true)}
              >
                <Plus />
                Add your first wedding
              </Button>
            ) : null}
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
          <div className="flex flex-col gap-1.5 px-3 py-3">
            {sorted.map((item, i) => {
              const palette = AVATAR_PALETTES[i % AVATAR_PALETTES.length];
              return (
                <Link
                  key={item.id}
                  href={`${basePath}/weddings/${item.id}`}
                  className={cn(
                    "group flex shrink-0 items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-2.5",
                    "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                    "transition-all duration-150 hover:border-border hover:bg-muted/40 hover:shadow-[0_1px_4px_rgba(0,0,0,0.07)]",
                  )}
                >
                  {/* Avatar + name */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1",
                        palette.bg,
                        palette.text,
                        palette.ring,
                      )}
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                        {item.city} · {item.firstEventDate}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid w-48 shrink-0 grid-cols-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {item.tasksDone}/{item.tasksTotal}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      {item.tasksOverdue > 0 ? (
                        <span className="rounded-md bg-destructive/12 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-destructive">
                          {item.tasksOverdue}
                        </span>
                      ) : (
                        <p className="text-sm font-semibold text-muted-foreground/50">—</p>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-xs font-semibold tabular-nums text-foreground">
                        {toLakh(item.budgetSpentPaise)}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        / {toLakh(item.budgetTotalPaise)}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </Link>
              );
            })}
          </div>
        </OverlayScrollbarsComponent>
      )}

      {canCreateWedding ? (
        <AddWeddingFlowDialog open={addWeddingOpen} onOpenChange={setAddWeddingOpen} />
      ) : null}
    </div>
  );
}
