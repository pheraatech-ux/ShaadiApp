import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

type LeadBannerProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function LeadBanner({ workspace }: LeadBannerProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 rounded-md bg-emerald-500/20 p-1">
          <BadgeCheck className="size-3.5 text-emerald-700 dark:text-emerald-300" />
        </span>
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
    </section>
  );
}
