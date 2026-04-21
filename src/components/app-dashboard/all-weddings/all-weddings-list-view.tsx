"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";

import type { AllWeddingRow } from "@/components/app-dashboard/all-weddings/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AllWeddingsListViewProps = {
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

export function AllWeddingsListView({ items, basePath = "/app" }: AllWeddingsListViewProps) {
  const employeeLayout = basePath === "/app/employee";

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <header className="hidden grid-cols-[2fr_0.9fr_1fr_0.9fr_1fr_1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
        <span>Couple & wedding</span>
        <span>Status</span>
        <span>Tasks</span>
        <span>Days away</span>
        <span>Documents</span>
        <span>{employeeLayout ? "Task counts" : "Budget"}</span>
        <span className="text-right">Action</span>
      </header>

      <div className="divide-y divide-border/60">
        {items.map((item) => (
          <article key={item.id} className="grid gap-3 px-4 py-3 md:grid-cols-[2fr_0.9fr_1fr_0.9fr_1fr_1fr_auto] md:items-center">
            <Link href={`${basePath}/weddings/${item.id}`} className="group min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-10 border border-border/70">
                  <AvatarFallback className="text-xs font-semibold">{getInitials(item.coupleName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold group-hover:underline">{item.coupleName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.venueName}, {item.city}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.cultures.slice(0, 2).map((culture) => (
                      <Badge key={culture} variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">
                        {culture}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            <div>
              <span className={cn("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold", stageToneClassName(item.stage))}>
                {item.overdueCount > 0 ? `${item.overdueCount} overdue` : item.stageLabel}
              </span>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-foreground">
                {item.tasksDone}/{item.tasksTotal}
              </p>
              <p className="text-muted-foreground">{item.taskSubtitle}</p>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-foreground">{item.stage === "completed" ? "Done" : item.daysAway}</p>
              <p className="text-muted-foreground">{item.dateLabel}</p>
            </div>

            <div className="text-xs">
              <p className="font-semibold text-foreground">{item.documentsCount}</p>
              <p className="text-muted-foreground">files</p>
            </div>

            {employeeLayout ? (
              <div className="grid grid-cols-3 gap-1 text-center text-xs md:max-w-[200px]">
                <div>
                  <p className="text-lg font-semibold tabular-nums text-amber-500 dark:text-amber-400">{item.pendingCount}</p>
                  <p className="text-[9px] font-medium uppercase leading-tight text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums text-red-500 dark:text-red-400">{item.overdueCount}</p>
                  <p className="text-[9px] font-medium uppercase leading-tight text-muted-foreground">Overdue</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{item.tasksDone}</p>
                  <p className="text-[9px] font-medium uppercase leading-tight text-muted-foreground">Done</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground">{item.budgetLabel}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-md bg-emerald-500/15 px-1.5 py-0 text-emerald-700 dark:text-emerald-300">
                    Proposal: {item.proposalStatus}
                  </span>
                  <span className="rounded-md bg-amber-500/15 px-1.5 py-0 text-amber-700 dark:text-amber-300">
                    Invoice: {item.invoiceStatus}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="ghost" size="icon-sm" className="rounded-lg text-muted-foreground">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
