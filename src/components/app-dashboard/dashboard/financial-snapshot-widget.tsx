"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { FinancialSnapshot } from "@/components/app-dashboard/dashboard/types";

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

type Props = { snapshot: FinancialSnapshot };

export function FinancialSnapshotWidget({ snapshot }: Props) {
  const { totalBudgetPaise, totalSpendPaise, committedPaise, utilizationPct } = snapshot;
  const data = buildChartData(totalBudgetPaise, totalSpendPaise);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Header — min-h matches other panel headers */}
      <div className="flex min-h-[41px] shrink-0 items-center gap-2 border-b border-border/70 px-4 sm:px-5">
        <TrendingUp className="size-3.5 text-emerald-400" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Financial Snapshot</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 pb-2 sm:px-5">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Total Budget</p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{toLakh(totalBudgetPaise)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Total Spend</p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{toLakh(totalSpendPaise)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Committed</p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{toLakh(committedPaise)}</p>
          </div>
        </div>

        {/* Utilization */}
        <div className="mt-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Budget Utilization</p>
          <div className="mt-0.5 flex items-center gap-3">
            <p className="shrink-0 text-xl font-bold text-foreground">{utilizationPct}%</p>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <TrendingUp className="size-3" aria-hidden />
                <span>vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-3 rounded-full bg-blue-500" />
              <span className="text-[10px] text-muted-foreground">Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-3 rounded-full bg-violet-500" />
              <span className="text-[10px] text-muted-foreground">Spend</span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-full min-h-[100px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fsGradBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fsGradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
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
