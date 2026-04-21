import { Calendar, Flower2, MapPin } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceWeddingDetailsStrip } from "@/components/wedding-workspace/overview/types";
import { cn } from "@/lib/utils";

type WorkspaceWeddingDetailsHeaderProps = {
  avatarLabel: string;
  coupleName: string;
  dateLabel: string;
  locationLabel: string;
  cultureSummary: string;
  countdownBadgeLabel: string;
  strip: WorkspaceWeddingDetailsStrip;
};

function StatBlock({
  value,
  label,
  valueClassName,
}: {
  value: string;
  label: string;
  valueClassName: string;
}) {
  return (
    <div className="flex min-w-[6.25rem] flex-1 flex-col items-center gap-1 px-2 py-1 sm:min-w-[6.75rem] sm:px-4">
      <p className={cn("text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl", valueClassName)}>{value}</p>
      <p className="whitespace-nowrap text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function WorkspaceWeddingDetailsHeader({
  avatarLabel,
  coupleName,
  dateLabel,
  locationLabel,
  cultureSummary,
  countdownBadgeLabel,
  strip,
}: WorkspaceWeddingDetailsHeaderProps) {
  const tasksLabel = `${strip.tasksDone}/${strip.tasksTotal}`;

  return (
    <section className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0 flex flex-1 gap-3 sm:gap-4">
          <Avatar className="size-12 shrink-0 rounded-xl border border-border/70 sm:size-14">
            <AvatarFallback className="rounded-xl bg-primary/90 text-base font-semibold text-primary-foreground sm:text-lg">
              {avatarLabel}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{coupleName}</h1>
              <Badge
                variant="outline"
                className="rounded-md border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-100"
              >
                {countdownBadgeLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {dateLabel}
              </span>
              <span className="hidden text-border sm:inline" aria-hidden>
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {locationLabel}
              </span>
              <span className="hidden text-border sm:inline" aria-hidden>
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <Flower2 className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {cultureSummary}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-stretch justify-center divide-x divide-border/70 rounded-xl border border-border/60 bg-muted/30 px-1 py-3 sm:px-2">
          <StatBlock value={tasksLabel} label="Tasks done" valueClassName="text-amber-600 dark:text-amber-400" />
          <StatBlock value={String(strip.teamMembers)} label="Team members" valueClassName="text-sky-600 dark:text-sky-400" />
          <StatBlock
            value={`${strip.progressPercent}%`}
            label="Progress"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>
    </section>
  );
}
