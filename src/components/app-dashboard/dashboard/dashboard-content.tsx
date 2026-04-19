import { Suspense } from "react";

import { AlertsBanner } from "@/components/app-dashboard/dashboard/alerts-banner";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { WeeklyCompletionWidget } from "@/components/app-dashboard/tasks/weekly-completion-widget";
import { WeddingListWidget } from "@/components/app-dashboard/dashboard/wedding-list-widget";
import { getDashboardView } from "@/lib/data/app-data";

export async function DashboardContent() {
  const data = await getDashboardView();

  return (
    <div className="space-y-4 sm:space-y-5">
      <StatsGrid items={data.stats} />
      <AlertsBanner alerts={data.alerts} />
      <Suspense
        fallback={<div className="h-56 animate-pulse rounded-2xl bg-muted/60" />}
      >
        <WeddingListWidget items={data.weddings} />
      </Suspense>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <UrgentTasksWidget items={data.urgentTasks} />
        <WeeklyCompletionWidget items={data.weeklyCompletion} />
      </div>
    </div>
  );
}
