import type { CSSProperties } from "react";

import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";

import { clamp, toPct } from "@/components/wedding-workspace/budget/budget-format";

const SEGMENT_COLORS = ["#16a34a", "#f97316", "#ef4444", "#3b82f6", "#eab308", "#14b8a6", "#8b5cf6", "#64748b"];

export type BudgetDonutSegment = {
  id: string;
  label: string;
  color: string;
  pct: number;
  amount: number;
  start: number;
  end: number;
};

export type BudgetVsActualBarRow = {
  id: string;
  label: string;
  recHeight: number;
  actualHeight: number;
  overrunHeight: number;
};

export type BudgetPaymentRow = {
  id: string;
  label: string;
  amount: number;
  dueLabel: string;
};

export type BudgetSideSplit = {
  bridePct: number;
  groomPct: number;
  brideAmount: number;
  groomAmount: number;
};

export type BudgetDashboardDerived = {
  utilization: number;
  allocatedCoverage: number;
  overrunPaise: number;
  estimatedTotalPaise: number;
  advancePaidPaise: number;
  balanceDuePaise: number;
  marginPaise: number;
  healthTone: string;
  topVarianceBucketLabel: string | undefined;
  donutSegments: BudgetDonutSegment[];
  donutStyle: CSSProperties;
  topBars: BudgetVsActualBarRow[];
  paymentRows: BudgetPaymentRow[];
  sideSplit: BudgetSideSplit;
};

/** Pure metrics + chart row builders for the super-admin budget workspace. */
export function computeBudgetDashboardDerived(view: WeddingBudgetWorkspaceViewModel): BudgetDashboardDerived {
  const utilization = toPct(view.spentBudgetPaise, view.totalBudgetPaise);
  const allocatedCoverage = toPct(view.allocatedBudgetPaise, view.totalBudgetPaise);
  const overrunPaise = Math.max(0, view.spentBudgetPaise - view.totalBudgetPaise);
  const estimatedTotalPaise = Math.max(
    view.totalBudgetPaise,
    view.allocatedBudgetPaise,
    Math.round(view.spentBudgetPaise * (utilization >= 55 ? 1.14 : 1.05)),
  );
  const advancePaidPaise = Math.round(Math.min(view.spentBudgetPaise, estimatedTotalPaise * 0.18));
  const balanceDuePaise = Math.max(0, estimatedTotalPaise - advancePaidPaise);
  const marginPaise = Math.max(0, view.totalBudgetPaise - view.allocatedBudgetPaise);
  const healthTone = overrunPaise > 0 ? "text-rose-400" : utilization >= 80 ? "text-amber-400" : "text-emerald-400";

  const topVarianceBucket = [...view.buckets].sort(
    (a, b) => Math.abs(b.spentPaise - b.recommendedPaise) - Math.abs(a.spentPaise - a.recommendedPaise),
  )[0];

  const totalForDonut = Math.max(
    1,
    view.buckets.reduce((sum, bucket) => sum + Math.max(bucket.allocatedPaise, bucket.spentPaise), 0),
  );
  let cursor = 0;
  const donutSegments: BudgetDonutSegment[] = view.buckets.map((bucket, index) => {
    const value = Math.max(bucket.allocatedPaise, bucket.spentPaise);
    const pct = (value / totalForDonut) * 100;
    const start = cursor;
    cursor += pct;
    return {
      id: bucket.id,
      label: bucket.label,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      pct: Math.round(pct),
      amount: value,
      start,
      end: cursor,
    };
  });

  const donutStops = donutSegments.map(
    (segment) => `${segment.color} ${segment.start.toFixed(2)}% ${segment.end.toFixed(2)}%`,
  );
  const donutStyle: CSSProperties = { background: `conic-gradient(${donutStops.join(", ")})` };

  const rows = [...view.buckets]
    .sort((a, b) => Math.max(b.recommendedPaise, b.spentPaise) - Math.max(a.recommendedPaise, a.spentPaise))
    .slice(0, 5);
  const maxValue = Math.max(1, ...rows.map((row) => Math.max(row.recommendedPaise, row.spentPaise)));
  const topBars: BudgetVsActualBarRow[] = rows.map((row) => ({
    id: row.id,
    label: row.label,
    recHeight: clamp(Math.round((row.recommendedPaise / maxValue) * 100), 8, 100),
    actualHeight: clamp(Math.round((row.spentPaise / maxValue) * 100), 8, 100),
    overrunHeight:
      row.spentPaise > row.recommendedPaise
        ? clamp(Math.round(((row.spentPaise - row.recommendedPaise) / maxValue) * 100), 3, 100)
        : 0,
  }));

  const tags = ["Advance", "Advance", "2nd", "Balance", "Balance"];
  const topItems = [...view.budgetItems].sort((a, b) => b.allocatedPaise - a.allocatedPaise).slice(0, 5);
  const paymentRows: BudgetPaymentRow[] = topItems.map((item, index) => {
    const target =
      index === 0 ? Math.round(item.allocatedPaise * 0.4) : index === 1 ? Math.round(item.allocatedPaise * 0.3) : item.allocatedPaise;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + index * 14 + 2);
    return {
      id: item.id,
      label: `${item.category} - ${tags[index] ?? "Stage"}`,
      amount: target,
      dueLabel: dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
  });

  const outfits = view.buckets.find((bucket) => bucket.id === "outfits")?.allocatedPaise ?? 0;
  const decor = view.buckets.find((bucket) => bucket.id === "decor")?.allocatedPaise ?? 0;
  const photo = view.buckets.find((bucket) => bucket.id === "photo")?.allocatedPaise ?? 0;
  const signalBase = toPct(outfits + decor + photo, Math.max(1, view.allocatedBudgetPaise));
  const bridePct = clamp(signalBase + 10, 40, 62);
  const groomPct = 100 - bridePct;
  const sideSplit: BudgetSideSplit = {
    bridePct,
    groomPct,
    brideAmount: Math.round((estimatedTotalPaise * bridePct) / 100),
    groomAmount: Math.round((estimatedTotalPaise * groomPct) / 100),
  };

  return {
    utilization,
    allocatedCoverage,
    overrunPaise,
    estimatedTotalPaise,
    advancePaidPaise,
    balanceDuePaise,
    marginPaise,
    healthTone,
    topVarianceBucketLabel: topVarianceBucket?.label,
    donutSegments,
    donutStyle,
    topBars,
    paymentRows,
    sideSplit,
  };
}
