"use client";

import { useMemo, useState } from "react";
import { Heart, Plus } from "lucide-react";

import { AddWeddingFlowDialog } from "@/components/app-dashboard/dashboard/add-wedding-flow-dialog";
import { AllWeddingsCardView } from "@/components/app-dashboard/all-weddings/all-weddings-card-view";
import { AllWeddingsListView } from "@/components/app-dashboard/all-weddings/all-weddings-list-view";
import { WeddingsToolbar } from "@/components/app-dashboard/all-weddings/weddings-toolbar";
import { useToolbarScrollExpand } from "@/components/app-dashboard/use-toolbar-scroll-expand";
import type {
  AllWeddingsFilter,
  AllWeddingsPageView,
  AllWeddingsSort,
  AllWeddingsViewMode,
} from "@/components/app-dashboard/all-weddings/types";
import { Button } from "@/components/ui/button";

type AllWeddingsPageProps = {
  initialData: AllWeddingsPageView;
  basePath?: string;
  canCreateWedding?: boolean;
};

const filterTabs: { label: string; value: AllWeddingsFilter; key: keyof AllWeddingsPageView["counts"] }[] = [
  { label: "All", value: "all", key: "all" },
  { label: "Active", value: "active", key: "active" },
  { label: "Planning", value: "planning", key: "planning" },
  { label: "Completed", value: "completed", key: "completed" },
];

export function AllWeddingsPage({
  initialData,
  basePath = "/app",
  canCreateWedding = true,
}: AllWeddingsPageProps) {
  const [filter, setFilter] = useState<AllWeddingsFilter>("all");
  const [sortBy, setSortBy] = useState<AllWeddingsSort>("date-latest");
  const [viewMode, setViewMode] = useState<AllWeddingsViewMode>("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { shellRef, barRef, progress, layout, barHeight, isFloating, floatStyle } =
    useToolbarScrollExpand();

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let items = initialData.items;

    if (filter !== "all") {
      items = items.filter((item) => item.stage === filter);
    }

    if (normalizedQuery) {
      items = items.filter((item) => {
        const haystack = `${item.coupleName} ${item.city} ${item.venueName} ${item.cultures.join(" ")}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    const sorted = [...items];
    if (sortBy === "name-a-z") {
      sorted.sort((a, b) => a.coupleName.localeCompare(b.coupleName));
      return sorted;
    }

    sorted.sort((a, b) => {
      const aDate = a.weddingDateRaw ? new Date(`${a.weddingDateRaw}T00:00:00`).getTime() : 0;
      const bDate = b.weddingDateRaw ? new Date(`${b.weddingDateRaw}T00:00:00`).getTime() : 0;
      return sortBy === "date-latest" ? bDate - aDate : aDate - bDate;
    });
    return sorted;
  }, [filter, initialData.items, searchQuery, sortBy]);

  const slotsLeft = Math.max(0, initialData.planCap - initialData.usedSlots);
  const hasNoWeddings = initialData.items.length === 0;
  const hasActiveSearch = searchQuery.trim().length > 0;
  const activeFilterLabel = filterTabs.find((tab) => tab.value === filter)?.label ?? "All";

  const emptyState = hasNoWeddings
    ? {
        title: "No weddings yet",
        description:
          "Add your first couple to start planning tasks, budgets, and timelines in one place.",
        ctaLabel: "Add your first wedding",
      }
    : hasActiveSearch
      ? {
          title: "No weddings found",
          description:
            filter !== "all"
              ? "Nothing matched your search in this tab. Try clearing the search or switching tabs."
              : "Nothing matched your search. Try different keywords.",
          ctaLabel: null,
        }
      : {
          title: `No ${activeFilterLabel.toLowerCase()} weddings yet`,
          description: "Switch to All or create a new wedding workspace.",
          ctaLabel: canCreateWedding ? "New wedding" : null,
        };

  return (
    <div className="space-y-5 pb-[100vh]">
      <div ref={shellRef}>
        {isFloating && barHeight > 0 ? (
          <div aria-hidden className="pointer-events-none" style={{ height: barHeight }} />
        ) : null}
        <div
          ref={barRef}
          className={isFloating ? undefined : "sticky top-0 z-30"}
          style={floatStyle}
        >
          <WeddingsToolbar
            filter={filter}
            onFilterChange={setFilter}
            counts={initialData.counts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            canCreateWedding={canCreateWedding}
            onCreateWedding={() => setOpenCreateDialog(true)}
            expandProgress={progress}
            contentPaddingX={layout.paddingX}
          />
        </div>
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        Free plan: <span className="font-medium text-foreground">{initialData.usedSlots}</span> of{" "}
        <span className="font-medium text-foreground">{initialData.planCap}</span> weddings used.
        {slotsLeft > 0 ? ` ${slotsLeft} more slot${slotsLeft > 1 ? "s" : ""} remaining.` : " Upgrade for more slots."}
      </p>

      {visibleItems.length === 0 ? (
        <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card px-6 py-14 text-center">
          <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-rose-400/40 bg-rose-500/10">
            <Heart className="size-4 text-rose-500" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{emptyState.title}</p>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{emptyState.description}</p>
          </div>
          {emptyState.ctaLabel && canCreateWedding ? (
            <Button size="sm" className="mt-1 rounded-xl text-xs" onClick={() => setOpenCreateDialog(true)}>
              <Plus />
              {emptyState.ctaLabel}
            </Button>
          ) : null}
        </section>
      ) : viewMode === "cards" ? (
        <AllWeddingsCardView items={visibleItems} basePath={basePath} />
      ) : (
        <AllWeddingsListView items={visibleItems} basePath={basePath} />
      )}

      {canCreateWedding ? (
        <AddWeddingFlowDialog open={openCreateDialog} onOpenChange={setOpenCreateDialog} />
      ) : null}
    </div>
  );
}
