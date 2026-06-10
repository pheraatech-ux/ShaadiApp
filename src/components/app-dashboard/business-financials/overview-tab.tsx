"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { PERIOD_SHORT_LABELS, REVENUE_CATEGORIES, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";
import { FinancialKpiCard } from "./financial-kpi-card";
import { IncomeBreakdownPanel } from "./income-breakdown-panel";
import { TopExpensesPanel } from "./top-expenses-panel";

const INR = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

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

export function OverviewTab({
  totalWeddings,
  period,
}: {
  totalWeddings: number;
  period: PeriodFilter;
}) {
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

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <FinancialKpiCard
          label="Total Revenue"
          value={INR(totalRevenue)}
          sub={PERIOD_SHORT_LABELS[period]}
          valueClassName="text-green-600 dark:text-green-400"
        />

        <FinancialKpiCard
          label="Gross Margin"
          value={
            <span className="flex items-center gap-1.5">
              <span
                className={
                  grossMargin >= 50
                    ? "text-green-600 dark:text-green-400"
                    : grossMargin >= 25
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                }
              >
                {grossMargin.toFixed(1)}%
              </span>
              {grossMargin >= 50 ? (
                <TrendingUpIcon className="size-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDownIcon className="size-4 text-red-600 dark:text-red-400" />
              )}
            </span>
          }
          sub="Revenue minus ops spend"
        />

        <FinancialKpiCard
          label="Ops Spend"
          value={INR(totalExpenses)}
          sub={PERIOD_SHORT_LABELS[period]}
        />

        <FinancialKpiCard
          label="Active Weddings"
          value={totalWeddings}
          sub={`Q${quarter} ${year}`}
        />

        <FinancialKpiCard
          className="relative"
          label="Overdue Receivables"
          value={INR(totalOverdue)}
          sub={`${data.overdueReceivables.length} client${data.overdueReceivables.length !== 1 ? "s" : ""}`}
          valueClassName={totalOverdue > 0 ? "text-red-600 dark:text-red-400" : undefined}
          headerAction={<AddOverdueDialog />}
        />
      </section>

      {/* Donut charts row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <IncomeBreakdownPanel period={period} />
        <TopExpensesPanel period={period} />
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


      {/* Revenue entries list */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Revenue Entries — {PERIOD_SHORT_LABELS[period]}</h3>
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
              {revenueInPeriod.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No revenue entries yet. Add your first one above.
                  </td>
                </tr>
              ) : (
                revenueInPeriod
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
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
