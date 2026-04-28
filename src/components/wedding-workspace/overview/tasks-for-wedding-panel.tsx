import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";
import { cn } from "@/lib/utils";

type TasksForWeddingPanelProps = {
  tasks: WeddingTasksBoardTask[];
  onTaskClick?: (task: WeddingTasksBoardTask) => void;
  /** Link to the full tasks tab — shows "Show all tasks" button when provided. */
  tasksHref?: string;
  /** Total number of tasks (before the top-3 slice) — shown in the "Show all" label. */
  totalCount?: number;
};

function formatDueDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type StatusConfig = { label: string; className: string };

function getStatusConfig(task: WeddingTasksBoardTask): StatusConfig {
  if (task.isOverdue) return { label: "OVERDUE", className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" };
  if (task.status === "done") return { label: "DONE", className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30" };
  if (task.status === "in_progress") return { label: "IN PROGRESS", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" };
  if (task.status === "needs_review") return { label: "IN REVIEW", className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" };
  return { label: "PENDING", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
}

export function TasksForWeddingPanel({ tasks, onTaskClick, tasksHref, totalCount }: TasksForWeddingPanelProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tasks for this wedding
        </h2>
        {tasksHref && (
          <Link
            href={tasksHref}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {totalCount && totalCount > tasks.length ? `Show all ${totalCount} tasks` : "Show all tasks"}
            <ArrowRight className="size-3" />
          </Link>
        )}
      </header>

      {tasks.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">No tasks assigned to you for this wedding.</p>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border/60 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Task</span>
            <span className="w-24 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
            <span className="w-16 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Due</span>
            <span className="w-24 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="w-4" />
          </div>

          <div className="divide-y divide-border/60">
            {tasks.map((task) => {
              const statusCfg = getStatusConfig(task);
              return (
                <div
                  key={task.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3",
                    onTaskClick && "cursor-pointer transition-colors hover:bg-muted/40",
                  )}
                  onClick={() => onTaskClick?.(task)}
                  role={onTaskClick ? "button" : undefined}
                  tabIndex={onTaskClick ? 0 : undefined}
                  onKeyDown={onTaskClick ? (e) => { if (e.key === "Enter" || e.key === " ") onTaskClick(task); } : undefined}
                >
                  <span className="truncate text-sm font-medium text-foreground">{task.title}</span>

                  <span className="w-24">
                    <Badge
                      variant="outline"
                      className="truncate rounded-md border-border/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"
                    >
                      {task.linkedEventLabel === "General (no event)" ? "General" : task.linkedEventLabel}
                    </Badge>
                  </span>

                  <span className={cn("w-16 text-xs font-medium", task.isOverdue ? "text-red-500" : "text-foreground")}>
                    {task.dueDate ? (
                      <span className="flex items-center gap-0.5">
                        {formatDueDate(task.dueDate)}
                        {task.isOverdue && <AlertTriangle className="size-3 shrink-0" />}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>

                  <span className="w-24">
                    <Badge
                      variant="outline"
                      className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", statusCfg.className)}
                    >
                      {statusCfg.label}
                    </Badge>
                  </span>

                  <span
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
