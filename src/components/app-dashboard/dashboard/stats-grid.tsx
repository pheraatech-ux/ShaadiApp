import { StatCard } from "@/components/app-dashboard/dashboard/stat-card";
import { DashboardStat } from "@/components/app-dashboard/dashboard/types";

type StatsGridProps = {
  items: DashboardStat[];
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
