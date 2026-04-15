import { toInrCompact } from "@/components/wedding-workspace/budget/budget-format";

type BudgetAlertBannerProps = {
  overrunPaise: number;
  estimatedTotalPaise: number;
  totalBudgetPaise: number;
  utilization: number;
  allocatedCoverage: number;
  topVarianceBucketLabel: string | undefined;
};

export function BudgetAlertBanner({
  overrunPaise,
  estimatedTotalPaise,
  totalBudgetPaise,
  utilization,
  allocatedCoverage,
  topVarianceBucketLabel,
}: BudgetAlertBannerProps) {
  if (overrunPaise > 0) {
    return (
      <div className="rounded-xl border border-rose-900/60 bg-rose-950/35 px-3 py-2 text-xs text-rose-200">
        <span className="font-medium">Budget exceeded by {toInrCompact(overrunPaise)}.</span> Estimated total{" "}
        {toInrCompact(estimatedTotalPaise)} vs budget {toInrCompact(totalBudgetPaise)}.{" "}
        {topVarianceBucketLabel ?? "Top bucket"} is currently driving the largest variance.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/35 px-3 py-2 text-xs text-emerald-200">
      Budget is currently within plan. Utilization at {utilization}% with {allocatedCoverage}% allocation coverage.
    </div>
  );
}
