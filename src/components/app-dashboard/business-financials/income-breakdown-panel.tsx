"use client";

import { TrendingUp } from "lucide-react";

import { REVENUE_CATEGORIES, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";
import { BreakdownDonutChart } from "./breakdown-donut-chart";

const INCOME_COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669"];

const PERIOD_LABEL: Record<PeriodFilter, string> = {
  ytd: "YTD",
  quarter: "Quarter",
  month: "Month",
};

type Props = { period: PeriodFilter };

export function IncomeBreakdownPanel({ period }: Props) {
  const { data, ready } = useFinancialData();

  if (!ready) {
    return <div className="h-52 animate-pulse rounded-xl bg-muted/40" />;
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
      period={PERIOD_LABEL[period]}
    />
  );
}
