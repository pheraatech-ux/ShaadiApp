import { CalendarDays, MapPin } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

type WorkspaceHeaderProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="size-10 rounded-md border border-border/70 bg-muted/50">
          <AvatarFallback className="rounded-md bg-muted/60 text-[11px] font-semibold text-foreground">
            {workspace.avatarLabel}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold text-foreground">{workspace.coupleName}</h1>
            {workspace.cultureTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="h-5 rounded-md border-border/70 bg-muted/40 px-1.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{workspace.plannerName}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" />
              {workspace.locationLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" />
              {workspace.dateLabel}
            </span>
            <span>{workspace.eventCountLabel}</span>
          </div>
        </div>
        <Badge className="rounded-md bg-amber-500/15 text-[11px] text-amber-700 dark:text-amber-300">
          {workspace.daysLeftLabel}
        </Badge>
      </div>
    </section>
  );
}
