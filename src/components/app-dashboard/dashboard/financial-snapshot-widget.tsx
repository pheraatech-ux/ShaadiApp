"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { FinancialSnapshot } from "@/components/app-dashboard/dashboard/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toLakh(paise: number) {
  const val = paise / 10_000_000;
  return `₹${val % 1 === 0 ? val : parseFloat(val.toFixed(1))}L`;
}

const chartConfig = {
  budget: { label: "Budget", color: "#3b82f6" },
  spend:  { label: "Spend",  color: "#8b5cf6" },
} satisfies ChartConfig;

function getLast6Months(): string[] {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return months[d.getMonth()];
  });
}

function buildChartData(totalBudgetPaise: number, totalSpendPaise: number) {
  const labels = getLast6Months();
  const ramp = [0.1, 0.25, 0.42, 0.58, 0.76, 1.0];
  return labels.map((month, i) => ({
    month,
    budget: totalBudgetPaise,
    spend: Math.round(totalSpendPaise * ramp[i]),
  }));
}

type KpiPillProps = { label: string; value: string; accent?: string };
function KpiPill({ label, value, accent = "bg-muted/60" }: KpiPillProps) {
  return (
    <div className={cn("rounded-xl border border-border/60 px-3 py-2.5", accent)}>
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
    </div>
  );
}

type Props = { snapshot: FinancialSnapshot; basePath?: string };

export function FinancialSnapshotWidget({ snapshot, basePath = "/app" }: Props) {
  const { totalBudgetPaise, totalSpendPaise, committedPaise, utilizationPct } = snapshot;
  const data = buildChartData(totalBudgetPaise, totalSpendPaise);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
      )}
    >
      {/* Top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-emerald-500/15">
            <TrendingUp className="size-3 text-emerald-500" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Financial Snapshot</p>
        </div>
        <Link
          href={`${basePath}/budget`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs text-muted-foreground hover:text-foreground")}
        >
          View financials
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 pb-2 sm:px-5">
        {/* KPI pills */}
        <div className="grid grid-cols-3 gap-2">
          <KpiPill label="Total Budget" value={toLakh(totalBudgetPaise)} accent="bg-blue-500/8 dark:bg-blue-500/12" />
          <KpiPill label="Total Spend" value={toLakh(totalSpendPaise)} accent="bg-violet-500/8 dark:bg-violet-500/12" />
          <KpiPill label="Committed" value={toLakh(committedPaise)} accent="bg-muted/60" />
        </div>

        {/* Utilization bar */}
        <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
              Budget Utilization
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400">
              <TrendingUp className="size-2.5" aria-hidden />
              <span>vs last month</span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <p className="shrink-0 text-xl font-bold tabular-nums tracking-tight text-foreground">
              {utilizationPct}%
            </p>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 rounded-full bg-blue-500" />
              <span className="text-[10px] font-medium text-muted-foreground/70">Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-4 rounded-full bg-violet-500" />
              <span className="text-[10px] font-medium text-muted-foreground/70">Spend</span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-full min-h-[100px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fsGradBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fsGradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9 }}
                tickMargin={4}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9 }}
                tickFormatter={(v) => toLakh(v)}
                width={34}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => toLakh(Number(value))}
                    indicator="line"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#3b82f6"
                strokeWidth={1.5}
                fill="url(#fsGradBudget)"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                fill="url(#fsGradSpend)"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
