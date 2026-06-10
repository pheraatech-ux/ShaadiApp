"use client";

import { ArrowRightIcon, Receipt, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

import { FinancialKpiCard } from "./financial-kpi-card";
import { DEFAULT_EXPENSE_CATEGORIES, getPeriodDisplayLabel, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function OpsExpensesTab({
  period,
  onShowAllEntries,
}: {
  period: PeriodFilter;
  onShowAllEntries: () => void;
}) {
  const { data, ready, deleteCustomExpenseCategory } = useFinancialData();

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/40" />;
  }

  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...data.customExpenseCategories,
  ];

  const expensesInPeriod = filterByPeriod(data.expenseEntries, period);
  const totalExpenses = sumRupees(expensesInPeriod);

  const categoryBreakdown = allCategories.map((cat) => {
    const entries = expensesInPeriod.filter((e) => e.categoryId === cat.id);
    return {
      ...cat,
      total: sumRupees(entries),
      count: entries.length,
      isCustom: !DEFAULT_EXPENSE_CATEGORIES.find((d) => d.id === cat.id),
    };
  });

  const recentEntries = data.expenseEntries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const periodLabel = getPeriodDisplayLabel(period);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <FinancialKpiCard
        label="Total Ops Spend"
        value={INR(totalExpenses)}
        sub={
          <>
            {periodLabel}
            {" · "}
            {expensesInPeriod.length} entr{expensesInPeriod.length !== 1 ? "ies" : "y"} in period
            {data.expenseEntries.length !== expensesInPeriod.length
              ? ` · ${data.expenseEntries.length} total`
              : ""}
          </>
        }
      />

      {/* Two-column: By Category + Recent Entries */}
      <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        {/* Left — By Category */}
        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">By Category</h3>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {periodLabel}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border/70 bg-muted/20">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Share</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70 bg-card">
              {categoryBreakdown.map((cat) => {
                const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                return (
                  <tr key={cat.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium leading-none">
                          {cat.label}
                          {cat.isCustom && (
                            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                              custom
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cat.count} {cat.count === 1 ? "entry" : "entries"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{INR(cat.total)}</td>
                    <td className="px-2 py-3 text-center">
                      {cat.isCustom && (
                        <button
                          onClick={() => { void deleteCustomExpenseCategory(cat.id); }}
                          className="text-muted-foreground hover:text-destructive"
                          title="Delete category and all its entries"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-border/70 bg-muted/40">
              <tr>
                <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold">Total</td>
                <td className="px-4 py-2.5 text-right text-sm font-semibold">{INR(totalExpenses)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Right — Recent Entries */}
        <section
          className={cn(
            "relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
            "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
            recentEntries.length === 0 && "min-h-[320px] xl:min-h-0",
          )}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

          <div className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-md bg-amber-500/15">
                <Receipt className="size-3 text-amber-600 dark:text-amber-500" aria-hidden />
              </div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">Recent Entries</h3>
            </div>
            <button
              onClick={onShowAllEntries}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/60"
            >
              Show All Entries
              <ArrowRightIcon className="h-3 w-3" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-amber-400/40 bg-amber-500/10">
                  <Receipt className="size-4 text-amber-600 dark:text-amber-500" aria-hidden />
                </span>
                <p className="text-sm font-medium text-foreground">No expense entries yet</p>
                <p className="text-xs text-muted-foreground">Add your first expense entry to get started.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="border-b border-border/70 px-4 py-2 text-xs text-muted-foreground">Last 6 across all time</p>
              <ul className="divide-y divide-border/70 bg-card">
                {recentEntries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.categoryLabel}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.description || "No description"} · {e.date}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{INR(e.amountRupees)}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
