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
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/70 bg-card",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
          className,
        )}
      >
        {/* Top-edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

        <div className="flex divide-x divide-border/60">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "group relative flex min-w-0 flex-1 flex-col items-center px-4 py-3.5 text-center",
                "transition-colors duration-150 hover:bg-muted/30",
              )}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Active accent top line — appears on hover */}
              <div className="absolute inset-x-3 top-0 h-px scale-x-0 bg-foreground/30 transition-transform duration-200 group-hover:scale-x-100 rounded-full" />

              <p className="truncate text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                {item.title}
              </p>
              <p className="db-count-in mt-1 text-[1.625rem] font-bold leading-none tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-1 truncate text-[10.5px] text-muted-foreground/70">
                {item.helperText}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item, i) => (
        <StatCard
          key={item.id}
          title={item.title}
          value={item.value}
          helperText={item.helperText}
          progress={item.progress}
          className={`db-fade-up-${Math.min(i, 4)}`}
        />
      ))}
    </section>
  );
}
