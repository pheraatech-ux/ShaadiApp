import { CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

type SetupBannerProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function SetupBanner({ workspace }: SetupBannerProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{workspace.setupTitle}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{workspace.setupDescription}</p>
        </div>
        <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
          Dismiss
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {workspace.setupChips.map((chip, index) => {
          const complete = index < 2;

          return (
            <Badge
              key={chip}
              variant="outline"
              className="h-6 rounded-md border-border/70 bg-muted/50 px-2 text-[11px] text-muted-foreground"
            >
              {complete ? (
                <CheckCircle2 className="mr-1 size-3 text-emerald-400" />
              ) : (
                <CircleDashed className="mr-1 size-3 text-muted-foreground" />
              )}
              {chip}
            </Badge>
          );
        })}
      </div>
    </section>
  );
}
