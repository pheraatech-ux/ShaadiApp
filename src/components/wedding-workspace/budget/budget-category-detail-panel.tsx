"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

type BudgetItem = {
  id: string;
  category: string;
  allocatedPaise: number;
  spentPaise: number;
  allocationPct: number | null;
};

type Vendor = {
  id: string;
  name: string;
  category: string;
  quotedPricePaise: number;
  advancePaidPaise: number;
  status: "pending" | "confirmed" | "declined";
};

export type BudgetExpense = {
  id: string;
  description: string;
  amount_paise: number;
  status: "paid" | "pending";
  created_at: string;
};

type BudgetCategoryDetailPanelProps = {
  item: BudgetItem;
  vendors: Vendor[];
  weddingSlug: string;
  coupleName: string;
  onBack: () => void;
  onItemUpdated: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type StatusVariant = "emerald" | "amber" | "rose";

function getCategoryStatus(spentPaise: number, allocatedPaise: number): { label: string; variant: StatusVariant } {
  if (allocatedPaise <= 0) return { label: "Unallocated", variant: "amber" };
  const u = (spentPaise / allocatedPaise) * 100;
  if (u >= 100) return { label: "Over budget", variant: "rose" };
  if (u >= 80) return { label: "At limit", variant: "amber" };
  return { label: "On track", variant: "emerald" };
}

const STATUS_BADGE: Record<StatusVariant, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function vendorStatusLabel(status: Vendor["status"], advancePaise: number, quotedPaise: number) {
  if (advancePaise >= quotedPaise && quotedPaise > 0) return { label: "Paid", variant: "emerald" as StatusVariant };
  if (advancePaise > 0) return { label: "Partial", variant: "amber" as StatusVariant };
  if (status === "confirmed") return { label: "Confirmed", variant: "emerald" as StatusVariant };
  if (status === "declined") return { label: "Declined", variant: "rose" as StatusVariant };
  return { label: "Pending", variant: "amber" as StatusVariant };
}

// ─── Edit allocation inline ───────────────────────────────────────────────────

type EditAllocationProps = {
  item: BudgetItem;
  weddingSlug: string;
  onSaved: () => void;
  onCancel: () => void;
};

function EditAllocationInline({ item, weddingSlug, onSaved, onCancel }: EditAllocationProps) {
  const [allocated, setAllocated] = useState(String(Math.round(item.allocatedPaise / 100)));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/weddings/${weddingSlug}/budget`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, allocatedRupees: parseFloat(allocated) || 0 }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to update allocation.");
      }
      toast.success("Allocation updated.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update allocation.");
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">₹</span>
      <Input
        className="h-8 w-36 rounded-lg text-sm"
        inputMode="numeric"
        value={allocated}
        autoFocus
        onChange={(e) => setAllocated(e.target.value.replace(/[^\d.]/g, ""))}
        onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <Button size="icon-sm" variant="ghost" onClick={() => void handleSave()} disabled={saving}>
        <Check className="size-3.5 text-emerald-500" />
      </Button>
      <Button size="icon-sm" variant="ghost" onClick={onCancel} disabled={saving}>
        <X className="size-3.5" />
      </Button>
    </div>
  );
}

// ─── Add expense row ──────────────────────────────────────────────────────────

type AddExpenseRowProps = {
  onSave: (description: string, amountRupees: number, status: "paid" | "pending") => void;
  onCancel: () => void;
  saving: boolean;
};

function AddExpenseRow({ onSave, onCancel, saving }: AddExpenseRowProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("pending");

  function handleSave() {
    const desc = description.trim();
    if (!desc) return;
    onSave(desc, parseFloat(amount) || 0, status);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_100px_100px_80px] items-center gap-x-3 border-t bg-muted/20 px-4 py-2.5">
      <Input
        className="h-7 rounded-lg text-sm"
        placeholder="Description"
        value={description}
        autoFocus
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        placeholder="Amount"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <select
        className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
        value={status}
        onChange={(e) => setStatus(e.target.value as "paid" | "pending")}
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
      </select>
      <div />
      <div className="flex items-center justify-end gap-1">
        <Button size="icon-sm" variant="ghost" onClick={handleSave} disabled={saving || !description.trim()}>
          <Check className="size-3.5 text-emerald-500" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Edit expense row ─────────────────────────────────────────────────────────

type EditExpenseRowProps = {
  expense: BudgetExpense;
  onSave: (id: string, description: string, amountRupees: number, status: "paid" | "pending") => void;
  onCancel: () => void;
  saving: boolean;
};

function EditExpenseRow({ expense, onSave, onCancel, saving }: EditExpenseRowProps) {
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(Math.round(expense.amount_paise / 100)));
  const [status, setStatus] = useState<"paid" | "pending">(expense.status);

  function handleSave() {
    const desc = description.trim();
    if (!desc) return;
    onSave(expense.id, desc, parseFloat(amount) || 0, status);
  }

  return (
    <div className="grid grid-cols-[1fr_120px_100px_100px_80px] items-center gap-x-3 border-t bg-muted/20 px-4 py-2.5">
      <Input
        className="h-7 rounded-lg text-sm"
        value={description}
        autoFocus
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <select
        className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
        value={status}
        onChange={(e) => setStatus(e.target.value as "paid" | "pending")}
      >
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
      </select>
      <div />
      <div className="flex items-center justify-end gap-1">
        <Button size="icon-sm" variant="ghost" onClick={handleSave} disabled={saving || !description.trim()}>
          <Check className="size-3.5 text-emerald-500" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function BudgetCategoryDetailPanel({
  item,
  vendors,
  weddingSlug,
  coupleName,
  onBack,
  onItemUpdated,
}: BudgetCategoryDetailPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingAllocation, setEditingAllocation] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const expensesBase = `/api/weddings/${weddingSlug}/budget/${item.id}/expenses`;
  const queryKey = ["budget-expenses", item.id];

  // ─── Fetch expenses ────────────────────────────────────────────────────────
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(expensesBase, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load expenses.");
      const body = (await res.json()) as { expenses: BudgetExpense[] };
      return body.expenses;
    },
  });

  // After any mutation settles, refresh server component so KPI cards update
  function refreshAll() {
    void queryClient.invalidateQueries({ queryKey });
    router.refresh();
    onItemUpdated();
  }

  // ─── Add expense ──────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (vars: { description: string; amountRupees: number; status: "paid" | "pending" }) => {
      const res = await fetch(expensesBase, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to add expense.");
      }
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BudgetExpense[]>(queryKey);
      const optimistic: BudgetExpense = {
        id: `__optimistic_${Date.now()}`,
        description: vars.description,
        amount_paise: Math.round(vars.amountRupees * 100),
        status: vars.status,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => [optimistic, ...old]);
      setShowAddExpense(false);
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error(err instanceof Error ? err.message : "Unable to add expense.");
    },
    onSuccess: () => toast.success("Expense added."),
    onSettled: () => refreshAll(),
  });

  // ─── Update expense ───────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async (vars: { expenseId: string; description: string; amountRupees: number; status: "paid" | "pending" }) => {
      const res = await fetch(expensesBase, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to update expense.");
      }
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BudgetExpense[]>(queryKey);
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) =>
        old.map((e) =>
          e.id === vars.expenseId
            ? { ...e, description: vars.description, amount_paise: Math.round(vars.amountRupees * 100), status: vars.status }
            : e,
        ),
      );
      setEditingExpenseId(null);
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error(err instanceof Error ? err.message : "Unable to update expense.");
    },
    onSuccess: () => toast.success("Expense updated."),
    onSettled: () => refreshAll(),
  });

  // ─── Delete expense ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const res = await fetch(expensesBase, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Unable to delete expense.");
      }
    },
    onMutate: async (expenseId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BudgetExpense[]>(queryKey);
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => old.filter((e) => e.id !== expenseId));
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
      toast.error(err instanceof Error ? err.message : "Unable to delete expense.");
    },
    onSuccess: () => toast.success("Expense removed."),
    onSettled: () => refreshAll(),
  });

  // ─── Derived values ───────────────────────────────────────────────────────
  const linkedVendors = vendors.filter(
    (v) => v.category.toLowerCase().trim() === item.category.toLowerCase().trim(),
  );

  // Use optimistic expenses total for the spent display
  const optimisticSpentPaise = expenses.reduce((s, e) => s + e.amount_paise, 0);
  const displaySpentPaise = expenses.length > 0 ? optimisticSpentPaise : item.spentPaise;
  const remainingPaise = Math.max(0, item.allocatedPaise - displaySpentPaise);
  const utilization = pct(displaySpentPaise, item.allocatedPaise);
  const categoryStatus = getCategoryStatus(displaySpentPaise, item.allocatedPaise);

  const totalExpensesPaise = expenses.reduce((s, e) => s + e.amount_paise, 0);

  function handleAllocationSaved() {
    setEditingAllocation(false);
    router.refresh();
    onItemUpdated();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-6">
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
          <h2 className="truncate text-base font-semibold">{item.category}</h2>
          <Badge variant="outline" className={`shrink-0 text-[11px] ${STATUS_BADGE[categoryStatus.variant]}`}>
            {categoryStatus.label}
          </Badge>
          <span className="hidden truncate text-sm text-muted-foreground sm:block">
            Part of {coupleName} wedding
          </span>
        </div>
        <div>
          {editingAllocation ? (
            <EditAllocationInline
              item={item}
              weddingSlug={weddingSlug}
              onSaved={handleAllocationSaved}
              onCancel={() => setEditingAllocation(false)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => setEditingAllocation(true)}
            >
              <Pencil className="size-3.5" />
              Edit allocation
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 px-4 py-6 sm:px-6">

          {/* KPI cards */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <article className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allocated Budget</p>
              <p className="mt-2 text-xl font-bold tracking-tight">{formatInr(item.allocatedPaise)}</p>
              {item.allocationPct != null && (
                <p className="mt-1 text-xs text-muted-foreground">{item.allocationPct}% of total</p>
              )}
            </article>
            <article className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Spent</p>
              <p className="mt-2 text-xl font-bold tracking-tight">{formatInr(displaySpentPaise)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{utilization}% of allocated</p>
            </article>
            <article className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remaining</p>
              <p className={`mt-2 text-xl font-bold tracking-tight ${displaySpentPaise > item.allocatedPaise ? "text-rose-500" : ""}`}>
                {formatInr(remainingPaise)}
              </p>
            </article>
            <article className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Utilization</p>
              <p className={`mt-2 text-xl font-bold tracking-tight ${utilization >= 100 ? "text-rose-500" : utilization >= 80 ? "text-amber-500" : ""}`}>
                {utilization}%
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${utilization >= 100 ? "bg-rose-500" : utilization >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${clamp(utilization, 0, 100)}%` }}
                />
              </div>
            </article>
          </section>

          {/* Linked vendors */}
          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Linked vendors</h3>
            </div>

            {linkedVendors.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No vendors in the <span className="font-medium text-foreground">{item.category}</span> category yet.
                Add vendors from the Vendors module and they will appear here automatically.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_130px_110px_110px_100px] border-b bg-muted/30 px-4 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vendor</p>
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quoted&nbsp;Amount</p>
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid</p>
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remaining</p>
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                </div>
                {linkedVendors.map((vendor) => {
                  const vStatus = vendorStatusLabel(vendor.status, vendor.advancePaidPaise, vendor.quotedPricePaise);
                  const vRemaining = Math.max(0, vendor.quotedPricePaise - vendor.advancePaidPaise);
                  return (
                    <div key={vendor.id} className="grid grid-cols-[1fr_130px_110px_110px_100px] items-center border-t px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                          {vendor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{vendor.name}</span>
                      </div>
                      <p className="text-center text-sm">{formatInr(vendor.quotedPricePaise)}</p>
                      <p className="text-center text-sm">{formatInr(vendor.advancePaidPaise)}</p>
                      <p className="text-center text-sm">{formatInr(vRemaining)}</p>
                      <div className="flex justify-center">
                        <Badge variant="outline" className={`text-[11px] ${STATUS_BADGE[vStatus.variant]}`}>
                          {vStatus.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t bg-muted/10 px-4 py-2.5">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TriangleAlert className="size-3 shrink-0" />
                    Vendor amounts are synced from the Vendors module.
                    <a
                      href={`/weddings/${weddingSlug}/vendors`}
                      className="ml-auto flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      View vendors <ExternalLink className="size-3" />
                    </a>
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Other expenses */}
          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Other expenses</h3>
              <Button
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => setShowAddExpense(true)}
                disabled={showAddExpense}
              >
                <Plus className="size-3.5" />
                Add expense
              </Button>
            </div>

            {/* Table header */}
            {(expenses.length > 0 || showAddExpense) && (
              <div className="grid grid-cols-[1fr_120px_100px_100px_80px] border-b bg-muted/30 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expense</p>
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</p>
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Added&nbsp;On</p>
                <p className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</p>
              </div>
            )}

            {showAddExpense && (
              <AddExpenseRow
                onSave={(description, amountRupees, status) => addMutation.mutate({ description, amountRupees, status })}
                onCancel={() => setShowAddExpense(false)}
                saving={addMutation.isPending}
              />
            )}

            {loadingExpenses ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : expenses.length === 0 && !showAddExpense ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No manual expenses recorded yet.
              </div>
            ) : (
              expenses.map((expense) => {
                const isOptimistic = expense.id.startsWith("__optimistic_");
                if (editingExpenseId === expense.id) {
                  return (
                    <EditExpenseRow
                      key={expense.id}
                      expense={expense}
                      onSave={(id, description, amountRupees, status) =>
                        updateMutation.mutate({ expenseId: id, description, amountRupees, status })
                      }
                      onCancel={() => setEditingExpenseId(null)}
                      saving={updateMutation.isPending}
                    />
                  );
                }
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === expense.id;
                return (
                  <div
                    key={expense.id}
                    className={`group grid grid-cols-[1fr_120px_100px_100px_80px] items-center border-t px-4 py-3 transition-colors hover:bg-muted/10 ${isOptimistic ? "opacity-60" : ""}`}
                  >
                    <p className="text-sm">{expense.description}</p>
                    <p className="text-center text-sm font-medium">{formatInr(expense.amount_paise)}</p>
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${expense.status === "paid" ? STATUS_BADGE.emerald : STATUS_BADGE.amber}`}
                      >
                        {expense.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      {isOptimistic ? "Just now" : formatDate(expense.created_at)}
                    </p>
                    <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {!isOptimistic && (
                        <>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={isDeleting}
                            onClick={() => setEditingExpenseId(expense.id)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={isDeleting}
                            onClick={() => deleteMutation.mutate(expense.id)}
                          >
                            <Trash2 className={`size-3.5 ${isDeleting ? "animate-pulse text-rose-500" : "text-muted-foreground"}`} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {expenses.length > 0 && (
              <div className="grid grid-cols-[1fr_120px_100px_100px_80px] items-center border-t bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total spent in this category
                </p>
                <p className="text-center text-sm font-semibold">{formatInr(totalExpensesPaise)}</p>
                <div />
                <div />
                <div />
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
