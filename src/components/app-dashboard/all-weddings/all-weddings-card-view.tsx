"use client";

import Link from "next/link";

import type { AllWeddingRow } from "@/components/app-dashboard/all-weddings/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AllWeddingsCardViewProps = {
  items: AllWeddingRow[];
  basePath?: string;
};

function getInitials(label: string) {
  return label
    .split("&")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function stageToneClassName(stage: AllWeddingRow["stage"]) {
  if (stage === "completed") return "bg-muted text-muted-foreground";
  if (stage === "active") return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
  return "bg-violet-500/20 text-violet-700 dark:text-violet-300";
}

export function AllWeddingsCardView({ items, basePath = "/app" }: AllWeddingsCardViewProps) {
  const employeeLayout = basePath === "/app/employee";

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const progress = item.tasksTotal > 0 ? Math.round((item.tasksDone / item.tasksTotal) * 100) : 0;
        const primaryCulture = item.cultures[0] ?? "General";
        const secondaryCulture = item.cultures[1];
        const extraCultureCount = Math.max(0, item.cultures.length - 2);

        return (
          <Link
            key={item.id}
            href={`${basePath}/weddings/${item.id}`}
            className="group rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
          >
            <article className="space-y-3">
              <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10 border border-border/70">
                    <AvatarFallback className="text-xs font-semibold">{getInitials(item.coupleName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{item.coupleName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.venueName}, {item.city}
                    </p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", stageToneClassName(item.stage))}>
                  {item.stageLabel}
                </span>
              </header>

              <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight">
                  {item.stage === "completed" ? "Done" : item.daysAway}
                  {item.stage === "completed" ? "" : <span className="ml-1 text-sm font-medium text-muted-foreground">days</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.stage === "completed" ? item.dateLabel : `${item.dateLabel} wedding date`}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="rounded-md text-[10px] font-medium">
                  {primaryCulture}
                </Badge>
                {secondaryCulture ? (
                  <Badge variant="secondary" className="rounded-md text-[10px] font-medium">
                    {secondaryCulture}
                  </Badge>
                ) : null}
                {extraCultureCount > 0 ? (
                  <Badge variant="outline" className="rounded-md text-[10px] font-medium">
                    +{extraCultureCount}
                  </Badge>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{employeeLayout ? "Task progress" : "Tasks"}</span>
                  <span>
                    {item.tasksDone}/{item.tasksTotal}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      employeeLayout
                        ? "bg-violet-500/85 dark:bg-violet-400/80"
                        : item.overdueCount > 0
                          ? "bg-red-500/80"
                          : "bg-emerald-500/80",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{item.taskSubtitle}</p>
              </div>

              {employeeLayout ? (
                <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                  <div className="text-center">
                    <p className="text-2xl font-semibold tabular-nums text-amber-500 dark:text-amber-400">
                      {item.pendingCount}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold tabular-nums text-red-500 dark:text-red-400">
                      {item.overdueCount}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Overdue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {item.tasksDone}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Done</p>
                  </div>
                </div>
              ) : (
                <footer className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-700 dark:text-emerald-300">
                    Proposal: {item.proposalStatus}
                  </span>
                  <span className="rounded-md bg-amber-500/15 px-2 py-1 text-amber-700 dark:text-amber-300">
                    Invoice: {item.invoiceStatus}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">{item.budgetLabel}</span>
                </footer>
              )}
            </article>
          </Link>
        );
      })}
    </div>
  );
}
