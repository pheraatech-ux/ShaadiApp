"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  BusinessFinancialsData,
  CustomExpenseCategory,
  ExpenseEntry,
  OverdueReceivable,
  RevenueEntry,
} from "./types";

// ─── Query keys ─────────────────────────────────────────────────────────────

const QUERY_KEYS = {
  revenue:           ["business", "revenue"]            as const,
  expenses:          ["business", "expenses"]           as const,
  expenseCategories: ["business", "expense-categories"] as const,
  receivables:       ["business", "receivables"]        as const,
};

// ─── DB row shapes ───────────────────────────────────────────────────────────

type DbRevenueRow      = { id: string; category: string; amount_paise: number; entry_date: string; description: string };
type DbExpenseRow      = { id: string; category_id: string; category_label: string; amount_paise: number; entry_date: string; description: string };
type DbCategoryRow     = { id: string; label: string };
type DbReceivableRow   = { id: string; client_name: string; amount_paise: number; due_since: string };

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapRevenue(r: DbRevenueRow): RevenueEntry {
  return { id: r.id, category: r.category as RevenueEntry["category"], amountRupees: r.amount_paise / 100, date: r.entry_date, description: r.description };
}
function mapExpense(e: DbExpenseRow): ExpenseEntry {
  return { id: e.id, categoryId: e.category_id, categoryLabel: e.category_label, amountRupees: e.amount_paise / 100, date: e.entry_date, description: e.description };
}
function mapCategory(c: DbCategoryRow): CustomExpenseCategory {
  return { id: c.id, label: c.label };
}
function mapReceivable(r: DbReceivableRow): OverdueReceivable {
  return { id: r.id, clientName: r.client_name, amountRupees: r.amount_paise / 100, dueSince: r.due_since };
}

// ─── Fetch fns ───────────────────────────────────────────────────────────────

