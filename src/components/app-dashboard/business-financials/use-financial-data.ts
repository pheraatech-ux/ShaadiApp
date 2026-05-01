"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  BusinessFinancialsData,
  CustomExpenseCategory,
  ExpenseEntry,
  OverdueReceivable,
  RevenueEntry,
} from "./types";

// ─── DB row shapes from the API responses ──────────────────────────────────

type DbRevenueRow = {
  id: string;
  category: string;
  amount_paise: number;
  entry_date: string;
  description: string;
};

type DbExpenseRow = {
  id: string;
  category_id: string;
  category_label: string;
  amount_paise: number;
  entry_date: string;
  description: string;
};

type DbCategoryRow = { id: string; label: string };

type DbReceivableRow = {
  id: string;
  client_name: string;
  amount_paise: number;
  due_since: string;
};

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapRevenue(r: DbRevenueRow): RevenueEntry {
  return {
    id: r.id,
    category: r.category as RevenueEntry["category"],
    amountRupees: r.amount_paise / 100,
    date: r.entry_date,
    description: r.description,
  };
}

function mapExpense(e: DbExpenseRow): ExpenseEntry {
  return {
    id: e.id,
    categoryId: e.category_id,
    categoryLabel: e.category_label,
    amountRupees: e.amount_paise / 100,
    date: e.entry_date,
    description: e.description,
  };
}

function mapCategory(c: DbCategoryRow): CustomExpenseCategory {
  return { id: c.id, label: c.label };
}

function mapReceivable(r: DbReceivableRow): OverdueReceivable {
  return {
    id: r.id,
    clientName: r.client_name,
    amountRupees: r.amount_paise / 100,
    dueSince: r.due_since,
  };
}

// ─── Fetch helpers ──────────────────────────────────────────────────────────

async function fetchAll(): Promise<BusinessFinancialsData> {
  const [revRes, expRes, catRes, recRes] = await Promise.all([
    fetch("/api/business/revenue"),
    fetch("/api/business/expenses"),
    fetch("/api/business/expense-categories"),
    fetch("/api/business/receivables"),
  ]);

  const [revRows, expRows, catRows, recRows] = (await Promise.all([
    revRes.json(),
    expRes.json(),
    catRes.json(),
    recRes.json(),
  ])) as [DbRevenueRow[], DbExpenseRow[], DbCategoryRow[], DbReceivableRow[]];

  return {
    revenueEntries: Array.isArray(revRows) ? revRows.map(mapRevenue) : [],
    expenseEntries: Array.isArray(expRows) ? expRows.map(mapExpense) : [],
    customExpenseCategories: Array.isArray(catRows) ? catRows.map(mapCategory) : [],
    overdueReceivables: Array.isArray(recRows) ? recRows.map(mapReceivable) : [],
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

const EMPTY: BusinessFinancialsData = {
  revenueEntries: [],
  expenseEntries: [],
  customExpenseCategories: [],
  overdueReceivables: [],
};

export function useFinancialData() {
  const [data, setData] = useState<BusinessFinancialsData>(EMPTY);
  const [ready, setReady] = useState(false);
  const fetchingRef = useRef(false);

  const refetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const result = await fetchAll();
      setData(result);
    } finally {
      fetchingRef.current = false;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // ── Revenue ──────────────────────────────────────────────────────────────

  const addRevenueEntry = useCallback(
    async (entry: Omit<RevenueEntry, "id">) => {
      await fetch("/api/business/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      void refetch();
    },
    [refetch],
  );

  const deleteRevenueEntry = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        revenueEntries: prev.revenueEntries.filter((e) => e.id !== id),
      }));
      await fetch(`/api/business/revenue/${id}`, { method: "DELETE" });
      void refetch();
    },
    [refetch],
  );

  // ── Expenses ─────────────────────────────────────────────────────────────

  const addExpenseEntry = useCallback(
    async (entry: Omit<ExpenseEntry, "id">) => {
      await fetch("/api/business/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      void refetch();
    },
    [refetch],
  );

  const deleteExpenseEntry = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        expenseEntries: prev.expenseEntries.filter((e) => e.id !== id),
      }));
      await fetch(`/api/business/expenses/${id}`, { method: "DELETE" });
      void refetch();
    },
    [refetch],
  );

  // ── Custom expense categories ─────────────────────────────────────────────

  const addCustomExpenseCategory = useCallback(
    async (label: string) => {
      await fetch("/api/business/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      void refetch();
    },
    [refetch],
  );

  const deleteCustomExpenseCategory = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        customExpenseCategories: prev.customExpenseCategories.filter((c) => c.id !== id),
        expenseEntries: prev.expenseEntries.filter((e) => e.categoryId !== id),
      }));
      await fetch(`/api/business/expense-categories/${id}`, { method: "DELETE" });
      void refetch();
    },
    [refetch],
  );

  // ── Overdue receivables ───────────────────────────────────────────────────

  const addOverdueReceivable = useCallback(
    async (entry: Omit<OverdueReceivable, "id">) => {
      await fetch("/api/business/receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      void refetch();
    },
    [refetch],
  );

  const deleteOverdueReceivable = useCallback(
    async (id: string) => {
      setData((prev) => ({
        ...prev,
        overdueReceivables: prev.overdueReceivables.filter((r) => r.id !== id),
      }));
      await fetch(`/api/business/receivables/${id}`, { method: "DELETE" });
      void refetch();
    },
    [refetch],
  );

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

// ─── Pure filter/sum utilities (unchanged by Supabase migration) ────────────

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
    if (period === "ytd") return d.getFullYear() === year;
    if (period === "month") return d.getFullYear() === year && d.getMonth() === month;
    if (period === "quarter") {
      const eq = Math.floor(d.getMonth() / 3);
      return d.getFullYear() === year && eq === quarter;
    }
    return true;
  });
}

export function sumRupees<T extends { amountRupees: number }>(entries: T[]): number {
  return entries.reduce((s, e) => s + e.amountRupees, 0);
}
