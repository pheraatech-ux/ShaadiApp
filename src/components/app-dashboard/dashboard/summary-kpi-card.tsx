import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SummaryKpiCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  iconBoxClassName?: string;
  label: string;
  value: number;
  sub: string;
  className?: string;
};

export function SummaryKpiCard({
  icon: Icon,
  iconClassName,
  iconBoxClassName,
  label,
  value,
  sub,
  className,
}: SummaryKpiCardProps) {
  return (
    <article className={cn("rounded-xl border border-border/70 bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40",
            iconBoxClassName,
          )}
        >
          <Icon className={cn("size-5", iconClassName)} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums leading-none">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
    </article>
  );
}
