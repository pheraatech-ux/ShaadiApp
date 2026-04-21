"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from "lucide-react";

import { AppPageHeader } from "@/components/app-dashboard/dashboard/app-page-header";
import { AddWeddingFlowDialog } from "@/components/app-dashboard/dashboard/add-wedding-flow-dialog";
import { AllWeddingsCardView } from "@/components/app-dashboard/all-weddings/all-weddings-card-view";
import { AllWeddingsListView } from "@/components/app-dashboard/all-weddings/all-weddings-list-view";
import type {
  AllWeddingsFilter,
  AllWeddingsPageView,
  AllWeddingsSort,
  AllWeddingsViewMode,
} from "@/components/app-dashboard/all-weddings/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  return (
    <div className="space-y-5">
      <AppPageHeader
        title="All weddings"
        description={
          <>
            Free plan: <span className="font-medium text-foreground">{initialData.usedSlots}</span> of{" "}
            <span className="font-medium text-foreground">{initialData.planCap}</span> weddings used.
            {slotsLeft > 0 ? ` ${slotsLeft} more slot${slotsLeft > 1 ? "s" : ""} remaining.` : " Upgrade for more slots."}
          </>
        }
        actions={
          canCreateWedding ? (
          <>
            <Button variant="outline" size="sm" className="rounded-xl">
              <SlidersHorizontal />
              Filter
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => setOpenCreateDialog(true)}>
              <Plus />
              New wedding
            </Button>
          </>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-xl border-border/70 bg-muted/30 pl-9"
              placeholder="Search couple, city, culture..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as AllWeddingsSort)}>
            <SelectTrigger className="h-9 w-full rounded-xl sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-latest">Date (latest first)</SelectItem>
              <SelectItem value="date-earliest">Date (earliest first)</SelectItem>
              <SelectItem value="name-a-z">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 self-end rounded-lg border border-border/70 p-1 sm:self-auto">
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="icon-sm"
            className="rounded-md"
            onClick={() => setViewMode("cards")}
            aria-label="Cards view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            className="rounded-md"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-fit gap-0.5 rounded-lg bg-muted/60 p-0.5">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
              filter === tab.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-80">{initialData.counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-card px-5 py-10 text-center">
          <p className="text-sm font-medium">No weddings match this filter yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different filter or create a new wedding workspace.</p>
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
