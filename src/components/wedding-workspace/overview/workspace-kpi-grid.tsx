import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";

type WorkspaceKpiGridProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function WorkspaceKpiGrid({ workspace }: WorkspaceKpiGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {workspace.kpis.map((kpi) => (
        <article key={kpi.id} className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{kpi.label}</p>
          <p className="mt-1 text-3xl leading-none font-semibold text-foreground">{kpi.value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{kpi.helperText}</p>
        </article>
      ))}
    </section>
  );
}
