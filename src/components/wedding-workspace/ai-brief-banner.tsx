import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

type AIBriefBannerProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function AIBriefBanner({ workspace }: AIBriefBannerProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
      <div className="flex min-w-0 gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/40 bg-violet-500/15 text-sm font-semibold text-violet-700 dark:text-violet-200"
          aria-hidden
        >
          A
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-violet-700 dark:text-violet-200">
            <Sparkles className="mr-1 inline size-3.5 text-violet-700 dark:text-violet-300" />
            {workspace.aiBriefTitle}
          </p>
          <p className="mt-0.5 text-xs text-violet-700/80 dark:text-violet-200/85">
            {workspace.aiBriefDescription}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 rounded-md border-violet-400/40 bg-background/60 text-violet-700 hover:bg-violet-500/10 dark:text-violet-200"
      >
        View
        <ArrowRight className="size-3.5" />
      </Button>
    </section>
  );
}
