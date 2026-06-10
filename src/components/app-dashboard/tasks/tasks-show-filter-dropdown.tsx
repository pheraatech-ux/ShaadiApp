"use client";

import { useMemo } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@/lib/utils";

const VISIBLE_OPTION_COUNT = 3;
const OPTION_ROW_HEIGHT_CLASS = "min-h-12";

export type TasksTopFilter = "all" | "my" | "overdue" | "unassigned";

const SHOW_OPTIONS: { id: TasksTopFilter; label: string; key: "total" | "myTasks" | "overdue" | "unassigned" }[] = [
  { id: "all", label: "All", key: "total" },
  { id: "my", label: "My tasks", key: "myTasks" },
  { id: "overdue", label: "Overdue", key: "overdue" },
  { id: "unassigned", label: "Unassigned", key: "unassigned" },
];

type TasksShowFilterDropdownProps = {
  activeFilter: TasksTopFilter;
  onFilterChange: (filter: TasksTopFilter) => void;
  counts: Record<"total" | "myTasks" | "overdue" | "unassigned", number>;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

function SelectionCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border/70 bg-background",
      )}
    >
      {checked ? <Check className="size-2.5 stroke-[3]" /> : null}
    </span>
  );
}

export function TasksShowFilterDropdown({
  activeFilter,
  onFilterChange,
  counts,
  expanded,
  onExpandedChange,
}: TasksShowFilterDropdownProps) {
  const summary = useMemo(() => {
    const active = SHOW_OPTIONS.find((option) => option.id === activeFilter);
    if (!active || active.id === "all") return "All tasks";
    return `${active.label} (${counts[active.key]})`;
  }, [activeFilter, counts]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Layers className="size-4 shrink-0 text-violet-500" />
        <span className="text-sm font-semibold text-foreground">Show</span>
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{summary}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded ? (
        <div className="border-t border-border/60 p-2">
          <OverlayScrollbarsComponent
            element="div"
            style={{ maxHeight: `calc(${VISIBLE_OPTION_COUNT} * 3rem + ${VISIBLE_OPTION_COUNT - 1} * 0.125rem)` }}
            options={{
              overflow: { x: "hidden", y: "scroll" },
              scrollbars: { theme: "os-theme-dark", autoHide: "never", clickScroll: true },
            }}
            defer
          >
            <div className="space-y-0.5 pr-1">
              {SHOW_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onFilterChange(option.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
                    OPTION_ROW_HEIGHT_CLASS,
                    activeFilter === option.id && "bg-accent/60",
                  )}
                >
                  <SelectionCheckbox checked={activeFilter === option.id} />
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                    <Layers className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{option.label}</span>
                  <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{counts[option.key]}</span>
                </button>
              ))}
            </div>
          </OverlayScrollbarsComponent>
        </div>
      ) : null}
    </div>
  );
}
