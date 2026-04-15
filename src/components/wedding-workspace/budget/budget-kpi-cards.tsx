import { clamp, toInrCompact, toPct } from "@/components/wedding-workspace/budget/budget-format";

type BudgetKpiCardsProps = {
  totalBudgetPaise: number;
  estimatedTotalPaise: number;
  advancePaidPaise: number;
  balanceDuePaise: number;
  allocatedCoverage: number;
  overrunPaise: number;
};

export function BudgetKpiCards({
  totalBudgetPaise,
  estimatedTotalPaise,
  advancePaidPaise,
  balanceDuePaise,
  allocatedCoverage,
  overrunPaise,
}: BudgetKpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Total budget</p>
        <p className="mt-1 text-3xl font-semibold">{toInrCompact(totalBudgetPaise)}</p>
        <p className="mt-1 text-xs text-zinc-400">Client approved</p>
        <div className="mt-3 h-1 rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${allocatedCoverage}%` }} />
        </div>
      </article>

      <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Estimated total</p>
        <p className="mt-1 text-3xl font-semibold text-rose-300">{toInrCompact(estimatedTotalPaise)}</p>
        <p className="mt-1 text-xs text-zinc-400">{overrunPaise > 0 ? `${toInrCompact(overrunPaise)} over budget` : "On track"}</p>
        <div className="mt-3 h-1 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-rose-500"
            style={{ width: `${clamp(toPct(estimatedTotalPaise, totalBudgetPaise), 12, 100)}%` }}
          />
        </div>
      </article>

      <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Advance paid</p>
        <p className="mt-1 text-3xl font-semibold text-amber-300">{toInrCompact(advancePaidPaise)}</p>
        <p className="mt-1 text-xs text-zinc-400">Across top vendors</p>
        <div className="mt-3 h-1 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${clamp(toPct(advancePaidPaise, estimatedTotalPaise), 8, 100)}%` }}
          />
        </div>
      </article>

      <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
        <p className="text-[11px] uppercase tracking-wide text-zinc-400">Balance due</p>
        <p className="mt-1 text-3xl font-semibold text-sky-300">{toInrCompact(balanceDuePaise)}</p>
        <p className="mt-1 text-xs text-zinc-400">Before wedding day</p>
        <div className="mt-3 h-1 rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-sky-500"
            style={{ width: `${clamp(toPct(balanceDuePaise, estimatedTotalPaise), 8, 100)}%` }}
          />
        </div>
      </article>
    </section>
  );
}
