"use client";

import { Receipt } from "lucide-react";

import { type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";
import { BreakdownDonutChart } from "./breakdown-donut-chart";

const EXPENSE_COLORS = ["#4f46e5", "#f59e0b", "#10b981", "#3b82f6", "#9ca3af"];

const PERIOD_LABEL: Record<PeriodFilter, string> = {
  ytd: "YTD",
  quarter: "Quarter",
  month: "Month",
};

type Props = { period: PeriodFilter };

export function TopExpensesPanel({ period }: Props) {
  const { data, ready } = useFinancialData();

  if (!ready) {
    return <div className="h-52 animate-pulse rounded-xl bg-muted/40" />;
  }

  const expensesInPeriod = filterByPeriod(data.expenseEntries, period);
  const totalExpenses = sumRupees(expensesInPeriod);

  // Aggregate by category
  const categoryMap = new Map<string, { label: string; value: number }>();
  for (const e of expensesInPeriod) {
    const existing = categoryMap.get(e.categoryId);
    if (existing) {
      existing.value += e.amountRupees;
    } else {
      categoryMap.set(e.categoryId, { label: e.categoryLabel, value: e.amountRupees });
    }
  }

  // Top 4 categories; remainder grouped as "Other"
  const sorted = [...categoryMap.values()].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 4);
  const otherTotal = sorted.slice(4).reduce((s, c) => s + c.value, 0);
  if (otherTotal > 0) top.push({ label: "Other", value: otherTotal });

  const items = top.map((item, i) => ({
    ...item,
    color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
  }));

  return (
    <BreakdownDonutChart
      items={items}
      total={totalExpenses}
      centerLabel="Total Expenses"
      title="Top Expenses"
      icon={Receipt}
      period={PERIOD_LABEL[period]}
    />
  );
}
