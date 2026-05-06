import { AiInsightsWidget } from "@/components/app-dashboard/dashboard/ai-insights-widget";
import { FinancialSnapshotWidget } from "@/components/app-dashboard/dashboard/financial-snapshot-widget";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { WeddingGlanceWidget } from "@/components/app-dashboard/dashboard/wedding-glance-widget";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import { getDashboardView } from "@/lib/data/app-data";

export async function DashboardContent() {
  const data = await getDashboardView();
  const [salutation, ...nameParts] = data.greeting.split(",");
  const fullName = nameParts.join(",").trim();
  const greetedName = fullName.split(/\s+/)[0] ?? fullName;
  const _d = new Date();
  const dateLabel = `${_d.toLocaleDateString("en-GB", { weekday: "long" })}, ${_d.getDate()} ${_d.toLocaleDateString("en-GB", { month: "long" })}`;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-16">
        <div className="shrink-0">
          <p className="text-sm text-muted-foreground">
            {salutation || "Welcome"},
          </p>
          {greetedName ? (
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {greetedName}
            </p>
          ) : (
            <p className="mt-0.5 text-lg text-muted-foreground">{data.greeting}</p>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <StatsGrid items={data.stats} variant="bar" className="flex-1" />
      </div>
      <div className="grid h-[380px] items-stretch gap-4 lg:grid-cols-2">
        <UrgentTasksWidget items={data.urgentTasks} />
        <AiInsightsWidget insights={data.aiInsights} />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="h-[340px]">
          <WeddingGlanceWidget items={data.weddings} />
        </div>
        <div className="h-[340px]">
          <FinancialSnapshotWidget snapshot={data.financialSnapshot} />
        </div>
      </div>
    </div>
  );
}
