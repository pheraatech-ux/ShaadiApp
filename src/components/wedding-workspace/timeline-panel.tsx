import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimelineCultureFilterPills } from "@/components/wedding-workspace/timeline-culture-filter-pills";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";
import { cn } from "@/lib/utils";

type TimelinePanelProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function TimelinePanel({ workspace }: TimelinePanelProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <header className="flex flex-col gap-3 border-b border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-foreground">{workspace.timelineTitle}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <TimelineCultureFilterPills filters={workspace.timelineCultureFilters} />
          <Button variant="link" size="sm" className="h-auto gap-0.5 px-1 text-xs text-primary">
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>
      </header>
      <div className="divide-y divide-border/60">
        {workspace.timelineEvents.map((event) => (
          <article key={event.id} className="flex gap-3 px-4 py-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-lg"
              aria-hidden
            >
              {event.icon ?? "•"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">{event.title}</span>
                {event.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="h-4 rounded-sm border-border/70 px-1 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{event.dateLabel}</p>
              {event.subtags?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.subtags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{event.daysLeftLabel}</p>
              {event.taskProgressLabel ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{event.taskProgressLabel}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {workspace.timelineMoreEventsLabel ? (
        <footer className="border-t border-border/70 px-4 py-2.5">
          <button
            type="button"
            className={cn(
              "text-xs font-medium text-primary underline-offset-4 hover:underline",
            )}
          >
            {workspace.timelineMoreEventsLabel}
          </button>
        </footer>
      ) : null}
    </section>
  );
}
