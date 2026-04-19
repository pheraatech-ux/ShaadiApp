import { AppPageHeader } from "@/components/app-dashboard/dashboard/app-page-header";
import { getDashboardView } from "@/lib/data/app-data";

export async function TasksMainView() {
  const view = await getDashboardView();

  return (
    <div className="space-y-5">
      <AppPageHeader title="Tasks" />
      <section className="rounded-xl border border-border/70 bg-card">
        <header className="border-b border-border/60 px-4 py-3 text-sm font-medium text-foreground">
          {view.urgentTasks.length} urgent items
        </header>
        {view.urgentTasks.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">No urgent tasks right now.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {view.urgentTasks.map((task) => (
              <article key={task.id} className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.overdueLabel ?? task.owner}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
