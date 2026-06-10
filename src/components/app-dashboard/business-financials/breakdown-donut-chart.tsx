"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { formatInrCompact } from "./format-inr";

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
  emptyTitle?: string;
  emptyDescription?: string;
  iconBoxClassName?: string;
  iconClassName?: string;
  emptyIconBoxClassName?: string;
  countBadgeClassName?: string;
};

const INR = formatInrCompact;

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
  emptyTitle = "No data for this period",
  emptyDescription = "Entries for the selected period will appear here.",
  iconBoxClassName = "bg-muted/60",
  iconClassName = "text-muted-foreground",
  emptyIconBoxClassName = "border-border/70 bg-muted/40",
  countBadgeClassName = "bg-muted text-muted-foreground",
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
    <div
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <div className={cn("flex size-5 shrink-0 items-center justify-center rounded-md", iconBoxClassName)}>
              <Icon className={cn("size-3", iconClassName)} aria-hidden />
            </div>
          ) : null}
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{title}</p>
          {items.length > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                countBadgeClassName,
              )}
            >
              {items.length}
            </span>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {period}
        </span>
      </div>

      {total === 0 ? (
        <div className="px-3 py-3">
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
            {Icon ? (
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border border-dashed",
                  emptyIconBoxClassName,
                )}
              >
                <Icon className={cn("size-4", iconClassName)} aria-hidden />
              </span>
            ) : null}
            <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
            <p className="max-w-[240px] text-xs text-muted-foreground">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-4 px-3 py-3 sm:flex-row sm:items-center">
          <div className="mx-auto h-[200px] w-[200px] shrink-0 sm:mx-0">
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

          <div className="mx-2 hidden w-px shrink-0 self-stretch bg-border/70 sm:block" />

          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 sm:gap-x-6">
            {items.map((item, i) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <React.Fragment key={i}>
                  <div className="flex min-w-0 items-center gap-2 py-1.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="truncate text-sm text-muted-foreground" title={item.label}>
                      {item.label}
                    </p>
                  </div>
                  <p className="shrink-0 py-1.5 pr-4 text-right text-[11px] text-muted-foreground tabular-nums sm:pr-5">
                    {pct}%
                  </p>
                  <p className="shrink-0 py-1.5 pl-1 text-right text-xs font-semibold tabular-nums sm:pl-2">
                    {INR(item.value)}
                  </p>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
