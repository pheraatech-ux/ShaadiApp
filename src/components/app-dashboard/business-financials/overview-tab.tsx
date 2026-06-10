"use client";

import { useState } from "react";
import { PlusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { getPeriodDisplayLabel, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";
import { AddRevenueDialog } from "./add-revenue-dialog";
import { FinancialKpiCard } from "./financial-kpi-card";
import { IncomeBreakdownPanel } from "./income-breakdown-panel";
import { OverdueReceivablesPanel } from "./overdue-receivables-panel";
import { RevenueEntriesPanel } from "./revenue-entries-panel";
import { TopExpensesPanel } from "./top-expenses-panel";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

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
  const periodLabel = getPeriodDisplayLabel(period);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <FinancialKpiCard
          centered
          label="Total Revenue"
          value={INR(totalRevenue)}
          sub={periodLabel}
          valueClassName="text-green-600 dark:text-green-400"
        />

        <FinancialKpiCard
          centered
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
          centered
          label="Ops Spend"
          value={INR(totalExpenses)}
          sub={periodLabel}
        />

        <FinancialKpiCard
          centered
          label="Active Weddings"
          value={totalWeddings}
          sub={`Q${quarter} ${year}`}
        />

        <FinancialKpiCard
          centered
          label="Overdue Receivables"
          value={INR(totalOverdue)}
          sub={`${data.overdueReceivables.length} client${data.overdueReceivables.length !== 1 ? "s" : ""}`}
          valueClassName={totalOverdue > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
      </section>

      {/* Donut charts row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <IncomeBreakdownPanel period={period} />
        <TopExpensesPanel period={period} />
      </section>

      {/* Overdue receivables + revenue entries */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="h-[340px]">
          <OverdueReceivablesPanel
            items={data.overdueReceivables}
            onDelete={(id) => { void deleteOverdueReceivable(id); }}
            headerAction={<AddOverdueDialog />}
          />
        </div>
        <div className="h-[340px]">
          <RevenueEntriesPanel
            entries={revenueInPeriod}
            period={period}
            onDelete={(id) => { void deleteRevenueEntry(id); }}
            headerAction={<AddRevenueDialog compact />}
          />
        </div>
      </section>
    </div>
  );
}
