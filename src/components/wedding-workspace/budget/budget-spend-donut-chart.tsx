import type { BudgetDonutSegment } from "@/components/wedding-workspace/budget/budget-dashboard-derived";
import { toInrCompact } from "@/components/wedding-workspace/budget/budget-format";
import type { CSSProperties } from "react";

type BudgetSpendDonutChartProps = {
  estimatedTotalPaise: number;
  donutStyle: CSSProperties;
  segments: BudgetDonutSegment[];
};

export function BudgetSpendDonutChart({ estimatedTotalPaise, donutStyle, segments }: BudgetSpendDonutChartProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-sm font-semibold">Spend Distribution</p>
      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="relative h-44 w-44 rounded-full p-4" style={donutStyle}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b0c0f] text-center">
            <div>
              <p className="text-2xl font-semibold">{toInrCompact(estimatedTotalPaise)}</p>
              <p className="text-[11px] text-zinc-500">Estimated</p>
            </div>
          </div>
        </div>
        <div className="w-full space-y-2 text-xs">
          {segments.map((segment) => (
            <div key={segment.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                <span>{segment.label}</span>
              </div>
              <span className="text-zinc-400">
                {segment.pct}% - {toInrCompact(segment.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
