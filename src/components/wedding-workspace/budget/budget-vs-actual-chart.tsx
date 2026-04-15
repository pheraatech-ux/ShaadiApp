import type { BudgetVsActualBarRow } from "@/components/wedding-workspace/budget/budget-dashboard-derived";

type BudgetVsActualChartProps = {
  bars: BudgetVsActualBarRow[];
};

export function BudgetVsActualChart({ bars }: BudgetVsActualChartProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-sm font-semibold">Budget vs Actual</p>
      <div className="mt-4 grid h-44 grid-cols-5 items-end gap-3">
        {bars.map((bar, index) => (
          <div key={bar.id} className="space-y-2">
            <div className="mx-auto flex h-32 items-end justify-center gap-1">
              <div className="w-2 rounded-sm bg-emerald-500/80" style={{ height: `${bar.recHeight}%` }} />
              <div className="w-2 rounded-sm bg-rose-500/80" style={{ height: `${bar.actualHeight}%` }} />
              <div className="w-2 rounded-sm bg-amber-500/80" style={{ height: `${bar.overrunHeight}%` }} />
            </div>
            <p className="truncate text-center text-[11px] text-zinc-400">{bar.label.split(" ")[0]}</p>
            <p className="text-center text-[10px] text-zinc-500">#{index + 1}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Allocated
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          Actual
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Over
        </span>
      </div>
    </article>
  );
}
