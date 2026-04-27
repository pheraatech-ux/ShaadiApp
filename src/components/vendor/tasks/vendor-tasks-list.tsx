"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TaskStatus = "todo" | "in_progress" | "needs_review" | "done";

type VendorTaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  priority: string;
  description: string | null;
};

type VendorTasksListProps = {
  tasks: VendorTaskItem[];
};

type FilterTab = "all" | "pending" | "in_progress" | "done";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  needs_review: "Needs review",
  done: "Done",
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  todo: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  needs_review: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function isPastDue(due: string | null) {
  return due ? new Date(due) < new Date() : false;
}

export function VendorTasksList({ tasks }: VendorTasksListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.status === "todo" || t.status === "needs_review";
    if (filter === "in_progress") return t.status === "in_progress";
    if (filter === "done") return t.status === "done";
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you for this wedding.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-16 text-center">
          <ClipboardList className="mb-3 size-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">No tasks here</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const pastDue = task.status !== "done" && isPastDue(task.due_date);
            return (
              <Link
                key={task.id}
                href={`/vendor/tasks/${task.id}`}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  {task.due_date && (
                    <p className={`mt-0.5 text-xs ${pastDue ? "text-destructive" : "text-muted-foreground"}`}>
                      {pastDue ? "Overdue · " : "Due "}
                      {fmtDate(task.due_date)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className={STATUS_CLASSES[task.status]}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground/50" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
