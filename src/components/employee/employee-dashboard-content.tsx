import { AiInsightsWidget } from "@/components/app-dashboard/dashboard/ai-insights-widget";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { getEmployeeDashboardView } from "@/lib/data/app-data";

export async function EmployeeDashboardContent() {
  const data = await getEmployeeDashboardView();

  return (
    <div className="space-y-4 sm:space-y-5">
      <StatsGrid items={data.stats} variant="bar" />
      <div className="grid h-[380px] items-stretch gap-4 lg:grid-cols-2">
        <UrgentTasksWidget items={data.urgentTasks} allTasksHref="/app/employee/tasks" />
        <AiInsightsWidget
          insightsCache={data.insightsCache}
          tasksHref="/app/employee/tasks"
          messagesHref="/app/messages"
          vendorsHref="/app/vendors"
        />
      </div>
    </div>
  );
}
