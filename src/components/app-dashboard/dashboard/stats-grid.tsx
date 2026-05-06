import { StatCard } from "@/components/app-dashboard/dashboard/stat-card";
import { DashboardStat } from "@/components/app-dashboard/dashboard/types";
import { cn } from "@/lib/utils";

type StatsGridProps = {
  items: DashboardStat[];
  variant?: "grid" | "bar";
  className?: string;
};

export function StatsGrid({ items, variant = "grid", className }: StatsGridProps) {
  if (variant === "bar") {
    return (
      <div className={cn("flex divide-x divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm", className)}>
        {items.map((item) => (
          <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center px-4 py-3 text-center">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {item.title}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.helperText}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <StatCard
          key={item.id}
          title={item.title}
          value={item.value}
          helperText={item.helperText}
          progress={item.progress}
        />
      ))}
    </section>
  );
}
