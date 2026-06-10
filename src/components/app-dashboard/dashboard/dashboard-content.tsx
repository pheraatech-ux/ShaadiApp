import { AiInsightsWidget } from "@/components/app-dashboard/dashboard/ai-insights-widget";
import { FinancialSnapshotWidget } from "@/components/app-dashboard/dashboard/financial-snapshot-widget";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { WeddingGlanceWidget } from "@/components/app-dashboard/dashboard/wedding-glance-widget";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { UpcomingEventsWidget } from "@/components/app-dashboard/upcoming-events/upcoming-events-widget";
import { getDashboardView, getUpcomingEventsPanelData } from "@/lib/data/app-data";

export async function DashboardContent() {
  const [data, upcomingItems] = await Promise.all([getDashboardView(), getUpcomingEventsPanelData()]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <StatsGrid items={data.stats} variant="bar" className="db-fade-up" />

      {/* Main widgets */}
      <div className="grid gap-4 lg:grid-cols-2 db-fade-up-2">
        <div className="h-[400px]">
          <UrgentTasksWidget items={data.urgentTasks} />
        </div>
        <div className="h-[400px]">
          <AiInsightsWidget insights={data.aiInsights} />
        </div>
      </div>

      {/* Secondary widgets */}
      <div className="grid gap-4 lg:grid-cols-2 db-fade-up-3">
        <div className="h-[340px]">
          <WeddingGlanceWidget items={data.weddings} />
        </div>
        <div className="h-[340px]">
          <FinancialSnapshotWidget snapshot={data.financialSnapshot} />
        </div>
      </div>

      {/* Upcoming events — half-width, below secondary widgets */}
      <div className="grid gap-4 lg:grid-cols-2 db-fade-up-3">
        <div className="h-[340px]">
          <UpcomingEventsWidget
            items={upcomingItems}
            todayStr={new Date().toISOString().slice(0, 10)}
            basePath="/app"
          />
        </div>
      </div>
    </div>
  );
}
