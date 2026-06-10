"use client";

import { TrendingUp } from "lucide-react";

import { REVENUE_CATEGORIES, getPeriodDisplayLabel, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";
import { BreakdownDonutChart } from "./breakdown-donut-chart";

const INCOME_COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669"];

type Props = { period: PeriodFilter };

export function IncomeBreakdownPanel({ period }: Props) {
  const { data, ready } = useFinancialData();

  if (!ready) {
    return <div className="h-52 animate-pulse rounded-2xl border border-border/70 bg-muted/40" />;
  }

  const revenueInPeriod = filterByPeriod(data.revenueEntries, period);
  const totalRevenue = sumRupees(revenueInPeriod);

  const items = REVENUE_CATEGORIES.map((cat, i) => ({
    label: cat.label,
    value: sumRupees(revenueInPeriod.filter((e) => e.category === cat.id)),
    color: INCOME_COLORS[i % INCOME_COLORS.length],
  })).filter((item) => item.value > 0);

  return (
    <BreakdownDonutChart
      items={items}
      total={totalRevenue}
      centerLabel="Total Revenue"
      title="Income Breakdown"
      icon={TrendingUp}
      period={getPeriodDisplayLabel(period)}
      emptyTitle="No revenue yet"
      emptyDescription="Add revenue entries for this period to see your income breakdown."
      iconBoxClassName="bg-emerald-500/15"
      iconClassName="text-emerald-500"
      emptyIconBoxClassName="border-emerald-400/40 bg-emerald-500/10"
      countBadgeClassName="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
    />
  );
}
