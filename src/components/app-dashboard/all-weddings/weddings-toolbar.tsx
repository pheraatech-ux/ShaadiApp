"use client";

import type { ReactNode } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";

import type {
  AllWeddingsCounts,
  AllWeddingsFilter,
  AllWeddingsSort,
  AllWeddingsViewMode,
} from "@/components/app-dashboard/all-weddings/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FILTER_TABS: { label: string; value: AllWeddingsFilter; key: keyof AllWeddingsCounts }[] = [
  { label: "All", value: "all", key: "all" },
  { label: "Active", value: "active", key: "active" },
  { label: "Planning", value: "planning", key: "planning" },
  { label: "Completed", value: "completed", key: "completed" },
];

function SegmentButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-muted text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

type WeddingsToolbarProps = {
  filter: AllWeddingsFilter;
  onFilterChange: (filter: AllWeddingsFilter) => void;
  counts: AllWeddingsCounts;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: AllWeddingsSort;
  onSortChange: (sort: AllWeddingsSort) => void;
  viewMode: AllWeddingsViewMode;
  onViewModeChange: (mode: AllWeddingsViewMode) => void;
  canCreateWedding?: boolean;
  onCreateWedding?: () => void;
  expandProgress?: number;
  contentPaddingX?: number;
};

export function WeddingsToolbar({
  filter,
  onFilterChange,
  counts,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  canCreateWedding = true,
  onCreateWedding,
  expandProgress = 0,
  contentPaddingX = 16,
}: WeddingsToolbarProps) {
  const radius = 12 * (1 - expandProgress);
  const padX = 8 + expandProgress * (contentPaddingX - 8);
  const padY = 8 + expandProgress * 4;

  return (
    <div
      className={cn(
        "border border-border/70 bg-gradient-to-b from-card to-card/80 shadow-sm",
        expandProgress > 0.4 && "border-x-transparent bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85",
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
      <div className="flex min-h-10 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-h-10 min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-xl border-border/70 bg-muted/30 pl-9"
              placeholder="Search couple, city, culture..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as AllWeddingsSort)}>
            <SelectTrigger className="h-9 w-full rounded-xl sm:w-[180px]">
              <SelectValue>
                {sortBy === "date-latest"
                  ? "Date (latest first)"
                  : sortBy === "date-earliest"
                    ? "Date (earliest first)"
                    : "Name (A–Z)"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-latest">Date (latest first)</SelectItem>
              <SelectItem value="date-earliest">Date (earliest first)</SelectItem>
              <SelectItem value="name-a-z">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-1">
            {FILTER_TABS.map((tab) => (
              <SegmentButton
                key={tab.value}
                active={filter === tab.value}
                onClick={() => onFilterChange(tab.value)}
              >
                {tab.label}
                <span className="ml-1.5 tabular-nums text-xs opacity-60">{counts[tab.key]}</span>
              </SegmentButton>
            ))}
          </div>

          <div className="hidden h-10 w-px bg-border/70 sm:block" />

          <div className="flex items-center gap-2">
            {canCreateWedding && onCreateWedding ? (
              <Button size="default" className="h-10 shrink-0 gap-1.5 px-4 shadow-sm" onClick={onCreateWedding}>
                <Plus className="size-4" />
                New wedding
              </Button>
            ) : null}
            <div className="flex items-center gap-1 rounded-lg border border-border/70 p-1">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon-sm"
                className="rounded-md"
                onClick={() => onViewModeChange("cards")}
                aria-label="Cards view"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon-sm"
                className="rounded-md"
                onClick={() => onViewModeChange("list")}
                aria-label="List view"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
