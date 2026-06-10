"use client";

import { LayoutGrid, List, Plus, Search } from "lucide-react";

import { TasksFilterMenu } from "@/components/app-dashboard/tasks/tasks-filter-menu";
import type { TasksTopFilter } from "@/components/app-dashboard/tasks/tasks-filter-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type { TasksTopFilter };

type TasksToolbarProps = {
  activeFilter: TasksTopFilter;
  onFilterChange: (filter: TasksTopFilter) => void;
  counts: {
    total: number;
    myTasks: number;
    overdue: number;
    unassigned: number;
  };
  search: string;
  onSearchChange: (query: string) => void;
  weddingFilters: Set<string>;
  onWeddingFiltersChange: (filters: Set<string>) => void;
  weddings: { slug: string; name: string }[];
  assigneeFilters: Set<string>;
  onAssigneeFiltersChange: (filters: Set<string>) => void;
  assignees: { id: string; label: string; isCurrentUser?: boolean }[];
  priorityFilters: Set<string>;
  onPriorityFiltersChange: (filters: Set<string>) => void;
  displayMode: "kanban" | "list";
  onDisplayModeChange: (mode: "kanban" | "list") => void;
  onCreateTask: () => void;
  canCreateTask?: boolean;
  expandProgress?: number;
  contentPaddingX?: number;
};

export function TasksToolbar({
  activeFilter,
  onFilterChange,
  counts,
  search,
  onSearchChange,
  weddingFilters,
  onWeddingFiltersChange,
  weddings,
  assigneeFilters,
  onAssigneeFiltersChange,
  assignees,
  priorityFilters,
  onPriorityFiltersChange,
  displayMode,
  onDisplayModeChange,
  onCreateTask,
  canCreateTask = true,
  expandProgress = 0,
  contentPaddingX = 16,
}: TasksToolbarProps) {
  const radius = 12 * (1 - expandProgress);
  const padX = 8 + expandProgress * (contentPaddingX - 8);
  const padY = 8 + expandProgress * 4;

  return (
    <div
      className={cn(
        "border border-border/70 bg-gradient-to-b from-card to-card/80 shadow-sm",
        expandProgress > 0.4 &&
          "border-x-transparent bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85",
        expandProgress > 0.85 && "rounded-none border-t-0 border-b-border/70",
      )}
      style={{
        borderRadius: expandProgress > 0.85 ? 0 : radius,
        paddingLeft: padX,
        paddingRight: padX,
        paddingTop: padY,
        paddingBottom: padY,
      }}
    >
      <div className="flex min-h-10 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-xl border-border/70 bg-muted/30 pl-9"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <TasksFilterMenu
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            counts={counts}
            weddingFilters={weddingFilters}
            onWeddingFiltersChange={onWeddingFiltersChange}
            weddings={weddings}
            assigneeFilters={assigneeFilters}
            onAssigneeFiltersChange={onAssigneeFiltersChange}
            assignees={assignees}
            priorityFilters={priorityFilters}
            onPriorityFiltersChange={onPriorityFiltersChange}
          />
        </div>

        <div className="flex min-h-10 shrink-0 items-center gap-2">
          {canCreateTask ? (
            <Button
              size="default"
              className="h-10 shrink-0 gap-1.5 px-4 shadow-sm"
              onClick={onCreateTask}
            >
              <Plus className="size-4" />
              New task
            </Button>
          ) : null}
          <div className="flex items-center gap-1 rounded-lg border border-border/70 p-1">
            <Button
              variant={displayMode === "kanban" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => onDisplayModeChange("kanban")}
              aria-label="Kanban view"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={displayMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-md"
              onClick={() => onDisplayModeChange("list")}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
