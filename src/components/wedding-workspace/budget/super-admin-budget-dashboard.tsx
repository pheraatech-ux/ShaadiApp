"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { BudgetAlertBanner } from "@/components/wedding-workspace/budget/budget-alert-banner";
import { computeBudgetDashboardDerived } from "@/components/wedding-workspace/budget/budget-dashboard-derived";
import { BudgetHeaderSection } from "@/components/wedding-workspace/budget/budget-header-section";
import { BudgetKpiCards } from "@/components/wedding-workspace/budget/budget-kpi-cards";
import { BudgetLineItemsPanel } from "@/components/wedding-workspace/budget/budget-line-items-panel";
import { BudgetPaymentSchedule } from "@/components/wedding-workspace/budget/budget-payment-schedule";
import { BudgetSideSplitCard } from "@/components/wedding-workspace/budget/budget-side-split-card";
import { BudgetSpendDonutChart } from "@/components/wedding-workspace/budget/budget-spend-donut-chart";
import { BudgetVsActualChart } from "@/components/wedding-workspace/budget/budget-vs-actual-chart";
import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";

type SuperAdminBudgetDashboardProps = {
  view: WeddingBudgetWorkspaceViewModel;
};

type DraftRow = { category: string; allocated: string; spent: string };

export function SuperAdminBudgetDashboard({ view }: SuperAdminBudgetDashboardProps) {
  const router = useRouter();
  const derived = useMemo(() => computeBudgetDashboardDerived(view), [view]);

  const [savingTotal, setSavingTotal] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newAllocatedRupees, setNewAllocatedRupees] = useState("");
  const [newSpentRupees, setNewSpentRupees] = useState("");
  const [editingTotalRupees, setEditingTotalRupees] = useState(String(Math.round(view.totalBudgetPaise / 100)));
  const [draftById, setDraftById] = useState<Record<string, DraftRow>>(() =>
    Object.fromEntries(
      view.budgetItems.map((item) => [
        item.id,
        {
          category: item.category,
          allocated: String(Math.round(item.allocatedPaise / 100)),
          spent: String(Math.round(item.spentPaise / 100)),
        },
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSaveTotalBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTotal(true);
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${view.weddingSlug}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ totalBudgetRupees: Math.max(0, Number(editingTotalRupees || "0")) }),
      });
      if (!response.ok) throw new Error("Unable to update total budget.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update total budget.");
    } finally {
      setSavingTotal(false);
    }
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${view.weddingSlug}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: newCategory.trim(),
          allocatedRupees: Math.max(0, Number(newAllocatedRupees || "0")),
          spentRupees: Math.max(0, Number(newSpentRupees || "0")),
        }),
      });
      if (!response.ok) throw new Error("Unable to add budget item.");
      setNewCategory("");
      setNewAllocatedRupees("");
      setNewSpentRupees("");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to add budget item.");
    }
  }

  async function handleSaveItem(itemId: string) {
    setSavingItemId(itemId);
    setError(null);
    try {
      const draft = draftById[itemId];
      const response = await fetch(`/api/weddings/${view.weddingSlug}/budget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemId,
          category: draft.category.trim(),
          allocatedRupees: Math.max(0, Number(draft.allocated || "0")),
          spentRupees: Math.max(0, Number(draft.spent || "0")),
        }),
      });
      if (!response.ok) throw new Error("Unable to save budget item.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save budget item.");
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleDeleteItem(itemId: string) {
    setDeletingItemId(itemId);
    setError(null);
    try {
      const response = await fetch(`/api/weddings/${view.weddingSlug}/budget`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId }),
      });
      if (!response.ok) throw new Error("Unable to delete budget item.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to delete budget item.");
    } finally {
      setDeletingItemId(null);
    }
  }

  function handleDraftChange(itemId: string, patch: Partial<DraftRow>) {
    setDraftById((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-[#0b0c0f] p-4 text-zinc-100 sm:p-5">
      <section className="space-y-3">
        <BudgetHeaderSection
          coupleName={view.coupleName}
          cultures={view.cultures}
          editingTotalRupees={editingTotalRupees}
          onEditingTotalRupeesChange={setEditingTotalRupees}
          onSaveTotalSubmit={handleSaveTotalBudget}
          savingTotal={savingTotal}
        />
        <BudgetAlertBanner
          overrunPaise={derived.overrunPaise}
          estimatedTotalPaise={derived.estimatedTotalPaise}
          totalBudgetPaise={view.totalBudgetPaise}
          utilization={derived.utilization}
          allocatedCoverage={derived.allocatedCoverage}
          topVarianceBucketLabel={derived.topVarianceBucketLabel}
        />
      </section>

      <BudgetKpiCards
        totalBudgetPaise={view.totalBudgetPaise}
        estimatedTotalPaise={derived.estimatedTotalPaise}
        advancePaidPaise={derived.advancePaidPaise}
        balanceDuePaise={derived.balanceDuePaise}
        allocatedCoverage={derived.allocatedCoverage}
        overrunPaise={derived.overrunPaise}
      />

      <section className="grid gap-3 xl:grid-cols-[1.15fr_1fr_0.95fr]">
        <BudgetVsActualChart bars={derived.topBars} />
        <BudgetPaymentSchedule rows={derived.paymentRows} />
        <BudgetSideSplitCard
          sideSplit={derived.sideSplit}
          marginPaise={derived.marginPaise}
          healthTone={derived.healthTone}
          utilization={derived.utilization}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.25fr_0.95fr]">
        <BudgetLineItemsPanel
          view={view}
          newCategory={newCategory}
          newAllocatedRupees={newAllocatedRupees}
          newSpentRupees={newSpentRupees}
          onNewCategoryChange={setNewCategory}
          onNewAllocatedChange={setNewAllocatedRupees}
          onNewSpentChange={setNewSpentRupees}
          onAddSubmit={handleAddItem}
          draftById={draftById}
          onDraftChange={handleDraftChange}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          savingItemId={savingItemId}
          deletingItemId={deletingItemId}
        />
        <BudgetSpendDonutChart
          estimatedTotalPaise={derived.estimatedTotalPaise}
          donutStyle={derived.donutStyle}
          segments={derived.donutSegments}
        />
      </section>

      {error ? (
        <div className="rounded-lg border border-rose-900/70 bg-rose-950/40 p-2 text-xs text-rose-200">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
