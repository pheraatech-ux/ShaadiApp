"use client";

import { Calendar, MessageCircle } from "lucide-react";

import type { WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";

export type TaskLaneId = "todo" | "in_progress" | "needs_review" | "done";

type TaskKanbanColumnProps = {
  laneId: TaskLaneId;
  title: string;
  count: number;
  toneClassName: string;
  tasks: WeddingTasksBoardTask[];
  busyTaskId: string | null;
  draggingTaskId: string | null;
  dragOverLaneId: TaskLaneId | null;
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
  onDropTaskToLane: (laneId: TaskLaneId) => void;
  onDragEnterLane: (laneId: TaskLaneId) => void;
  onDragLeaveLane: (laneId: TaskLaneId) => void;
  onTaskClick: (taskId: string) => void;
};

const laneAccent: Record<TaskLaneId, string> = {
  todo: "bg-rose-400",
  in_progress: "bg-sky-400",
  needs_review: "bg-violet-400",
  done: "bg-emerald-400",
};

function getAssigneeInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function getDueMeta(task: WeddingTasksBoardTask): { label: string | null; dateStr: string | null } {
  if (!task.dueDate) return { label: null, dateStr: null };
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(`${task.dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - startToday.getTime()) / 86400000);
  const dateStr = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (task.isOverdue) return { label: `${Math.abs(diffDays)}d overdue`, dateStr };
  if (diffDays === 0) return { label: "Due today", dateStr };
  return { label: `${diffDays}d left`, dateStr };
}

export function TaskKanbanColumn({
  laneId,
  title,
  count,
  toneClassName,
  tasks,
  busyTaskId,
  draggingTaskId,
  dragOverLaneId,
  onDragStartTask,
  onDragEndTask,
  onDropTaskToLane,
  onDragEnterLane,
  onDragLeaveLane,
  onTaskClick,
}: TaskKanbanColumnProps) {
  const laneDragActive = dragOverLaneId === laneId;

  return (
    <section
      className={`min-w-[260px] flex-1 space-y-3 px-3 transition-all first:pl-0 last:pr-0 ${
        laneDragActive ? "rounded-2xl bg-primary/[0.03]" : ""
      }`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDropTaskToLane(laneId);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnterLane(laneId);
      }}
      onDragLeave={() => onDragLeaveLane(laneId)}
    >
      <header className="flex items-center gap-2 pb-1">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${laneAccent[laneId]}`} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClassName}`}>{count}</span>
      </header>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground/50">Empty</p>
        ) : (
          tasks.map((task) => {
            const { label: dueLabel, dateStr } = getDueMeta(task);

            const assigneeInitialsList = task.assigneeIds
              .slice(0, 3)
              .map((uid) => {
                const match = task.assigneeLabels[task.assigneeIds.indexOf(uid)] ?? uid;
                return getAssigneeInitials(match);
              });
            const extraAssignees = task.assigneeIds.length > 3 ? task.assigneeIds.length - 3 : 0;

            return (
              <article
                key={task.id}
                draggable={busyTaskId !== task.id}
                onClick={() => onTaskClick(task.id)}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", task.id);
                  onDragStartTask(task.id);
                }}
                onDragEnd={onDragEndTask}
                className={`group cursor-pointer rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md ${
                  draggingTaskId === task.id ? "scale-95 opacity-40" : ""
                }`}
              >
                {/* title */}
                <p className="mb-1.5 text-sm font-semibold leading-snug text-foreground">{task.title}</p>

                {/* description */}
                {task.description && (
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
                )}

                {/* tags */}
                <div className={`flex flex-wrap items-center gap-1.5 ${task.description ? "mb-4" : "mb-3 mt-2"}`}>
                  <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                    {task.priority}
                  </span>
                  {task.linkedEventLabel && (
                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                      {task.linkedEventLabel}
                    </span>
                  )}
                  {(task.isOverdue || task.assigneeIds.length === 0) && (
                    <span className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-400">
                      Flagged
                    </span>
                  )}
                </div>

                {/* footer row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {dueLabel ? (
                      <>
                        <Calendar className="size-3 shrink-0" />
                        <span className={task.isOverdue ? "font-semibold text-rose-400" : ""}>{dueLabel}</span>
                        <span className="text-border">|</span>
                        <span>{dateStr}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/40">No date</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="size-3" />
                      {task.commentCount}
                    </span>
                    <span className="flex items-center">
                      {assigneeInitialsList.length === 0 ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground/60">—</span>
                      ) : (
                        assigneeInitialsList.map((ini, i) => (
                          <span
                            key={i}
                            style={{ marginLeft: i > 0 ? "-4px" : 0 }}
                            className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary ring-1 ring-card"
                          >
                            {ini}
                          </span>
                        ))
                      )}
                      {extraAssignees > 0 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">+{extraAssignees}</span>
                      )}
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
