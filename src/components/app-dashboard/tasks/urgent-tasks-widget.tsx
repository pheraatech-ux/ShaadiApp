"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { UrgentTaskItem } from "@/components/app-dashboard/dashboard/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UrgentTasksWidgetProps = {
  items: UrgentTaskItem[];
  allTasksHref?: string;
  disableNavigation?: boolean;
};

export function UrgentTasksWidget({
  items,
  allTasksHref = "/app/tasks",
  disableNavigation = false,
}: UrgentTasksWidgetProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-amber-500/15">
            <AlertTriangle className="size-3 text-amber-500" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Overdue tasks</p>
          {items.length > 0 && (
            <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[10px] font-bold tabular-nums text-destructive">
              {items.length}
            </span>
          )}
        </div>
        {disableNavigation ? (
          <span className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs text-muted-foreground")}>
            View all tasks
          </span>
        ) : (
          <Link href={allTasksHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs text-muted-foreground hover:text-foreground")}>
            View all tasks
          </Link>
        )}
      </div>

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
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/15 px-4 py-8 text-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/15">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No overdue tasks right now.</p>
            </div>
          ) : (
            items.map((item) => {
              const isOverdue = item.daysOverdue != null && item.daysOverdue > 0;
              const isDueSoon = !isOverdue && !!item.overdueLabel;

              const rowContent = (
                <>
                  {/* Left severity accent */}
                  <div
                    className={cn(
                      "absolute left-0 top-1/2 h-[60%] w-0.5 -translate-y-1/2 rounded-r-full",
                      isOverdue
                        ? "bg-destructive/70"
                        : isDueSoon
                        ? "bg-amber-400/70"
                        : "bg-muted-foreground/20",
                    )}
                  />

                  <div className="min-w-0 flex-1 pl-1">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                      {item.title}
                    </p>
                    {(item.coupleName || item.contextLabel) && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                        {[item.coupleName, item.contextLabel].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  {item.dueDateLabel && (
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-muted-foreground/70">Due {item.dueDateLabel}</p>
                      {isOverdue && (
                        <span className="mt-0.5 inline-block rounded-md bg-destructive/12 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                          {item.daysOverdue}d overdue
                        </span>
                      )}
                      {isDueSoon && item.overdueLabel && (
                        <span className="mt-0.5 inline-block rounded-md bg-amber-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {item.overdueLabel}
                        </span>
                      )}
                    </div>
                  )}

                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </>
              );

              const rowClass = cn(
                "group relative flex shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3",
                "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                item.taskHref && !disableNavigation
                  ? "transition-all duration-150 hover:border-border hover:bg-muted/40 hover:shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
                  : "",
              );

              return item.taskHref && !disableNavigation ? (
                <Link key={item.id} href={item.taskHref} className={rowClass}>
                  {rowContent}
                </Link>
              ) : (
                <div key={item.id} className={rowClass}>
                  {rowContent}
                </div>
              );
            })
          )}
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}
