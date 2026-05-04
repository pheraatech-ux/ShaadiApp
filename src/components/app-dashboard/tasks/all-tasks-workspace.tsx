"use client";

import { useMemo, useState } from "react";

import { LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";

import { useAllTasksQuery, useInvalidateAllTasks } from "@/components/app-dashboard/tasks/use-all-tasks-query";
import { NewTaskDialog } from "@/components/wedding-workspace/tasks/new-task-dialog";
import { TaskDetailPanel } from "@/components/wedding-workspace/tasks/task-detail-panel";
import { TaskKanbanColumn, type TaskLaneId } from "@/components/wedding-workspace/tasks/task-kanban-column";
import { TaskKpiCards } from "@/components/wedding-workspace/tasks/task-kpi-cards";
import { TaskListView } from "@/components/wedding-workspace/tasks/task-list-view";
import { TaskMemberStatsCards } from "@/components/wedding-workspace/tasks/task-member-stats-cards";
import type { AllTasksBoardViewModel, WeddingTasksBoardStatus } from "@/components/wedding-workspace/tasks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TopFilter = "all" | "my" | "overdue" | "unassigned";

type AllTasksWorkspaceProps = {
  view: AllTasksBoardViewModel;
};

export function AllTasksWorkspace({ view }: AllTasksWorkspaceProps) {
  const { data: tasks } = useAllTasksQuery(view.tasks);
  const invalidateTasks = useInvalidateAllTasks();

  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, WeddingTasksBoardStatus>>({});
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverLaneId, setDragOverLaneId] = useState<TaskLaneId | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TopFilter>("all");
  const [weddingFilter, setWeddingFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [displayMode, setDisplayMode] = useState<"kanban" | "list">("kanban");
  const [createForWeddingSlug, setCreateForWeddingSlug] = useState(view.weddings[0]?.slug ?? "");

  const tasksWithOptimistic = useMemo(() => {
    if (Object.keys(optimisticStatus).length === 0) return tasks;
    return tasks.map((task) =>
      optimisticStatus[task.id] ? { ...task, status: optimisticStatus[task.id] } : task,
    );
  }, [tasks, optimisticStatus]);

  const summary = useMemo(() => {
    const total = tasksWithOptimistic.length;
    const completed = tasksWithOptimistic.filter((t) => t.status === "done").length;
    const overdue = tasksWithOptimistic.filter((t) => t.isOverdue).length;
    const dueThisWeek = tasksWithOptimistic.filter((t) => t.isDueThisWeek).length;
    const myTasks = tasksWithOptimistic.filter((t) => t.assigneeIds.includes(view.currentUserId)).length;
    return { total, completed, overdue, dueThisWeek, myTasks };
  }, [tasksWithOptimistic, view.currentUserId]);

  const filteredTasks = useMemo(() => {
    let current = tasksWithOptimistic;

    if (activeFilter === "my") current = current.filter((t) => t.assigneeIds.includes(view.currentUserId));
    if (activeFilter === "overdue") current = current.filter((t) => t.isOverdue);
    if (activeFilter === "unassigned") current = current.filter((t) => t.assigneeIds.length === 0);

    if (weddingFilter !== "all") current = current.filter((t) => t.weddingSlug === weddingFilter);

    if (assigneeFilter !== "all") {
      current = current.filter((t) =>
        assigneeFilter === "unassigned" ? t.assigneeIds.length === 0 : t.assigneeIds.includes(assigneeFilter),
      );
    }

    if (priorityFilter !== "all") current = current.filter((t) => t.priority.toLowerCase() === priorityFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      current = current.filter((t) => t.title.toLowerCase().includes(q));
    }

    return current;
  }, [activeFilter, weddingFilter, assigneeFilter, priorityFilter, search, tasksWithOptimistic, view.currentUserId]);

  const columns = useMemo(() => ({
    todo: filteredTasks.filter((t) => t.status === "todo"),
    inProgress: filteredTasks.filter((t) => t.status === "in_progress"),
    needsReview: filteredTasks.filter((t) => t.status === "needs_review"),
    done: filteredTasks.filter((t) => t.status === "done"),
  }), [filteredTasks]);

  const laneToStatus: Record<TaskLaneId, WeddingTasksBoardStatus> = {
    todo: "todo",
    in_progress: "in_progress",
    needs_review: "needs_review",
    done: "done",
  };

  const laneLabel: Record<TaskLaneId, string> = {
    todo: "To do",
    in_progress: "In progress",
    needs_review: "Needs review",
    done: "Done",
  };

  async function patchTask(taskId: string, weddingSlug: string, updates: { status?: WeddingTasksBoardStatus }) {
    setBusyTaskId(taskId);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/tasks`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: updates.status }),
      });
      if (!response.ok) throw new Error("Unable to update task.");
      await invalidateTasks();
    } finally {
      setBusyTaskId(null);
    }
  }

  async function moveTaskToLane(taskId: string, laneId: TaskLaneId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = laneToStatus[laneId];
    setOptimisticStatus((prev) => ({ ...prev, [taskId]: newStatus }));
    toast.success(`"${task.title}" moved to ${laneLabel[laneId]}`);
    try {
      await patchTask(taskId, task.weddingSlug, { status: newStatus });
    } catch {
      toast.error(`Failed to move "${task.title}". Please try again.`);
    } finally {
      setOptimisticStatus((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    }
  }

  const selectedTask = selectedTaskId
    ? tasksWithOptimistic.find((t) => t.id === selectedTaskId) ?? null
    : null;
  const selectedWedding = selectedTask
    ? view.weddings.find((w) => w.slug === selectedTask.weddingSlug) ?? null
    : null;

  if (selectedTask && selectedWedding) {
    return (
      <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-6">
        <TaskDetailPanel
          weddingSlug={selectedTask.weddingSlug}
          task={selectedTask}
          members={selectedWedding.members}
          onBack={() => setSelectedTaskId(null)}
          onTaskUpdated={() => { void invalidateTasks(); }}
          onTaskDeleted={() => {
            setSelectedTaskId(null);
            void invalidateTasks();
          }}
        />
      </div>
    );
  }

  const createForWedding = view.weddings.find((w) => w.slug === createForWeddingSlug) ?? view.weddings[0];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="-mx-4 border-b border-border/60 px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">All Tasks</h1>
          <div className="flex items-center gap-2">
            {view.weddings.length >= 1 && (
              <Select value={weddingFilter} onValueChange={(v) => { if (v) setWeddingFilter(v); }}>
                <SelectTrigger className="h-9 rounded-xl text-xs">
                  <SelectValue>
                    {weddingFilter === "all"
                      ? "All weddings"
                      : (view.weddings.find((w) => w.slug === weddingFilter)?.name ?? "All weddings")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All weddings</SelectItem>
                  {view.weddings.map((w) => (
                    <SelectItem key={w.slug} value={w.slug}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={() => setTaskDialogOpen(true)}
              disabled={!createForWedding}
            >
              + New task
            </Button>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <TaskKpiCards
        total={summary.total}
        completed={summary.completed}
        overdue={summary.overdue}
        dueThisWeek={summary.dueThisWeek}
        allWeddings={weddingFilter === "all"}
      />

      {/* Filter bar */}
      <section className="-mx-4 overflow-x-auto px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex shrink-0 items-center gap-2">
            {[
              { id: "all", label: `All (${summary.total})` },
              { id: "my", label: `My tasks (${summary.myTasks})` },
              { id: "overdue", label: `Overdue (${summary.overdue})` },
              { id: "unassigned", label: `Unassigned (${tasks.filter((t) => t.assigneeIds.length === 0).length})` },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id as TopFilter)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeFilter === filter.id
                    ? "border-transparent bg-foreground text-background"
                    : "border-border/70 bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[260px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Select value={assigneeFilter} onValueChange={(v) => { if (!v) return; setAssigneeFilter(v); }}>
              <SelectTrigger className="h-8 w-[140px] rounded-xl text-xs">
                <SelectValue>
                  {assigneeFilter === "all"
                    ? "All assignees"
                    : assigneeFilter === "unassigned"
                    ? "Unassigned"
                    : (view.allMembers.find((m) => m.id === assigneeFilter)?.label ?? assigneeFilter)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {view.allMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.isCurrentUser ? `${member.label} (you)` : member.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { if (!v) return; setPriorityFilter(v); }}>
              <SelectTrigger className="h-8 w-[110px] rounded-xl text-xs">
                <SelectValue>
                  {{ all: "All priority", high: "High", medium: "Medium", low: "Low" }[priorityFilter] ?? "All priority"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={displayMode === "kanban" ? "secondary" : "ghost"}
                size="icon-sm"
                className="rounded-md"
                onClick={() => setDisplayMode("kanban")}
                aria-label="Kanban view"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                variant={displayMode === "list" ? "secondary" : "ghost"}
                size="icon-sm"
                className="rounded-md"
                onClick={() => setDisplayMode("list")}
                aria-label="List view"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Member stats */}
      {!view.scopedToEmployeeTasks && view.memberSummaries.length > 0 && (
        <div className="py-4">
          <TaskMemberStatsCards members={view.memberSummaries} currentUserId={view.currentUserId} />
        </div>
      )}

      {displayMode === "list" ? (
        <div className="mt-4">
          <TaskListView tasks={filteredTasks} onTaskClick={setSelectedTaskId} showWeddingBadge />
        </div>
      ) : (
        <section className="mt-4 flex divide-x divide-dashed divide-border/50 overflow-x-auto">
          <TaskKanbanColumn
            laneId="todo"
            title="To do"
            count={columns.todo.length}
            toneClassName="border border-rose-500/40 bg-rose-500/10 text-rose-300"
            tasks={columns.todo}
            busyTaskId={busyTaskId}
            draggingTaskId={draggingTaskId}
            dragOverLaneId={dragOverLaneId}
            onDragStartTask={setDraggingTaskId}
            onDragEndTask={() => { setDraggingTaskId(null); setDragOverLaneId(null); }}
            onDropTaskToLane={(lane) => {
              if (!draggingTaskId) return;
              void moveTaskToLane(draggingTaskId, lane);
              setDraggingTaskId(null);
              setDragOverLaneId(null);
            }}
            onDragEnterLane={setDragOverLaneId}
            onDragLeaveLane={(lane) => setDragOverLaneId((c) => (c === lane ? null : c))}
            onTaskClick={setSelectedTaskId}
            showWeddingBadge
          />
          <TaskKanbanColumn
            laneId="in_progress"
            title="In progress"
            count={columns.inProgress.length}
            toneClassName="border border-sky-500/40 bg-sky-500/10 text-sky-300"
            tasks={columns.inProgress}
            busyTaskId={busyTaskId}
            draggingTaskId={draggingTaskId}
            dragOverLaneId={dragOverLaneId}
            onDragStartTask={setDraggingTaskId}
            onDragEndTask={() => { setDraggingTaskId(null); setDragOverLaneId(null); }}
            onDropTaskToLane={(lane) => {
              if (!draggingTaskId) return;
              void moveTaskToLane(draggingTaskId, lane);
              setDraggingTaskId(null);
              setDragOverLaneId(null);
            }}
            onDragEnterLane={setDragOverLaneId}
            onDragLeaveLane={(lane) => setDragOverLaneId((c) => (c === lane ? null : c))}
            onTaskClick={setSelectedTaskId}
            showWeddingBadge
          />
          <TaskKanbanColumn
            laneId="needs_review"
            title="Needs review"
            count={columns.needsReview.length}
            toneClassName="border border-violet-500/40 bg-violet-500/10 text-violet-300"
            tasks={columns.needsReview}
            busyTaskId={busyTaskId}
            draggingTaskId={draggingTaskId}
            dragOverLaneId={dragOverLaneId}
            onDragStartTask={setDraggingTaskId}
            onDragEndTask={() => { setDraggingTaskId(null); setDragOverLaneId(null); }}
            onDropTaskToLane={(lane) => {
              if (!draggingTaskId) return;
              void moveTaskToLane(draggingTaskId, lane);
              setDraggingTaskId(null);
              setDragOverLaneId(null);
            }}
            onDragEnterLane={setDragOverLaneId}
            onDragLeaveLane={(lane) => setDragOverLaneId((c) => (c === lane ? null : c))}
            onTaskClick={setSelectedTaskId}
            showWeddingBadge
          />
          <TaskKanbanColumn
            laneId="done"
            title="Done"
            count={columns.done.length}
            toneClassName="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            tasks={columns.done}
            busyTaskId={busyTaskId}
            draggingTaskId={draggingTaskId}
            dragOverLaneId={dragOverLaneId}
            onDragStartTask={setDraggingTaskId}
            onDragEndTask={() => { setDraggingTaskId(null); setDragOverLaneId(null); }}
            onDropTaskToLane={(lane) => {
              if (!draggingTaskId) return;
              void moveTaskToLane(draggingTaskId, lane);
              setDraggingTaskId(null);
              setDragOverLaneId(null);
            }}
            onDragEnterLane={setDragOverLaneId}
            onDragLeaveLane={(lane) => setDragOverLaneId((c) => (c === lane ? null : c))}
            onTaskClick={setSelectedTaskId}
            showWeddingBadge
          />
        </section>
      )}

      {createForWedding && (
        <NewTaskDialog
          weddingSlug={createForWedding.slug}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          currentUserLabel={view.currentUserLabel}
          members={createForWedding.members}
          events={createForWedding.events}
          onTaskCreated={() => { void invalidateTasks(); }}
        />
      )}
    </div>
  );
}
