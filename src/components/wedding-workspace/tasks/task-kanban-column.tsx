"use client";

import { AlertCircle, MessageCircle } from "lucide-react";

import type {
  WeddingTasksBoardTask,
} from "@/components/wedding-workspace/tasks/types";

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
};

function getAssigneeInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function getTaskDueLabel(task: WeddingTasksBoardTask) {
  if (!task.dueDate) return "No due date";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(`${task.dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - startToday.getTime()) / 86400000);
  if (task.isOverdue) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === 0) return "Due today";
  return `Due in ${diffDays} days`;
}

function getEventTag(task: WeddingTasksBoardTask) {
  const lowered = task.title.toLowerCase();
  if (lowered.includes("sangeet")) return "Sangeet";
  if (lowered.includes("mehendi")) return "Mehendi";
  if (lowered.includes("anand karaj")) return "Anand Karaj";
  return "General";
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
}: TaskKanbanColumnProps) {
  const laneDragActive = dragOverLaneId === laneId;

  return (
    <section
      className={`rounded-xl border bg-card/90 p-3 transition-colors ${
        laneDragActive ? "border-primary/70 ring-2 ring-primary/30" : "border-border/70"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
      }}
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
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClassName}`}>{count}</span>
      </header>
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-center text-xs text-muted-foreground">
            No tasks in this column
          </p>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              draggable={busyTaskId !== task.id}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", task.id);
                onDragStartTask(task.id);
              }}
              onDragEnd={onDragEndTask}
              className={`space-y-3 rounded-lg border border-border/70 bg-background/80 p-3 transition-opacity ${
                draggingTaskId === task.id ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base leading-snug font-medium text-foreground">{task.title}</p>
                <span className={`h-2 w-2 shrink-0 rounded-full ${task.isOverdue ? "bg-rose-400" : "bg-primary/70"}`} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-medium text-rose-300">{task.priority[0].toUpperCase() + task.priority.slice(1)}</span>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-300">{task.linkedEventLabel || getEventTag(task)}</span>
                {task.isOverdue || !task.assigneeId ? (
                  <span className="rounded bg-violet-500/10 px-1.5 py-0.5 font-medium text-violet-300">Flagged</span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" />
                  <span className={task.isOverdue ? "font-medium text-rose-300" : ""}>{getTaskDueLabel(task)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3.5" />
                    {(task.id.charCodeAt(0) % 4) + 1}
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {getAssigneeInitials(task.assigneeLabel)}
                  </span>
                </div>
              </div>
              <div className="border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                <p className="truncate">Raised by {task.raisedByLabel}</p>
                <p className="truncate">Assigned to {task.assigneeLabel}</p>
                <p className="truncate">
                  Visibility:{" "}
                  {task.visibility
                    .map((item) => item.replace("_", " "))
                    .join(", ")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
