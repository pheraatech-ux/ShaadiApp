"use client";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { TasksToolbar, type TasksTopFilter } from "@/components/app-dashboard/tasks/tasks-toolbar";
import { useAllTasksQuery, useInvalidateAllTasks } from "@/components/app-dashboard/tasks/use-all-tasks-query";
import { useToolbarScrollExpand } from "@/components/app-dashboard/use-toolbar-scroll-expand";
import { NewTaskDialog } from "@/components/wedding-workspace/tasks/new-task-dialog";
import { TaskDetailPanel } from "@/components/wedding-workspace/tasks/task-detail-panel";
import { TaskKanbanColumn, type TaskLaneId } from "@/components/wedding-workspace/tasks/task-kanban-column";
import { TaskKpiCards } from "@/components/wedding-workspace/tasks/task-kpi-cards";
import { TaskListView } from "@/components/wedding-workspace/tasks/task-list-view";
import { TaskMemberStatsCards } from "@/components/wedding-workspace/tasks/task-member-stats-cards";
import type { AllTasksBoardViewModel, WeddingTasksBoardStatus } from "@/components/wedding-workspace/tasks/types";

type AllTasksWorkspaceProps = {
  view: AllTasksBoardViewModel;
};

export function AllTasksWorkspace({ view }: AllTasksWorkspaceProps) {
  const { data: tasks } = useAllTasksQuery(view.tasks);
  const invalidateTasks = useInvalidateAllTasks();
  const { shellRef, barRef, progress, layout, barHeight, isFloating, floatStyle } =
    useToolbarScrollExpand();

  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, WeddingTasksBoardStatus>>({});
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverLaneId, setDragOverLaneId] = useState<TaskLaneId | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TasksTopFilter>("all");
  const [weddingFilters, setWeddingFilters] = useState<Set<string>>(() => new Set());
  const [assigneeFilters, setAssigneeFilters] = useState<Set<string>>(() => new Set());
  const [priorityFilters, setPriorityFilters] = useState<Set<string>>(() => new Set());
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

    if (weddingFilters.size > 0) {
      current = current.filter((t) => weddingFilters.has(t.weddingSlug));
    }

    if (assigneeFilters.size > 0) {
      current = current.filter((t) => {
        if (assigneeFilters.has("unassigned") && t.assigneeIds.length === 0) return true;
        return t.assigneeIds.some((id) => assigneeFilters.has(id));
      });
    }

    if (priorityFilters.size > 0) {
      current = current.filter((t) => priorityFilters.has(t.priority.toLowerCase()));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      current = current.filter((t) => t.title.toLowerCase().includes(q));
    }

    return current;
  }, [activeFilter, weddingFilters, assigneeFilters, priorityFilters, search, tasksWithOptimistic, view.currentUserId]);

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
  const unassignedCount = tasks.filter((t) => t.assigneeIds.length === 0).length;

  return (
    <div className="space-y-5 pb-[100vh]">
      <TaskKpiCards
        total={summary.total}
        completed={summary.completed}
        overdue={summary.overdue}
        dueThisWeek={summary.dueThisWeek}
        allWeddings={weddingFilters.size === 0}
      />

      <div ref={shellRef}>
        {isFloating && barHeight > 0 ? (
          <div aria-hidden className="pointer-events-none" style={{ height: barHeight }} />
        ) : null}
        <div
          ref={barRef}
          className={isFloating ? undefined : "sticky top-0 z-30"}
          style={floatStyle}
        >
          <TasksToolbar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={{
              total: summary.total,
              myTasks: summary.myTasks,
              overdue: summary.overdue,
              unassigned: unassignedCount,
            }}
            search={search}
            onSearchChange={setSearch}
            weddingFilters={weddingFilters}
            onWeddingFiltersChange={setWeddingFilters}
            weddings={view.weddings.map((w) => ({ slug: w.slug, name: w.name }))}
            assigneeFilters={assigneeFilters}
            onAssigneeFiltersChange={setAssigneeFilters}
            assignees={view.allMembers}
            priorityFilters={priorityFilters}
            onPriorityFiltersChange={setPriorityFilters}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            onCreateTask={() => setTaskDialogOpen(true)}
            canCreateTask={Boolean(createForWedding)}
            expandProgress={progress}
            contentPaddingX={layout.paddingX}
          />
        </div>
      </div>

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
