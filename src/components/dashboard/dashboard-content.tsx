import { Suspense } from "react";

import { AlertsBanner } from "@/components/dashboard/alerts-banner";
import { dashboardMockData } from "@/components/dashboard/mock-data";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { UrgentTasksWidget } from "@/components/dashboard/urgent-tasks-widget";
import { WeeklyCompletionWidget } from "@/components/dashboard/weekly-completion-widget";
import { WeddingListWidget } from "@/components/dashboard/wedding-list-widget";

export async function DashboardContent() {
  const data = dashboardMockData;

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
