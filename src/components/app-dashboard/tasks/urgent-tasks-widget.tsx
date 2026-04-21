import { Calendar } from "lucide-react";
import Link from "next/link";

import { SectionCard } from "@/components/app-dashboard/dashboard/section-card";
import { UrgentTaskItem } from "@/components/app-dashboard/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UrgentTasksWidgetProps = {
  items: UrgentTaskItem[];
  /** Base route for the global tasks list (planner vs employee). */
  allTasksHref?: string;
};

function hasSpotlightData(item: UrgentTaskItem) {
  return item.dueDateLabel != null && item.daysOverdue != null;
}

export function UrgentTasksWidget({ items, allTasksHref = "/app/tasks" }: UrgentTasksWidgetProps) {
  return (
    <SectionCard
      title="Urgent tasks"
      action={
        <Link
          href={allTasksHref}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}
        >
          All tasks
        </Link>
      }
    >
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No overdue tasks. You&apos;re all caught up.
          </p>
        ) : (
          items.map((item) =>
            hasSpotlightData(item) ? (
              <article
                key={item.id}
                className="flex overflow-hidden rounded-2xl border border-border/80 bg-muted/15 shadow-sm dark:bg-muted/25"
              >
                <div className="w-1 shrink-0 bg-destructive" aria-hidden />
                <div className="min-w-0 flex-1 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-destructive" aria-hidden />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Needs attention now
                      </span>
                    </div>
                    <Badge
                      variant="destructive"
                      className="shrink-0 rounded-full border-0 bg-destructive/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive dark:bg-destructive/25 dark:text-red-200"
                    >
                      Overdue
                    </Badge>
                  </div>

                  <h3 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
                    {item.title}
                  </h3>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="min-w-0">
                        <span className="text-foreground/90">{item.coupleName}</span>
                        <span className="text-muted-foreground"> · {item.contextLabel}</span>
                      </span>
                      <span>
                        Due {item.dueDateLabel}
                        {" — "}
                        <span className="font-medium text-destructive">
                          {item.daysOverdue} {item.daysOverdue === 1 ? "day" : "days"} overdue
                        </span>
                      </span>
                      {item.commentCount != null && item.commentCount > 0 ? (
                        <>
                          <span className="text-border">·</span>
                          <span>
                            {item.commentCount} {item.commentCount === 1 ? "comment" : "comments"}
                          </span>
                        </>
                      ) : null}
                    </div>

                    {item.taskHref ? (
                      <Link
                        href={item.taskHref}
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                      >
                        View task →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ) : (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border border-border/70 px-4 py-3",
                  item.completed && "bg-muted/40",
                )}
              >
                <p
                  className={cn(
                    "text-sm",
                    item.completed && "text-muted-foreground line-through",
                  )}
                >
                  {item.title}
                </p>
                {item.overdueLabel ? (
                  <p className="mt-1 text-xs text-destructive">{item.overdueLabel}</p>
                ) : null}
              </div>
            ),
          )
        )}
      </div>
    </SectionCard>
  );
}
