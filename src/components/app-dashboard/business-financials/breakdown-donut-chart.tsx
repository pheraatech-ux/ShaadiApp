"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

type SliceItem = {
  label: string;
  value: number;
  color: string;
};

type BreakdownDonutChartProps = {
  items: SliceItem[];
  total: number;
  centerLabel: string;
  title: string;
  icon?: LucideIcon;
  period?: string;
};

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type TooltipPayloadItem = {
  name: string;
  value: number;
  payload: { fill: string };
};

function SliceTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: { fill } } = payload[0];
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: fill }} />
      <span className="whitespace-nowrap text-xs font-medium text-foreground">{name}</span>
      <span className="text-xs font-bold">{INR(value)}</span>
    </div>
  );
}

export function BreakdownDonutChart({
  items,
  total,
  centerLabel,
  title,
  icon: Icon,
  period = "YTD",
}: BreakdownDonutChartProps) {
  const chartData = items.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color,
  }));

  const chartConfig = {
    value: { label: centerLabel },
    ...Object.fromEntries(
      items.map((item) => [item.label, { label: item.label, color: item.color }])
    ),
  } satisfies ChartConfig;

  return (
    <article className="min-w-0 rounded-xl border border-border/70 bg-card p-4">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {period}
        </span>
      </div>
      <hr className="my-3 border-border/70" />

      {total === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-xs text-muted-foreground">No data for this period</p>
        </div>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Donut */}
          <div className="h-[200px] w-[200px] shrink-0 self-start">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  isAnimationActive={false}
                  content={<SliceTooltip />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={items[i].color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-lg font-bold"
                            >
                              {INR(total)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 20}
                              className="fill-muted-foreground text-[10px]"
                            >
                              {centerLabel}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Vertical separator */}
          <div className="mx-4 hidden w-px shrink-0 self-stretch bg-border/70 sm:block" />

          {/* Legend */}
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 sm:gap-x-4">
            {items.map((item, i) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <React.Fragment key={i}>
                  <div className="flex min-w-0 items-center gap-2 py-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="truncate text-xs text-muted-foreground" title={item.label}>
                      {item.label}
                    </p>
                  </div>
                  <p className="shrink-0 py-1.5 text-right text-[11px] text-muted-foreground tabular-nums">
                    {pct}%
                  </p>
                  <p className="shrink-0 py-1.5 text-right text-xs font-semibold tabular-nums">
                    {INR(item.value)}
                  </p>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
