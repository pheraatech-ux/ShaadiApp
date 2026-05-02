"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { BudgetDashboardHeader } from "./budget-dashboard-header";
import { BudgetKpiSection } from "./budget-kpi-section";
import { BudgetCategoryBreakdown } from "./budget-category-breakdown";
import { BudgetCategoryDetailPanel } from "./budget-category-detail-panel";
import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";

type BudgetDashboardProps = {
  view: WeddingBudgetWorkspaceViewModel;
};

export function BudgetDashboard({ view }: BudgetDashboardProps) {
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingTotal, setSavingTotal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/weddings/${view.weddingSlug}/budget`;

  // ─── Detail panel ─────────────────────────────────────────────────────────
  const selectedItem = selectedItemId ? view.budgetItems.find((i) => i.id === selectedItemId) ?? null : null;

  if (selectedItem) {
    return (
      <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-6">
        <BudgetCategoryDetailPanel
          item={selectedItem}
          vendors={view.vendors}
          weddingSlug={view.weddingSlug}
          coupleName={view.coupleName}
          onBack={() => setSelectedItemId(null)}
          onItemUpdated={() => router.refresh()}
        />
      </div>
    );
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  async function handleSaveTotalBudget(rupees: number) {
    setSavingTotal(true);
    setError(null);
    try {
      const res = await fetch(base, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudgetRupees: rupees }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to update total budget.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update total budget.");
    } finally {
      setSavingTotal(false);
    }
  }

  async function handleAdd(category: string, allocatedRupees: number, spentRupees: number) {
    setSavingId("__add__");
    setError(null);
    try {
      const res = await fetch(base, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, allocatedRupees, spentRupees }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to add category.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleEdit(id: string, category: string, allocatedRupees: number, spentRupees: number) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(base, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, category, allocatedRupees, spentRupees }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to update category.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(base, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to delete category.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Dashboard view ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <BudgetDashboardHeader
        coupleName={view.coupleName}
        weddingDate={view.weddingDate}
        venueName={view.venueName}
        city={view.city}
        cultures={view.cultures}
        onAddCategory={() => setShowAddForm(true)}
      />

      <BudgetKpiSection
        totalBudgetPaise={view.totalBudgetPaise}
        spentBudgetPaise={view.spentBudgetPaise}
        allocatedBudgetPaise={view.allocatedBudgetPaise}
        onSaveTotalBudget={handleSaveTotalBudget}
        savingTotal={savingTotal}
      />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <BudgetCategoryBreakdown
        items={[...view.budgetItems].sort((a, b) => {
          const uA = a.allocatedPaise > 0 ? (a.spentPaise + a.vendorSpentPaise) / a.allocatedPaise : 0;
          const uB = b.allocatedPaise > 0 ? (b.spentPaise + b.vendorSpentPaise) / b.allocatedPaise : 0;
          return uB - uA;
        })}
        totalBudgetPaise={view.totalBudgetPaise}
        showAddForm={showAddForm}
        onCloseAddForm={() => setShowAddForm(false)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={setSelectedItemId}
        savingId={savingId}
        deletingId={deletingId}
      />
    </div>
  );
}
