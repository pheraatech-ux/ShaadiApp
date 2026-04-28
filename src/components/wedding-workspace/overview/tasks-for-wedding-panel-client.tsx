"use client";

import { useState } from "react";

import { TaskDetailPanel } from "@/components/wedding-workspace/tasks/task-detail-panel";
import type { WeddingTasksBoardMemberOption, WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";
import { TasksForWeddingPanel } from "@/components/wedding-workspace/overview/tasks-for-wedding-panel";

type TasksForWeddingPanelClientProps = {
  tasks: WeddingTasksBoardTask[];
  weddingSlug: string;
  members: WeddingTasksBoardMemberOption[];
  tasksHref: string;
};

function sortByImportance(tasks: WeddingTasksBoardTask[]): WeddingTasksBoardTask[] {
  return [...tasks].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return 0;
  });
}

export function TasksForWeddingPanelClient({ tasks, weddingSlug, members, tasksHref }: TasksForWeddingPanelClientProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [selectedTask, setSelectedTask] = useState<WeddingTasksBoardTask | null>(null);

  function handleTaskUpdated(taskId: string, updates: Partial<WeddingTasksBoardTask>) {
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : prev));
    }
  }

  function handleTaskDeleted(taskId: string) {
    setLocalTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  }

  const top3 = sortByImportance(localTasks).slice(0, 3);

  return (
    <>
      <TasksForWeddingPanel
        tasks={top3}
        onTaskClick={setSelectedTask}
        tasksHref={tasksHref}
        totalCount={localTasks.length}
      />

      {selectedTask && (
        <>
          {/* Backdrop — full screen blur */}
          <div
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={() => setSelectedTask(null)}
            aria-hidden="true"
          />

          {/* Slide-in panel */}
          <div className="fixed top-0 right-0 z-50 flex h-dvh w-[min(92vw,880px)] flex-col overflow-hidden border-l border-border/60 bg-background shadow-2xl">
            <TaskDetailPanel
              weddingSlug={weddingSlug}
              task={selectedTask}
              members={members}
              onBack={() => setSelectedTask(null)}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          </div>
        </>
      )}
    </>
  );
}
