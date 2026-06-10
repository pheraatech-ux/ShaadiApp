"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TasksAssigneeFilterDropdown } from "@/components/app-dashboard/tasks/tasks-assignee-filter-dropdown";
import { TasksPriorityFilterDropdown } from "@/components/app-dashboard/tasks/tasks-priority-filter-dropdown";
import {
  TasksShowFilterDropdown,
  type TasksTopFilter,
} from "@/components/app-dashboard/tasks/tasks-show-filter-dropdown";
import { TasksWeddingFilterDropdown } from "@/components/app-dashboard/tasks/tasks-wedding-filter-dropdown";
import { cn } from "@/lib/utils";

export type { TasksTopFilter };

type TasksFilterMenuProps = {
  activeFilter: TasksTopFilter;
  onFilterChange: (filter: TasksTopFilter) => void;
  counts: {
    total: number;
    myTasks: number;
    overdue: number;
    unassigned: number;
  };
  weddingFilters: Set<string>;
  onWeddingFiltersChange: (filters: Set<string>) => void;
  weddings: { slug: string; name: string }[];
  assigneeFilters: Set<string>;
  onAssigneeFiltersChange: (filters: Set<string>) => void;
  assignees: { id: string; label: string; isCurrentUser?: boolean }[];
  priorityFilters: Set<string>;
  onPriorityFiltersChange: (filters: Set<string>) => void;
  className?: string;
};

const SHOW_LABELS: Record<TasksTopFilter, string> = {
  all: "All",
  my: "My tasks",
  overdue: "Overdue",
  unassigned: "Unassigned",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

type FilterSectionId = "show" | "wedding" | "assignee" | "priority";

export function TasksFilterMenu({
  activeFilter,
  onFilterChange,
  counts,
  weddingFilters,
  onWeddingFiltersChange,
  weddings,
  assigneeFilters,
  onAssigneeFiltersChange,
  assignees,
  priorityFilters,
  onPriorityFiltersChange,
  className,
}: TasksFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<FilterSectionId | null>(null);

  function handlePopoverOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setOpenSection(null);
  }

  function handleSectionExpandedChange(section: FilterSectionId, expanded: boolean) {
    setOpenSection(expanded ? section : null);
  }

  const activeGroups = useMemo(() => {
    const groups: string[] = [];

    if (activeFilter !== "all") {
      groups.push(SHOW_LABELS[activeFilter] ?? "Show");
    }

    if (weddingFilters.size > 0) {
      if (weddingFilters.size === 1) {
        const slug = [...weddingFilters][0];
        groups.push(weddings.find((w) => w.slug === slug)?.name ?? "Wedding");
      } else {
        groups.push(`${weddingFilters.size} weddings`);
      }
    }

    if (assigneeFilters.size > 0) {
      if (assigneeFilters.size === 1) {
        const id = [...assigneeFilters][0];
        if (id === "unassigned") {
          groups.push("Unassigned");
        } else {
          const member = assignees.find((m) => m.id === id);
          groups.push(member?.isCurrentUser ? "Assigned to me" : (member?.label ?? "Assignee"));
        }
      } else {
        groups.push(`${assigneeFilters.size} assignees`);
      }
    }

    if (priorityFilters.size > 0) {
      if (priorityFilters.size === 1) {
        const value = [...priorityFilters][0];
        groups.push(PRIORITY_LABELS[value] ?? "Priority");
      } else {
        groups.push(`${priorityFilters.size} priorities`);
      }
    }

    return groups;
  }, [activeFilter, weddingFilters, assigneeFilters, priorityFilters, weddings, assignees]);

  const triggerLabel =
    activeGroups.length === 0
      ? "Filters"
      : activeGroups.length === 1
        ? activeGroups[0]
        : `${activeGroups.length} filters`;

  function clearFilters() {
    onFilterChange("all");
    onWeddingFiltersChange(new Set());
    onAssigneeFiltersChange(new Set());
    onPriorityFiltersChange(new Set());
  }

  return (
    <Popover open={open} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger
        className={cn(
          "flex h-9 shrink-0 items-center justify-between gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/50 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          activeGroups.length > 0 && "border-foreground/20",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <ListFilter className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="max-w-[140px] truncate">{triggerLabel}</span>
          {activeGroups.length > 1 ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
              {activeGroups.length}
            </span>
          ) : null}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-72 gap-0 p-0">
        <div className="space-y-2.5 p-3">
          <TasksShowFilterDropdown
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            counts={counts}
            expanded={openSection === "show"}
            onExpandedChange={(expanded) => handleSectionExpandedChange("show", expanded)}
          />

          {weddings.length >= 1 ? (
            <TasksWeddingFilterDropdown
              weddings={weddings}
              selected={weddingFilters}
              onChange={onWeddingFiltersChange}
              expanded={openSection === "wedding"}
              onExpandedChange={(expanded) => handleSectionExpandedChange("wedding", expanded)}
            />
          ) : null}

          <TasksAssigneeFilterDropdown
            assignees={assignees}
            selected={assigneeFilters}
            onChange={onAssigneeFiltersChange}
            expanded={openSection === "assignee"}
            onExpandedChange={(expanded) => handleSectionExpandedChange("assignee", expanded)}
          />

          <TasksPriorityFilterDropdown
            selected={priorityFilters}
            onChange={onPriorityFiltersChange}
            expanded={openSection === "priority"}
            onExpandedChange={(expanded) => handleSectionExpandedChange("priority", expanded)}
          />
        </div>

        {activeGroups.length > 0 ? (
          <div className="border-t border-border/60 p-2">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="h-9 w-full text-sm"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
