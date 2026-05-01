"use client";

import { useState } from "react";
import { ArrowRightIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { DEFAULT_EXPENSE_CATEGORIES, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function getPeriodLabels(): Record<PeriodFilter, string> {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  const monthName = now.toLocaleString("en-IN", { month: "long" });
  return {
    ytd: `${year} Year to Date`,
    quarter: `This Quarter Q${quarter}`,
    month: `This Month (${monthName})`,
  };
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodFilter;
  onChange: (v: PeriodFilter) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1">
      {(["ytd", "quarter", "month"] as PeriodFilter[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            value === p
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p === "ytd" ? "YTD" : p === "quarter" ? "Quarter" : "Month"}
        </button>
      ))}
    </div>
  );
}

function AddExpenseDialog({
  allCategories,
}: {
  allCategories: { id: string; label: string }[];
}) {
  const { addExpenseEntry } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(DEFAULT_EXPENSE_CATEGORIES[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const cat = allCategories.find((c) => c.id === categoryId);
    void addExpenseEntry({
      categoryId,
      categoryLabel: cat?.label ?? categoryId,
      amountRupees: amt,
      date,
      description,
    });
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon className="h-3.5 w-3.5" />
        Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (₹)</label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Description (optional)
            </label>
            <Input
              placeholder="e.g. Riya — May salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0}>
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog() {
  const { addCustomExpenseCategory } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const handleSubmit = () => {
    if (!label.trim()) return;
    void addCustomExpenseCategory(label);
    setLabel("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <PlusIcon className="h-3.5 w-3.5" />
        New Category
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Expense Category</DialogTitle>
        </DialogHeader>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Category Name</label>
          <Input
            placeholder="e.g. Equipment Rental"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OpsExpensesTab({ onShowAllEntries }: { onShowAllEntries: () => void }) {
  const [period, setPeriod] = useState<PeriodFilter>("ytd");
  const { data, ready, deleteCustomExpenseCategory } = useFinancialData();

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/40" />;
  }

  const PERIOD_LABELS = getPeriodLabels();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Operations Expenses</h2>
          <p className="text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle value={period} onChange={setPeriod} />
          <AddCategoryDialog />
          <AddExpenseDialog allCategories={allCategories} />
        </div>
      </div>

      {/* Summary */}
      <article className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-xs text-muted-foreground">Total Ops Spend — {PERIOD_LABELS[period]}</p>
        <p className="mt-1 text-3xl font-semibold">{INR(totalExpenses)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {expensesInPeriod.length} entr{expensesInPeriod.length !== 1 ? "ies" : "y"} in period
          {data.expenseEntries.length !== expensesInPeriod.length
            ? ` · ${data.expenseEntries.length} total`
            : ""}
        </p>
      </article>

      {/* Two-column: By Category + Recent Entries */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Left — By Category */}
        <section className="overflow-hidden rounded-xl border border-border/70">
          <div className="border-b border-border/70 bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold">By Category</h3>
            <p className="text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
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
        <section className="overflow-hidden rounded-xl border border-border/70">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Recent Entries</h3>
              <p className="text-xs text-muted-foreground">Last 6 across all time</p>
            </div>
            <button
              onClick={onShowAllEntries}
              className="flex items-center gap-1 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/60"
            >
              Show All Entries
              <ArrowRightIcon className="h-3 w-3" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="flex items-center justify-center py-12 bg-card">
              <p className="text-sm text-muted-foreground">No entries yet.</p>
            </div>
          ) : (
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
          )}
        </section>
      </div>

      {data.expenseEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/70 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No expense entries yet. Add your first one above.
          </p>
        </div>
      )}
    </div>
  );
}
