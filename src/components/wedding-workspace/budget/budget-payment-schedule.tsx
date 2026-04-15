import type { BudgetPaymentRow } from "@/components/wedding-workspace/budget/budget-dashboard-derived";
import { toInrCompact } from "@/components/wedding-workspace/budget/budget-format";

type BudgetPaymentScheduleProps = {
  rows: BudgetPaymentRow[];
};

function dotClass(index: number) {
  if (index === 0) return "bg-emerald-400";
  if (index === 1) return "bg-cyan-400";
  if (index === 2) return "bg-amber-400";
  if (index === 3) return "bg-rose-400";
  return "bg-violet-400";
}

export function BudgetPaymentSchedule({ rows }: BudgetPaymentScheduleProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Payment Schedule</p>
        <span className="text-xs text-emerald-400">Add payment</span>
      </div>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-xs text-zinc-400">No payment milestones yet.</p>
        ) : (
          rows.map((row, index) => (
            <div key={row.id} className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 p-2">
              <div className="flex min-w-0 items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass(index)}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-100">{row.label}</p>
                  <p className="text-[11px] text-zinc-500">Due {row.dueLabel}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-zinc-200">{toInrCompact(row.amount)}</p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
