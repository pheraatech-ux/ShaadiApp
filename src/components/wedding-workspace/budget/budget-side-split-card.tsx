import type { BudgetSideSplit } from "@/components/wedding-workspace/budget/budget-dashboard-derived";
import { toInrCompact } from "@/components/wedding-workspace/budget/budget-format";

type BudgetSideSplitCardProps = {
  sideSplit: BudgetSideSplit;
  marginPaise: number;
  healthTone: string;
  utilization: number;
};

export function BudgetSideSplitCard({ sideSplit, marginPaise, healthTone, utilization }: BudgetSideSplitCardProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-sm font-semibold">Side Budget Split</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">Who&apos;s paying what</p>
      <div className="mt-3 space-y-2 text-xs">
        <div>
          <div className="mb-1 flex justify-between text-zinc-300">
            <span>Bride&apos;s side</span>
            <span>{toInrCompact(sideSplit.brideAmount)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${sideSplit.bridePct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-zinc-300">
            <span>Groom&apos;s side</span>
            <span>{toInrCompact(sideSplit.groomAmount)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${sideSplit.groomPct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-zinc-800 pt-3">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Profit margin (internal)</p>
        <p className={`mt-1 text-2xl font-semibold ${healthTone}`}>{toInrCompact(marginPaise)}</p>
        <p className="text-[11px] text-zinc-500">{utilization}% budget utilization</p>
      </div>
    </article>
  );
}
