"use client";

import { startTransition, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, CircleDashed, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";
import {
  readLeadBannerConsumed,
  readLeadSelfAssigned,
  writeLeadBannerConsumed,
  writeLeadSelfAssigned,
} from "@/components/wedding-workspace/workspace-lead-storage";
import { cn } from "@/lib/utils";

type WorkspaceSetupAndLeadProps = {
  workspace: WeddingWorkspaceViewModel;
};

function isSelfAssignSetupChip(label: string) {
  return /self.assign/i.test(label);
}

export function WorkspaceSetupAndLead({ workspace }: WorkspaceSetupAndLeadProps) {
  const weddingId = workspace.id;
  const [hydrated, setHydrated] = useState(false);
  const [selfAssigned, setSelfAssigned] = useState(false);
  const [bannerConsumed, setBannerConsumed] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setSelfAssigned(readLeadSelfAssigned(weddingId));
      setBannerConsumed(readLeadBannerConsumed(weddingId));
      setHydrated(true);
    });
  }, [weddingId]);

  const assignLead = () => {
    if (selfAssigned) return;
    writeLeadSelfAssigned(weddingId);
    setSelfAssigned(true);
  };

  const dismissLeadBanner = () => {
    writeLeadBannerConsumed(weddingId);
    setBannerConsumed(true);
  };

  const showLeadBanner = hydrated && selfAssigned && !bannerConsumed;

  useEffect(() => {
    if (!showLeadBanner) return;
    return () => {
      writeLeadBannerConsumed(weddingId);
    };
  }, [showLeadBanner, weddingId]);

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
            const complete =
              index === 0 || (selfAssign && selfAssigned);

            if (selfAssign) {
              const label = selfAssigned ? "Self-assigned as lead" : "Self assign as lead";
              return (
                <Badge
                  key={`${chip}-${index}`}
                  variant="outline"
                  render={
                    <button
                      type="button"
                      disabled={selfAssigned}
                      onClick={assignLead}
                      className={cn(
                        "h-6 rounded-md border-border/70 bg-muted/50 px-2 text-[11px] text-muted-foreground",
                        !selfAssigned &&
                          "cursor-pointer hover:border-emerald-500/40 hover:bg-muted hover:text-foreground",
                        selfAssigned && "cursor-default",
                      )}
                    />
                  }
                >
                  {complete ? (
                    <CheckCircle2 className="mr-1 size-3 text-emerald-400" />
                  ) : (
                    <CircleDashed className="mr-1 size-3 text-muted-foreground" />
                  )}
                  {label}
                </Badge>
              );
            }

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

      {showLeadBanner ? (
        <section className="relative rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 pr-11">
          <button
            type="button"
            onClick={dismissLeadBanner}
            className="absolute top-2 right-2 rounded-md p-1 text-emerald-700/80 transition-colors hover:bg-emerald-500/20 hover:text-emerald-900 dark:text-emerald-200/90 dark:hover:text-emerald-50"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3">
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
          </div>
        </section>
      ) : null}
    </>
  );
}
