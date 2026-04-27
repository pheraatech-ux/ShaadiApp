"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus, Search } from "lucide-react";

import { VendorCard } from "@/components/wedding-workspace/vendors/vendor-card";
import { VendorDetailPanel } from "@/components/wedding-workspace/vendors/vendor-detail-panel";
import { VendorFormDialog } from "@/components/wedding-workspace/vendors/vendor-form-dialog";
import { VendorListView } from "@/components/wedding-workspace/vendors/vendor-list-view";
import type { VendorsViewMode, WeddingVendorsWorkspaceViewModel } from "@/components/wedding-workspace/vendors/types";
import { formatInrFromPaise } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type WeddingVendorsWorkspaceProps = {
  view: WeddingVendorsWorkspaceViewModel;
};

type StatusFilter = "all" | "shortlisted" | "confirmed" | "declined" | "invited";

export function WeddingVendorsWorkspace({ view }: WeddingVendorsWorkspaceProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<VendorsViewMode>("cards");

  const filteredVendors = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return view.vendors.filter((vendor) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        vendor.name.toLowerCase().includes(normalizedQuery) ||
        vendor.category.toLowerCase().includes(normalizedQuery) ||
        (vendor.phone ?? "").toLowerCase().includes(normalizedQuery) ||
        (vendor.instagramHandle ?? "").toLowerCase().includes(normalizedQuery);
      if (!matchesQuery) return false;
      if (categoryFilter !== "all" && vendor.category !== categoryFilter) return false;
      if (statusFilter === "shortlisted" && vendor.status !== "pending") return false;
      if (statusFilter === "confirmed" && vendor.status !== "confirmed") return false;
      if (statusFilter === "declined" && vendor.status !== "declined") return false;
      if (statusFilter === "invited" && vendor.inviteStatus === "not_invited") return false;
      return true;
    });
  }, [categoryFilter, search, statusFilter, view.vendors]);

  async function createVendor(values: {
    category: string;
    name: string;
    phone: string;
    email: string;
    instagramHandle: string;
    quotedPriceRupees: string;
    advancePaidRupees: string;
    notes: string;
    isConfirmed: boolean;
  }) {
    const response = await fetch(`/api/weddings/${view.weddingSlug}/vendors`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Unable to create vendor.");
    }
    router.refresh();
  }

  async function deleteVendor(vendorId: string) {
    const response = await fetch(`/api/weddings/${view.weddingSlug}/vendors`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Unable to delete vendor.");
    }
    router.refresh();
  }

  const selectedVendor = selectedVendorId ? view.vendors.find((v) => v.id === selectedVendorId) ?? null : null;

  if (selectedVendor) {
    return (
      <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-6">
        <VendorDetailPanel
          weddingId={view.weddingId}
          weddingSlug={view.weddingSlug}
          vendor={selectedVendor}
          onBack={() => setSelectedVendorId(null)}
          onVendorUpdated={() => router.refresh()}
          onVendorDeleted={() => { setSelectedVendorId(null); router.refresh(); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="-mx-4 border-b border-border/60 px-4 pb-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vendors — {view.coupleName}</h1>
            <Badge variant="outline">{formatInrFromPaise(view.summary.totalQuotedPaise)} quoted</Badge>
            <Badge variant="outline">{formatInrFromPaise(view.summary.totalAdvancePaise)} paid</Badge>
          </div>
          <Button
            type="button"
            className="h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="size-4" />
            Add vendor
          </Button>
        </div>
      </section>

      {/* Stat cards — bleed */}
      <section className="-mx-4 grid grid-cols-2 border-b border-border/60 sm:-mx-6 lg:grid-cols-4">
        {[
          { id: "confirmed", label: "Confirmed", value: view.summary.confirmed, color: "text-emerald-400", helper: "Booked & locked in" },
          { id: "shortlisted", label: "Shortlisted", value: view.summary.shortlisted, color: "text-foreground", helper: `of ${view.summary.total} total` },
          { id: "invite-sent", label: "Invite sent", value: view.summary.inviteSent, color: "text-violet-400", helper: "Portal access sent" },
          { id: "pending-join", label: "Pending join", value: view.summary.pendingJoin, color: "text-amber-400", helper: "Awaiting acceptance" },
        ].map((card, i) => (
          <article
            key={card.id}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-4 text-center",
              i < 3 ? "border-r border-border/60" : "",
              i >= 2 ? "border-t border-border/60 lg:border-t-0" : "",
            )}
          >
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{card.label}</p>
            <p className={cn("text-2xl font-bold tabular-nums", card.color)}>{card.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{card.helper}</p>
          </article>
        ))}
      </section>

      {/* Filter bar — single row */}
      <section className="-mx-4 px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${view.summary.total})` },
              { id: "shortlisted", label: "Shortlisted" },
              { id: "confirmed", label: "Confirmed" },
              { id: "invited", label: "Invite sent" },
              { id: "declined", label: "Declined" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id as StatusFilter)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  statusFilter === item.id
                    ? "border-transparent bg-foreground text-background"
                    : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-[260px]">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vendors..."
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => { if (!value) return; setCategoryFilter(value); }}>
              <SelectTrigger className="h-8 w-[140px] rounded-xl text-xs">
                <SelectValue>
                  {categoryFilter === "all" ? "All categories" : categoryFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {view.quickCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon-sm"
                className="rounded-md"
                onClick={() => setViewMode("cards")}
                aria-label="Cards view"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
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
        </div>
      </section>

      {filteredVendors.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No vendors match your filters yet.
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onOpen={(v) => setSelectedVendorId(v.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <VendorListView
            vendors={filteredVendors}
            onOpen={(v) => setSelectedVendorId(v.id)}
          />
        </div>
      )}

      <VendorFormDialog
        key={`${formOpen}-create`}
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="create"
        vendor={null}
        onSubmit={createVendor}
      />
    </div>
  );
}
