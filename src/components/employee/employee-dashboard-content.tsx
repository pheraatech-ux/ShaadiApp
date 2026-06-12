import { AiInsightsWidget } from "@/components/app-dashboard/dashboard/ai-insights-widget";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { WeddingGlanceWidget } from "@/components/app-dashboard/dashboard/wedding-glance-widget";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { UpcomingEventsWidget } from "@/components/app-dashboard/upcoming-events/upcoming-events-widget";
import { getEmployeeDashboardView, getUpcomingEventsPanelData } from "@/lib/data/app-data";

export async function EmployeeDashboardContent() {
  const [data, upcomingItems] = await Promise.all([
    getEmployeeDashboardView(),
    getUpcomingEventsPanelData(),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <StatsGrid items={data.stats} variant="bar" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[400px]">
          <UrgentTasksWidget items={data.urgentTasks} allTasksHref="/app/employee/tasks" />
        </div>
        <div className="h-[400px]">
          <AiInsightsWidget
            insightsCache={data.insightsCache}
            tasksHref="/app/employee/tasks"
            messagesHref="/app/messages"
            vendorsHref="/app/vendors"
          />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[340px]">
          <WeddingGlanceWidget
            items={data.weddings}
            basePath="/app/employee"
            canCreateWedding={false}
          />
        </div>
        <div className="h-[340px]">
          <UpcomingEventsWidget
            items={upcomingItems}
            todayStr={new Date().toISOString().slice(0, 10)}
            basePath="/app/employee"
          />
        </div>
      </div>
    </div>
  );
}
