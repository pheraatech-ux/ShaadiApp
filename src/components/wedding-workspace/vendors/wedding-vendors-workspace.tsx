"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus, Search } from "lucide-react";

import { VendorCard } from "@/components/wedding-workspace/vendors/vendor-card";
import { VendorListView } from "@/components/wedding-workspace/vendors/vendor-list-view";
import { VendorFormDialog } from "@/components/wedding-workspace/vendors/vendor-form-dialog";
import { VendorInviteDialog } from "@/components/wedding-workspace/vendors/vendor-invite-dialog";
import type {
  VendorsViewMode,
  WeddingVendorRecord,
  WeddingVendorsWorkspaceViewModel,
} from "@/components/wedding-workspace/vendors/types";
import { formatInrFromPaise } from "@/components/wedding-workspace/vendors/vendor-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedVendor, setSelectedVendor] = useState<WeddingVendorRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
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
      if (statusFilter === "invited" && vendor.inviteStatus === "not_sent") return false;
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

  async function updateVendor(values: {
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
    if (!selectedVendor) return;
    const response = await fetch(`/api/weddings/${view.weddingSlug}/vendors`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: selectedVendor.id,
        ...values,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Unable to update vendor.");
    }
    router.refresh();
  }

  async function sendInvite(vendorId: string) {
    const response = await fetch(`/api/weddings/${view.weddingSlug}/vendors`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId,
        markInviteSent: true,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Unable to send invite.");
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Vendors - {view.coupleName}</h1>
              <p className="text-sm text-muted-foreground">
                Keep shortlist, booking and portal invites in one place.
              </p>
            </div>
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={() => {
                setSelectedVendor(null);
                setFormMode("create");
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add vendor
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { id: "confirmed", label: "Confirmed", value: view.summary.confirmed, tone: "text-emerald-300" },
              { id: "shortlisted", label: "Shortlisted", value: view.summary.shortlisted, tone: "text-foreground" },
              { id: "invite-sent", label: "Invite sent", value: view.summary.inviteSent, tone: "text-violet-300" },
              { id: "pending-join", label: "Pending join", value: view.summary.pendingJoin, tone: "text-amber-300" },
            ].map((item) => (
              <div key={item.id} className="rounded-xl border border-border/70 bg-muted/15 p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{item.label}</p>
                <p className={cn("mt-1 text-2xl font-semibold", item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Quoted total {formatInrFromPaise(view.summary.totalQuotedPaise)}</Badge>
            <Badge variant="outline">Advance paid {formatInrFromPaise(view.summary.totalAdvancePaise)}</Badge>
            <Badge variant="outline">{view.summary.total} vendors</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All vendors" },
              ...view.quickCategories.map((category) => ({ id: category, label: category })),
            ].map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryFilter(category.id)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium",
                  categoryFilter === category.id
                    ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-300"
                    : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground",
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All" },
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
                  "rounded-lg border px-2.5 py-1 text-xs font-medium",
                  statusFilter === item.id
                    ? "border-violet-500/70 bg-violet-500/10 text-violet-300"
                    : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vendor, category, phone or Instagram..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 self-end rounded-lg border border-border/70 p-1 sm:self-auto">
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
        </CardContent>
      </Card>

      {filteredVendors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No vendors match your filters yet.
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={(nextVendor) => {
                setSelectedVendor(nextVendor);
                setFormMode("edit");
                setFormOpen(true);
              }}
              onInvite={(nextVendor) => {
                setSelectedVendor(nextVendor);
                setInviteOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <VendorListView
          vendors={filteredVendors}
          onEdit={(nextVendor) => {
            setSelectedVendor(nextVendor);
            setFormMode("edit");
            setFormOpen(true);
          }}
          onInvite={(nextVendor) => {
            setSelectedVendor(nextVendor);
            setInviteOpen(true);
          }}
        />
      )}

      <VendorFormDialog
        key={`${formOpen}-${formMode}-${selectedVendor?.id ?? "new"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        vendor={selectedVendor}
        onSubmit={formMode === "create" ? createVendor : updateVendor}
      />
      <VendorInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        weddingLabel={view.coupleName}
        weddingSlug={view.weddingSlug}
        vendor={selectedVendor}
        onSendInvite={sendInvite}
      />
    </div>
  );
}
