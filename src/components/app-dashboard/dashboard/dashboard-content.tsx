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
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting + Stats Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-14">
        <div className="shrink-0 db-fade-up">
          <p className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
            {salutation || "Welcome"}
          </p>
          {greetedName ? (
            <p className="mt-1 text-[2.25rem] font-extrabold tracking-tight leading-none text-foreground sm:text-[2.5rem]">
              {greetedName}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-muted-foreground">{data.greeting}</p>
          )}
          <p className="mt-1.5 text-sm text-muted-foreground/60 font-medium">{dateLabel}</p>
        </div>
        <StatsGrid items={data.stats} variant="bar" className="flex-1 db-fade-up-1" />
      </div>

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
    </div>
  );
}
