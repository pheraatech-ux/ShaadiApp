import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FinancialKpiCardProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueClassName?: string;
  className?: string;
  headerAction?: ReactNode;
};

export function FinancialKpiCard({
  label,
  value,
  sub,
  valueClassName,
  className,
  headerAction,
}: FinancialKpiCardProps) {
  return (
    <article className={cn("rounded-xl border border-border/70 bg-card p-4", className)}>
      {headerAction ? (
        <div className="absolute right-3 top-3">{headerAction}</div>
      ) : null}
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums leading-none", valueClassName)}>
        {value}
      </div>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </article>
  );
}
