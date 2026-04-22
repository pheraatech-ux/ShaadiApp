import { Suspense } from "react";

import { AlertsBanner } from "@/components/app-dashboard/dashboard/alerts-banner";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { WeeklyCompletionWidget } from "@/components/app-dashboard/tasks/weekly-completion-widget";
import { WeddingListWidget } from "@/components/app-dashboard/dashboard/wedding-list-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeeDashboardView } from "@/lib/data/app-data";
import { cn } from "@/lib/utils";

export async function EmployeeDashboardContent() {
  const data = await getEmployeeDashboardView();
  const [salutation, ...nameParts] = data.greeting.split(",");
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
          <p className="text-lg text-muted-foreground">{data.greeting}</p>
        )}
      </div>
      <StatsGrid items={data.stats} />
      <AlertsBanner alerts={data.alerts} />
      <div className="grid gap-4 xl:grid-cols-[3fr_2fr] xl:items-stretch">
        <div className="order-1 min-w-0 xl:col-start-1 xl:row-start-1">
          <UrgentTasksWidget items={data.urgentTasks} allTasksHref="/app/employee/tasks" />
        </div>
        <Suspense
          fallback={
            <div className="order-2 h-56 min-w-0 animate-pulse rounded-2xl bg-muted/60 xl:col-start-1 xl:row-start-2" />
          }
        >
          <div className="order-2 min-w-0 xl:col-start-1 xl:row-start-2">
            <WeddingListWidget items={data.weddings} basePath="/app/employee" canCreateWedding={false} />
          </div>
        </Suspense>
        <Card className="order-3 flex min-h-56 min-w-0 flex-col rounded-2xl border-border/70 bg-card text-card-foreground xl:order-3 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:h-full xl:min-h-0">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {data.recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((row, index) => (
                  <div key={row.id}>
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold",
                          row.initialsClassName,
                        )}
                      >
                        {row.initials}
                      </span>
                      <p className="text-sm leading-6 text-foreground">{row.text}</p>
                      <span className="text-xs text-muted-foreground">{row.time}</span>
                    </div>
                    {index < data.recentActivity.length - 1 ? (
                      <div className="mt-3 h-px bg-border/70" />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <WeeklyCompletionWidget items={data.weeklyCompletion} />
    </div>
  );
}
