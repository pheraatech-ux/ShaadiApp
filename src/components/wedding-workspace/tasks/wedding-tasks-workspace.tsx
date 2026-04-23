"use client";

import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useInvalidateTasks, useTasksQuery } from "@/components/wedding-workspace/tasks/use-tasks-query";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { NewTaskDialog } from "@/components/wedding-workspace/tasks/new-task-dialog";
import { TaskDetailPanel } from "@/components/wedding-workspace/tasks/task-detail-panel";
import { TaskKanbanColumn, type TaskLaneId } from "@/components/wedding-workspace/tasks/task-kanban-column";
import { TaskKpiCards } from "@/components/wedding-workspace/tasks/task-kpi-cards";
import { TaskMemberStatsCards } from "@/components/wedding-workspace/tasks/task-member-stats-cards";
import type { WeddingTasksBoardStatus, WeddingTasksBoardViewModel } from "@/components/wedding-workspace/tasks/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WeddingTasksWorkspaceProps = {
  view: WeddingTasksBoardViewModel;
};

type TopFilter = "all" | "my" | "overdue" | "unassigned" | "flagged";
type StatusFilter = "all" | WeddingTasksBoardStatus;


export function WeddingTasksWorkspace({ view }: WeddingTasksWorkspaceProps) {
  const { data: tasks } = useTasksQuery(view.weddingSlug, view.tasks);
  const invalidateTasks = useInvalidateTasks(view.weddingSlug);

  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, WeddingTasksBoardStatus>>({});
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverLaneId, setDragOverLaneId] = useState<TaskLaneId | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TopFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"super-admin" | "team-member">("super-admin");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`tasks:${view.weddingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `wedding_id=eq.${view.weddingId}` },
        () => { void invalidateTasks(); },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [view.weddingId, invalidateTasks]);

  const tasksWithOptimistic = useMemo(() => {
    if (Object.keys(optimisticStatus).length === 0) return tasks;
    return tasks.map((task) =>
      optimisticStatus[task.id] ? { ...task, status: optimisticStatus[task.id] } : task,
    );
  }, [tasks, optimisticStatus]);

  const summary = useMemo(() => {
    const total = tasksWithOptimistic.length;
    const completed = tasksWithOptimistic.filter((task) => task.status === "done").length;
    const overdue = tasksWithOptimistic.filter((task) => task.isOverdue).length;
    const dueThisWeek = tasksWithOptimistic.filter((task) => task.isDueThisWeek).length;
    const flagged = tasksWithOptimistic.filter((task) => task.isOverdue || task.assigneeIds.length === 0).length;
    const myTasks = tasksWithOptimistic.filter((task) => task.assigneeIds.includes(view.currentUserId)).length;
    return { total, completed, overdue, dueThisWeek, flagged, myTasks };
  }, [tasksWithOptimistic, view.currentUserId]);

  const scopedBoard = Boolean(view.scopedToEmployeeTasks);

  const filteredTasks = useMemo(() => {
    let current = tasksWithOptimistic;

    if (!scopedBoard && viewMode === "team-member") {
      current = current.filter((task) => task.assigneeIds.includes(view.currentUserId));
    }

    if (activeFilter === "my") current = current.filter((task) => task.assigneeIds.includes(view.currentUserId));
    if (activeFilter === "overdue") current = current.filter((task) => task.isOverdue);
    if (activeFilter === "unassigned") current = current.filter((task) => task.assigneeIds.length === 0);
    if (activeFilter === "flagged") current = current.filter((task) => task.isOverdue || task.assigneeIds.length === 0);

    if (assigneeFilter !== "all") {
      current = current.filter((task) =>
        assigneeFilter === "unassigned"
          ? task.assigneeIds.length === 0
          : task.assigneeIds.includes(assigneeFilter),
      );
    }

    if (
      statusFilter === "todo" ||
      statusFilter === "in_progress" ||
      statusFilter === "needs_review" ||
      statusFilter === "done"
    ) {
      current = current.filter((task) => task.status === statusFilter);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      current = current.filter((task) => task.title.toLowerCase().includes(query));
    }

    return current;
  }, [activeFilter, assigneeFilter, scopedBoard, search, statusFilter, tasksWithOptimistic, view.currentUserId, viewMode]);

  const columns = useMemo(() => {
    return {
      todo: filteredTasks.filter((task) => task.status === "todo"),
      inProgress: filteredTasks.filter((task) => task.status === "in_progress"),
      needsReview: filteredTasks.filter((task) => task.status === "needs_review"),
      done: filteredTasks.filter((task) => task.status === "done"),
    };
  }, [filteredTasks]);

  async function patchTask(taskId: string, updates: { status?: WeddingTasksBoardStatus }) {
    setBusyTaskId(taskId);
    try {
      const response = await fetch(`/api/weddings/${view.weddingSlug}/tasks`, {
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

  async function moveTaskToLane(taskId: string, laneId: TaskLaneId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const newStatus = laneToStatus[laneId];
    setOptimisticStatus((prev) => ({ ...prev, [taskId]: newStatus }));
    toast.success(`"${task.title}" moved to ${laneLabel[laneId]}`);
    try {
      await patchTask(taskId, { status: newStatus });
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

  const selectedTask = selectedTaskId ? tasksWithOptimistic.find((item) => item.id === selectedTaskId) ?? null : null;

  if (selectedTask) {
    return (
      <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-6">
        <TaskDetailPanel
          weddingSlug={view.weddingSlug}
          task={selectedTask}
          members={view.members}
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

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border/70 bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Viewing</span>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-foreground">
                {viewMode === "super-admin" ? "Super admin — all tasks" : "Team member — my tasks"}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks — {view.coupleName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {view.cultureTags.slice(0, 2).map((culture) => (
                <span key={culture} className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                  {culture}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scopedBoard ? null : (
              <Button
                variant="outline"
                className="h-9 rounded-xl"
                onClick={() => setViewMode((current) => (current === "super-admin" ? "team-member" : "super-admin"))}
              >
                {viewMode === "super-admin" ? "Team member view" : "Super admin view"}
              </Button>
            )}
            <Button variant="outline" className="h-9 rounded-xl">
              <Sparkles className="size-4" />
              AI task suggestions
            </Button>
            <Button className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90" onClick={() => setTaskDialogOpen(true)}>
              + New task
            </Button>
          </div>
        </div>
      </section>

      <TaskKpiCards
        total={summary.total}
        completed={summary.completed}
        overdue={summary.overdue}
        dueThisWeek={summary.dueThisWeek}
        flagged={summary.flagged}
      />

      {!scopedBoard && viewMode === "super-admin" && view.memberSummaries.length > 0 && (
        <TaskMemberStatsCards
          members={view.memberSummaries}
          currentUserId={view.currentUserId}
        />
      )}

      <section className="space-y-3 rounded-xl border border-border/70 bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All (${summary.total})` },
            { id: "my", label: `My tasks (${summary.myTasks})` },
            { id: "overdue", label: `Overdue (${summary.overdue})` },
            { id: "unassigned", label: `Unassigned (${tasks.filter((task) => task.assigneeIds.length === 0).length})` },
            { id: "flagged", label: `Flagged (${summary.flagged})` },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id as TopFilter)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-foreground text-background"
                  : "border border-border/70 bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." className="h-9 pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={assigneeFilter}
              onValueChange={(value) => {
                if (!value) return;
                setAssigneeFilter(value);
              }}
            >
              <SelectTrigger className="h-9 w-[170px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {view.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.isCurrentUser ? `${member.label} (you)` : member.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (!value) return;
                setStatusFilter(value as StatusFilter);
              }}
            >
              <SelectTrigger className="h-9 w-[170px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Group: status</SelectItem>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="needs_review">Needs review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="flex divide-x divide-dashed divide-border/50 overflow-x-auto">
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
          onDragEndTask={() => {
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDropTaskToLane={(lane) => {
            if (!draggingTaskId) return;
            void moveTaskToLane(draggingTaskId, lane);
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDragEnterLane={setDragOverLaneId}
          onDragLeaveLane={(lane) => {
            setDragOverLaneId((current) => (current === lane ? null : current));
          }}
          onTaskClick={setSelectedTaskId}
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
          onDragEndTask={() => {
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDropTaskToLane={(lane) => {
            if (!draggingTaskId) return;
            void moveTaskToLane(draggingTaskId, lane);
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDragEnterLane={setDragOverLaneId}
          onDragLeaveLane={(lane) => {
            setDragOverLaneId((current) => (current === lane ? null : current));
          }}
          onTaskClick={setSelectedTaskId}
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
          onDragEndTask={() => {
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDropTaskToLane={(lane) => {
            if (!draggingTaskId) return;
            void moveTaskToLane(draggingTaskId, lane);
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDragEnterLane={setDragOverLaneId}
          onDragLeaveLane={(lane) => {
            setDragOverLaneId((current) => (current === lane ? null : current));
          }}
          onTaskClick={setSelectedTaskId}
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
          onDragEndTask={() => {
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDropTaskToLane={(lane) => {
            if (!draggingTaskId) return;
            void moveTaskToLane(draggingTaskId, lane);
            setDraggingTaskId(null);
            setDragOverLaneId(null);
          }}
          onDragEnterLane={setDragOverLaneId}
          onDragLeaveLane={(lane) => {
            setDragOverLaneId((current) => (current === lane ? null : current));
          }}
          onTaskClick={setSelectedTaskId}
        />
      </section>

      <NewTaskDialog
        weddingSlug={view.weddingSlug}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        currentUserLabel={view.currentUserLabel}
        members={view.members}
        events={view.events}
        onTaskCreated={() => { void invalidateTasks(); }}
      />
    </div>
  );
}
