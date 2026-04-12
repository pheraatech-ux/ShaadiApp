import { getDashboardView } from "@/lib/data/app-data";

export default async function BudgetPage() {
  const view = await getDashboardView();
  const budgetStat = view.stats.find((stat) => stat.id === "total-budget");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Budget</h1>
      <section className="rounded-xl border border-border/70 bg-card p-4">
        <p className="text-sm text-muted-foreground">Portfolio budget tracked from wedding records.</p>
        <p className="mt-2 text-3xl font-semibold text-foreground">{budgetStat?.value ?? "₹0L"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{budgetStat?.helperText ?? "No weddings yet."}</p>
      </section>
    </div>
  );
}
