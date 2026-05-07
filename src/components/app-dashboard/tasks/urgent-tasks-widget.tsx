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
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-1.5 sm:px-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-amber-500" aria-hidden />
          <p className="text-sm font-semibold text-foreground">Overdue tasks</p>
        </div>
        {disableNavigation ? (
          <span className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}>
            View all tasks
          </span>
        ) : (
          <Link href={allTasksHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}>
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
          <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No overdue tasks. You&apos;re all caught up.
          </p>
        ) : (
          items.map((item) => {
            const isOverdue = item.daysOverdue != null && item.daysOverdue > 0;
            const isDueSoon = !isOverdue && !!item.overdueLabel;

            const rowContent = (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-foreground">
                    {item.title}
                  </p>
                  {(item.coupleName || item.contextLabel) && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[item.coupleName, item.contextLabel].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>

                {item.dueDateLabel && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Due {item.dueDateLabel}</p>
                    {isOverdue && (
                      <p className="mt-0.5 text-xs font-medium text-destructive">
                        {item.daysOverdue} {item.daysOverdue === 1 ? "day" : "days"} overdue
                      </p>
                    )}
                    {isDueSoon && item.overdueLabel && (
                      <p className="mt-0.5 text-xs font-medium text-amber-500">{item.overdueLabel}</p>
                    )}
                  </div>
                )}

                <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
              </>
            );

            const rowClass = cn(
              "flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/15 px-4 py-3 dark:bg-muted/25",
              item.taskHref && !disableNavigation && "transition-colors hover:bg-muted/30",
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
