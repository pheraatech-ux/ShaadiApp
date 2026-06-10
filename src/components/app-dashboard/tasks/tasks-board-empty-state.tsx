"use client";

import { ListTodo, Plus } from "lucide-react";

import type { TasksTopFilter } from "@/components/app-dashboard/tasks/tasks-filter-menu";
import { Button } from "@/components/ui/button";

export type TasksBoardEmptyStateConfig = {
  title: string;
  description: string;
  ctaLabel: string | null;
};

type TasksBoardEmptyStateProps = TasksBoardEmptyStateConfig & {
  onCtaClick?: () => void;
};

const SHOW_LABELS: Record<TasksTopFilter, string> = {
  all: "all",
  my: "my",
  overdue: "overdue",
  unassigned: "unassigned",
};

export function getAllTasksEmptyState({
  totalTasks,
  activeFilter,
  search,
  weddingFilters,
  assigneeFilters,
  priorityFilters,
  canCreateTask,
  scope = "all",
}: {
  totalTasks: number;
  activeFilter: TasksTopFilter;
  search: string;
  weddingFilters: Set<string>;
  assigneeFilters: Set<string>;
  priorityFilters: Set<string>;
  canCreateTask: boolean;
  scope?: "all" | "wedding";
}): TasksBoardEmptyStateConfig {
  const hasNoTasks = totalTasks === 0;
  const hasActiveSearch = search.trim().length > 0;
  const hasExtraFilters =
    weddingFilters.size > 0 || assigneeFilters.size > 0 || priorityFilters.size > 0;

  if (hasNoTasks) {
    return {
      title: "No tasks yet",
      description:
        scope === "wedding"
          ? "Create your first task to start planning this wedding."
          : "Create your first task to start tracking work across weddings.",
      ctaLabel: canCreateTask ? "New task" : null,
    };
  }

  if (hasActiveSearch) {
    return {
      title: "No tasks found",
      description:
        activeFilter !== "all" || hasExtraFilters
          ? "Nothing matched your search with the current filters. Try clearing the search or adjusting filters."
          : "Nothing matched your search. Try different keywords.",
      ctaLabel: null,
    };
  }

  if (activeFilter !== "all") {
    return {
      title: `No ${SHOW_LABELS[activeFilter]} tasks`,
      description: "Switch to All or adjust filters to see more tasks.",
      ctaLabel: canCreateTask ? "New task" : null,
    };
  }

  if (hasExtraFilters) {
    return {
      title: "No tasks match these filters",
      description: "Clear filters to see more tasks.",
      ctaLabel: null,
    };
  }

  return {
    title: "No tasks found",
    description: "Try adjusting your filters.",
    ctaLabel: null,
  };
}

export function TasksBoardEmptyState({
  title,
  description,
  ctaLabel,
  onCtaClick,
}: TasksBoardEmptyStateProps) {
  return (
    <section className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card px-6 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-amber-400/40 bg-amber-500/10">
        <ListTodo className="size-4 text-amber-500" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {ctaLabel && onCtaClick ? (
        <Button size="sm" className="mt-1 rounded-xl text-xs" onClick={onCtaClick}>
          <Plus className="size-4" />
          {ctaLabel}
        </Button>
      ) : null}
    </section>
  );
}
