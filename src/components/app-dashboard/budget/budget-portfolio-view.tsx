import { AppPageHeader } from "@/components/app-dashboard/dashboard/app-page-header";
import { Badge } from "@/components/ui/badge";
import { getBudgetPortfolioView } from "@/lib/data/app-data";

function toInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export async function BudgetPortfolioView() {
  const view = await getBudgetPortfolioView();

  return (
    <div className="space-y-5">
      <AppPageHeader title="Budget" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Portfolio total</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(view.totalBudgetPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all accessible weddings</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Allocated</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(view.totalAllocatedPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Planner line items planned</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(view.totalSpentPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{view.portfolioUtilizationPercent}% utilization</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Weddings at risk</p>
          <p className="mt-1 text-2xl font-semibold">{view.weddingsAtRisk}</p>
          <p className="mt-1 text-xs text-muted-foreground">Watch and overrun status combined</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold">Top spend buckets</h2>
          <div className="mt-3 space-y-2">
            {view.topBuckets.map((bucket) => (
              <div key={bucket.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <p className="font-medium">{bucket.label}</p>
                  <p>{toInr(bucket.spentPaise)}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Allocated {toInr(bucket.allocatedPaise)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border/70 bg-card p-4">
          <h2 className="text-sm font-semibold">Wedding budget health</h2>
          <div className="mt-3 space-y-2">
            {view.weddingRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No weddings yet.</p>
            ) : (
              view.weddingRows.slice(0, 8).map((row) => (
                <div key={row.id} className="rounded-lg border border-border/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{row.coupleName}</p>
                    <Badge variant={row.status === "overrun" ? "destructive" : row.status === "watch" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Total {toInr(row.totalBudgetPaise)} - Spent {toInr(row.spentPaise)} - Allocated {toInr(row.allocatedPaise)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
