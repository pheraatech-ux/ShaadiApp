"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { REVENUE_CATEGORIES, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";

const INR = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  ytd: "Year to Date",
  quarter: "This Quarter",
  month: "This Month",
};

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

function AddRevenueDialog() {
  const { addRevenueEntry } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(REVENUE_CATEGORIES[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    void addRevenueEntry({ category, amountRupees: amt, date, description });
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <PlusIcon className="h-3.5 w-3.5" />
        Add Revenue
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Revenue Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {REVENUE_CATEGORIES.map((c) => (
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
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description (optional)</label>
            <Input
              placeholder="e.g. Sharma & Gupta wedding package"
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

function AddOverdueDialog() {
  const { addOverdueReceivable } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueSince, setDueSince] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = () => {
    if (!clientName.trim() || !amount || parseFloat(amount) <= 0) return;
    void addOverdueReceivable({ clientName: clientName.trim(), amountRupees: parseFloat(amount), dueSince });
    setClientName("");
    setAmount("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <PlusIcon className="h-3.5 w-3.5" />
        Add
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Overdue Receivable</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Client Name</label>
            <Input placeholder="e.g. Kapoor & Mehta" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount Owed (₹)</label>
            <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} min={0} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Due Since</label>
            <Input type="date" value={dueSince} onChange={(e) => setDueSince(e.target.value)} />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={!clientName.trim() || !amount || parseFloat(amount) <= 0}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OverviewTab({ totalWeddings }: { totalWeddings: number }) {
  const [period, setPeriod] = useState<PeriodFilter>("ytd");
  const { data, ready, deleteRevenueEntry, deleteOverdueReceivable } = useFinancialData();

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/40" />;
  }

  const revenueInPeriod = filterByPeriod(data.revenueEntries, period);
  const expensesInPeriod = filterByPeriod(data.expenseEntries, period);

  const totalRevenue = sumRupees(revenueInPeriod);
  const totalExpenses = sumRupees(expensesInPeriod);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
  const totalOverdue = sumRupees(data.overdueReceivables);

  const categoryTotals = REVENUE_CATEGORIES.map((cat) => ({
    ...cat,
    total: sumRupees(revenueInPeriod.filter((e) => e.category === cat.id)),
  }));

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Business Overview</h2>
          <p className="text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle value={period} onChange={setPeriod} />
          <AddRevenueDialog />
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{INR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
        </article>

        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Gross Margin</p>
          <div className="mt-1 flex items-center gap-1.5">
            <p className={`text-2xl font-semibold ${grossMargin >= 50 ? "text-green-600 dark:text-green-400" : grossMargin >= 25 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
              {grossMargin.toFixed(1)}%
            </p>
            {grossMargin >= 50 ? (
              <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Revenue minus ops spend</p>
        </article>

        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Ops Spend</p>
          <p className="mt-1 text-2xl font-semibold">{INR(totalExpenses)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{PERIOD_LABELS[period]}</p>
        </article>

        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Active Weddings</p>
          <p className="mt-1 text-2xl font-semibold">{totalWeddings}</p>
          <p className="mt-1 text-xs text-muted-foreground">Q{quarter} {year}</p>
        </article>

        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Overdue Receivables</p>
          <p className={`mt-1 text-2xl font-semibold ${totalOverdue > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
            {INR(totalOverdue)}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{data.overdueReceivables.length} client{data.overdueReceivables.length !== 1 ? "s" : ""}</p>
            <AddOverdueDialog />
          </div>
        </article>
      </section>

      {/* Overdue receivables detail */}
      {data.overdueReceivables.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
          <h3 className="mb-3 text-sm font-semibold text-red-800 dark:text-red-400">Overdue Receivables</h3>
          <div className="space-y-2">
            {data.overdueReceivables.map((r) => {
              const daysDue = Math.floor((Date.now() - new Date(r.dueSince).getTime()) / 86400000);
              return (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground">{daysDue}d overdue since {r.dueSince}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">{INR(r.amountRupees)}</p>
                    <button
                      onClick={() => { void deleteOverdueReceivable(r.id); }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Revenue by Category */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Revenue by Category</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categoryTotals.map((cat) => {
            const pct = totalRevenue > 0 ? (cat.total / totalRevenue) * 100 : 0;
            const entries = revenueInPeriod.filter((e) => e.category === cat.id);
            return (
              <div key={cat.id} className="rounded-xl border border-border/70 bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                    <p className="mt-1 text-xl font-semibold">{INR(cat.total)}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{entries.length} entr{entries.length !== 1 ? "ies" : "y"}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Revenue entries list */}
      {revenueInPeriod.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Revenue Entries — {PERIOD_LABELS[period]}</h3>
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-sm">
              <thead className="border-b border-border/70 bg-muted/40">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="w-10 px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {revenueInPeriod
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((e) => (
                    <tr key={e.id} className="bg-card hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        {REVENUE_CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.description || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.date}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-green-600 dark:text-green-400">
                        {INR(e.amountRupees)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => { void deleteRevenueEntry(e.id); }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data.revenueEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/70 py-12 text-center">
          <p className="text-sm text-muted-foreground">No revenue entries yet. Add your first one above.</p>
        </div>
      )}
    </div>
  );
}
