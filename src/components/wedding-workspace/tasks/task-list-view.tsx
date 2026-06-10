"use client";

import { Calendar, ChevronRight, MessageCircle } from "lucide-react";

import { TaskStatusBadge } from "@/components/wedding-workspace/tasks/task-status-badge";
import type { WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";
import { cn } from "@/lib/utils";

const PRIORITY_CLASS: Record<string, string> = {
  high: "bg-rose-500/10 text-rose-400",
  medium: "bg-amber-500/10 text-amber-400",
  low: "bg-emerald-500/10 text-emerald-400",
};

function DueCell({ task }: { task: WeddingTasksBoardTask }) {
  if (!task.dueDate) return <span className="text-muted-foreground/40">—</span>;
  const due = new Date(`${task.dueDate}T00:00:00`);
  const dateStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (task.isOverdue) {
    return (
      <span className="flex items-center gap-1 font-semibold text-rose-400">
        <Calendar className="size-3 shrink-0" />
        {dateStr}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Calendar className="size-3 shrink-0" />
      {dateStr}
    </span>
  );
}

type TaskListViewProps = {
  tasks: WeddingTasksBoardTask[];
  onTaskClick: (taskId: string) => void;
  showWeddingBadge?: boolean;
};

export function TaskListView({ tasks, onTaskClick, showWeddingBadge }: TaskListViewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <header className="hidden grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)_auto] items-center gap-3 border-b border-border/60 px-4 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
        <span>Task</span>
        <span className="text-center">Status</span>
        <span className="text-center">Priority</span>
        <span className="text-center">Assignees</span>
        <span className="text-center">Due date</span>
        <span className="text-center">Event</span>
        <span className="text-center">Comments</span>
        <span className="w-4" />
      </header>

      <div className="divide-y divide-border/60">
        {tasks.map((task) => {
          const assigneeText = task.assigneeLabels.length === 0
            ? "Unassigned"
            : task.assigneeLabels.length <= 2
            ? task.assigneeLabels.join(", ")
            : `${task.assigneeLabels.slice(0, 2).join(", ")} +${task.assigneeLabels.length - 2}`;

          return (
            <article
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="grid cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-muted/20 md:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.5fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{task.title}</p>
                {task.description && (
                  <p className="truncate text-xs text-muted-foreground">{task.description}</p>
                )}
                {showWeddingBadge && task.weddingName && (
                  <span className="mt-1 inline-block rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                    {task.weddingName}
                  </span>
                )}
              </div>

              <div className="flex justify-center">
                <TaskStatusBadge status={task.status} />
              </div>

              <div className="flex justify-center">
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_CLASS[task.priority] ?? "bg-muted text-muted-foreground")}>
                  {task.priority}
                </span>
              </div>

              <div className="min-w-0 text-center text-xs text-muted-foreground">
                <p className={cn("truncate", task.assigneeLabels.length === 0 && "text-muted-foreground/40 italic")}>
                  {assigneeText}
                </p>
              </div>

              <div className="flex justify-center text-xs">
                <DueCell task={task} />
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <span className="truncate">{task.linkedEventLabel}</span>
              </div>

              <div className="flex justify-center text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="size-3" />
                  {task.commentCount}
                </span>
              </div>
              <div className="flex justify-end">
                <ChevronRight className="size-4 text-muted-foreground/50" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