async function fetchRevenue(): Promise<RevenueEntry[]> {
  const res = await fetch("/api/business/revenue");
  if (!res.ok) throw new Error("Failed to fetch revenue");
  return ((await res.json()) as DbRevenueRow[]).map(mapRevenue);
}
async function fetchExpenses(): Promise<ExpenseEntry[]> {
  const res = await fetch("/api/business/expenses");
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return ((await res.json()) as DbExpenseRow[]).map(mapExpense);
}
async function fetchCategories(): Promise<CustomExpenseCategory[]> {
  const res = await fetch("/api/business/expense-categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return ((await res.json()) as DbCategoryRow[]).map(mapCategory);
}
async function fetchReceivables(): Promise<OverdueReceivable[]> {
  const res = await fetch("/api/business/receivables");
  if (!res.ok) throw new Error("Failed to fetch receivables");
  return ((await res.json()) as DbReceivableRow[]).map(mapReceivable);
}

// ─── Main hook ───────────────────────────────────────────────────────────────

export function useFinancialData() {
  const queryClient = useQueryClient();

  const revenueQ    = useQuery({ queryKey: QUERY_KEYS.revenue,           queryFn: fetchRevenue,     staleTime: 30_000 });
  const expensesQ   = useQuery({ queryKey: QUERY_KEYS.expenses,          queryFn: fetchExpenses,    staleTime: 30_000 });
  const categoriesQ = useQuery({ queryKey: QUERY_KEYS.expenseCategories, queryFn: fetchCategories,  staleTime: 30_000 });
  const receivablesQ= useQuery({ queryKey: QUERY_KEYS.receivables,       queryFn: fetchReceivables, staleTime: 30_000 });

  const data: BusinessFinancialsData = {
    revenueEntries:           revenueQ.data     ?? [],
    expenseEntries:           expensesQ.data    ?? [],
    customExpenseCategories:  categoriesQ.data  ?? [],
    overdueReceivables:       receivablesQ.data ?? [],
  };

  const ready = !revenueQ.isLoading && !expensesQ.isLoading && !categoriesQ.isLoading && !receivablesQ.isLoading;

  // ── Revenue ────────────────────────────────────────────────────────────────

  const addRevenueMut = useMutation({
    mutationFn: async (entry: Omit<RevenueEntry, "id">) => {
      const res = await fetch("/api/business/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to add entry");
      }
      return mapRevenue((await res.json()) as DbRevenueRow);
    },
    onMutate: async (entry) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.revenue });
      const previous = queryClient.getQueryData<RevenueEntry[]>(QUERY_KEYS.revenue);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<RevenueEntry[]>(QUERY_KEYS.revenue, (old = []) => [
        { ...entry, id: tempId }, ...old,
      ]);
      toast.success("Revenue entry added");
      return { previous, tempId };
    },
    onError: (_err, entry, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.revenue, ctx.previous);
      toast.error(`Failed to add ${entry.category.replace(/_/g, " ")} entry`);
    },
    onSuccess: (real, _entry, ctx) => {
      queryClient.setQueryData<RevenueEntry[]>(QUERY_KEYS.revenue, (old = []) =>
        old.map((e) => (e.id === ctx?.tempId ? real : e)),
      );
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.revenue }); },
  });

  const deleteRevenueMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/revenue/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.revenue });
      const previous = queryClient.getQueryData<RevenueEntry[]>(QUERY_KEYS.revenue);
      queryClient.setQueryData<RevenueEntry[]>(QUERY_KEYS.revenue, (old = []) => old.filter((e) => e.id !== id));
      toast.success("Revenue entry deleted");
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.revenue, ctx.previous);
      toast.error("Failed to delete revenue entry");
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.revenue }); },
  });

  // ── Expenses ───────────────────────────────────────────────────────────────

  const addExpenseMut = useMutation({
    mutationFn: async (entry: Omit<ExpenseEntry, "id">) => {
      const res = await fetch("/api/business/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to add expense");
      }
      return mapExpense((await res.json()) as DbExpenseRow);
    },
    onMutate: async (entry) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenses });
      const previous = queryClient.getQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses, (old = []) => [
        { ...entry, id: tempId }, ...old,
      ]);
      toast.success(`${entry.categoryLabel} expense added`);
      return { previous, tempId };
    },
    onError: (_err, entry, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.expenses, ctx.previous);
      toast.error(`Failed to add ${entry.categoryLabel} expense`);
    },
    onSuccess: (real, _entry, ctx) => {
      queryClient.setQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses, (old = []) =>
        old.map((e) => (e.id === ctx?.tempId ? real : e)),
      );
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses }); },
  });

  const deleteExpenseMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenses });
      const previous = queryClient.getQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses);
      queryClient.setQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses, (old = []) => old.filter((e) => e.id !== id));
      toast.success("Expense deleted");
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.expenses, ctx.previous);
      toast.error("Failed to delete expense");
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses }); },
  });

  // ── Custom expense categories ──────────────────────────────────────────────

  const addCategoryMut = useMutation({
    mutationFn: async (label: string) => {
      const res = await fetch("/api/business/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to add category");
      }
      return mapCategory((await res.json()) as DbCategoryRow);
    },
    onMutate: async (label) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenseCategories });
      const previous = queryClient.getQueryData<CustomExpenseCategory[]>(QUERY_KEYS.expenseCategories);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<CustomExpenseCategory[]>(QUERY_KEYS.expenseCategories, (old = []) => [
        ...old, { id: tempId, label },
      ]);
      toast.success(`"${label}" category added`);
      return { previous, tempId };
    },
    onError: (_err, label, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.expenseCategories, ctx.previous);
      toast.error(`Failed to add "${label}" category`);
    },
    onSuccess: (real, _label, ctx) => {
      queryClient.setQueryData<CustomExpenseCategory[]>(QUERY_KEYS.expenseCategories, (old = []) =>
        old.map((c) => (c.id === ctx?.tempId ? real : c)),
      );
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenseCategories }); },
  });

  const deleteCategoryMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/expense-categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenseCategories });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenses });
      const previousCategories = queryClient.getQueryData<CustomExpenseCategory[]>(QUERY_KEYS.expenseCategories);
      const previousExpenses   = queryClient.getQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses);
      const deleted = previousCategories?.find((c) => c.id === id);
      queryClient.setQueryData<CustomExpenseCategory[]>(QUERY_KEYS.expenseCategories, (old = []) => old.filter((c) => c.id !== id));
      queryClient.setQueryData<ExpenseEntry[]>(QUERY_KEYS.expenses, (old = []) => old.filter((e) => e.categoryId !== id));
      toast.success(deleted ? `"${deleted.label}" category deleted` : "Category deleted");
      return { previousCategories, previousExpenses };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousCategories) queryClient.setQueryData(QUERY_KEYS.expenseCategories, ctx.previousCategories);
      if (ctx?.previousExpenses)   queryClient.setQueryData(QUERY_KEYS.expenses, ctx.previousExpenses);
      toast.error("Failed to delete category");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenseCategories });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
    },
  });

  // ── Overdue receivables ────────────────────────────────────────────────────

  const addReceivableMut = useMutation({
    mutationFn: async (entry: Omit<OverdueReceivable, "id">) => {
      const res = await fetch("/api/business/receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to add receivable");
      }
      return mapReceivable((await res.json()) as DbReceivableRow);
    },
    onMutate: async (entry) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.receivables });
      const previous = queryClient.getQueryData<OverdueReceivable[]>(QUERY_KEYS.receivables);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData<OverdueReceivable[]>(QUERY_KEYS.receivables, (old = []) => [
        ...old, { ...entry, id: tempId },
      ]);
      toast.success(`${entry.clientName} added to receivables`);
      return { previous, tempId };
    },
    onError: (_err, entry, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.receivables, ctx.previous);
      toast.error(`Failed to add ${entry.clientName}`);
    },
    onSuccess: (real, _entry, ctx) => {
      queryClient.setQueryData<OverdueReceivable[]>(QUERY_KEYS.receivables, (old = []) =>
        old.map((r) => (r.id === ctx?.tempId ? real : r)),
      );
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivables }); },
  });

  const deleteReceivableMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/receivables/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete receivable");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.receivables });
      const previous = queryClient.getQueryData<OverdueReceivable[]>(QUERY_KEYS.receivables);
      const deleted = previous?.find((r) => r.id === id);
      queryClient.setQueryData<OverdueReceivable[]>(QUERY_KEYS.receivables, (old = []) => old.filter((r) => r.id !== id));
      toast.success(deleted ? `${deleted.clientName} removed` : "Receivable removed");
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(QUERY_KEYS.receivables, ctx.previous);
      toast.error("Failed to remove receivable");
    },
    onSettled: () => { void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivables }); },
  });

  // ── Stable callback wrappers (same shape as before) ───────────────────────

  const addRevenueEntry          = useCallback((e: Omit<RevenueEntry, "id">)           => addRevenueMut.mutate(e),           [addRevenueMut]);
  const deleteRevenueEntry       = useCallback((id: string)                             => deleteRevenueMut.mutate(id),        [deleteRevenueMut]);
  const addExpenseEntry          = useCallback((e: Omit<ExpenseEntry, "id">)            => addExpenseMut.mutate(e),            [addExpenseMut]);
  const deleteExpenseEntry       = useCallback((id: string)                             => deleteExpenseMut.mutate(id),        [deleteExpenseMut]);
  const addCustomExpenseCategory = useCallback((label: string)                          => addCategoryMut.mutate(label),       [addCategoryMut]);
  const deleteCustomExpenseCategory = useCallback((id: string)                          => deleteCategoryMut.mutate(id),       [deleteCategoryMut]);
  const addOverdueReceivable     = useCallback((e: Omit<OverdueReceivable, "id">)       => addReceivableMut.mutate(e),         [addReceivableMut]);
  const deleteOverdueReceivable  = useCallback((id: string)                             => deleteReceivableMut.mutate(id),     [deleteReceivableMut]);

  return {
    data,
    ready,
    addRevenueEntry,
    deleteRevenueEntry,
    addExpenseEntry,
    deleteExpenseEntry,
    addCustomExpenseCategory,
    deleteCustomExpenseCategory,
    addOverdueReceivable,
    deleteOverdueReceivable,
  };
}

// ─── Pure utilities ──────────────────────────────────────────────────────────

export function filterByPeriod<T extends { date: string }>(
  entries: T[],
  period: "ytd" | "quarter" | "month",
): T[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3);
  return entries.filter((e) => {
    const d = new Date(e.date);
    if (period === "ytd")     return d.getFullYear() === year;
    if (period === "month")   return d.getFullYear() === year && d.getMonth() === month;
    if (period === "quarter") return d.getFullYear() === year && Math.floor(d.getMonth() / 3) === quarter;
    return true;
  });
}

export function sumRupees<T extends { amountRupees: number }>(entries: T[]): number {
  return entries.reduce((s, e) => s + e.amountRupees, 0);
}
