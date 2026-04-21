import { Suspense } from "react";

import { AlertsBanner } from "@/components/app-dashboard/dashboard/alerts-banner";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { WeeklyCompletionWidget } from "@/components/app-dashboard/tasks/weekly-completion-widget";
import { WeddingListWidget } from "@/components/app-dashboard/dashboard/wedding-list-widget";
import { getDashboardView } from "@/lib/data/app-data";
import { getCurrentPlanner } from "@/lib/get-current-planner";
import { buildTimeOfDayGreeting } from "@/lib/planner-display";

export async function DashboardContent() {
  const [data, planner] = await Promise.all([getDashboardView(), getCurrentPlanner()]);
  const greeting = buildTimeOfDayGreeting(planner.displayName);
  const [salutation, ...nameParts] = greeting.split(",");
  const greetedName = nameParts.join(",").trim();

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
          {salutation || "Welcome"}
        </p>
        {greetedName ? (
          <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {greetedName}
          </p>
        ) : (
          <p className="text-lg text-muted-foreground">{greeting}</p>
        )}
      </div>
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
