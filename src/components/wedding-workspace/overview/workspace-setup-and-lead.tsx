"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";

type WorkspaceSetupAndLeadProps = {
  workspace: WeddingWorkspaceViewModel;
};

function isSelfAssignSetupChip(label: string) {
  return /self.assign/i.test(label);
}

export function WorkspaceSetupAndLead({ workspace }: WorkspaceSetupAndLeadProps) {
  const isLeadAssigned = /you are the lead/i.test(workspace.leadBannerTitle);

  return (
    <>
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
            const selfAssign = isSelfAssignSetupChip(chip);
            const complete = index === 0 || (selfAssign && isLeadAssigned);

            return (
              <Badge
                key={`${chip}-${index}`}
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

      {isLeadAssigned ? (
        <section className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 pr-11">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                  {workspace.leadBannerTitle}
                </p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-200/80">
                  {workspace.leadBannerDescription}
                </p>
              </div>
            </div>
            <Badge className="rounded-md bg-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-200">
              Lead assigned
            </Badge>
          </div>
        </section>
      ) : null}
    </>
  );
}
