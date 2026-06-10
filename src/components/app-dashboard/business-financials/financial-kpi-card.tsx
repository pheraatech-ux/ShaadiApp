import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FinancialKpiCardProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueClassName?: string;
  className?: string;
  headerAction?: ReactNode;
  centered?: boolean;
};

export function FinancialKpiCard({
  label,
  value,
  sub,
  valueClassName,
  className,
  headerAction,
  centered,
}: FinancialKpiCardProps) {
  return (
    <article className={cn("rounded-xl border border-border/70 bg-card p-4", centered && "text-center", className)}>
      {headerAction ? (
        <div className="absolute right-3 top-3">{headerAction}</div>
      ) : null}
      <p
        className={cn(
          centered
            ? "truncate text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60"
            : "text-xs text-muted-foreground",
        )}
      >
        {label}
      </p>
      <div
        className={cn(
          "mt-1 tabular-nums leading-none",
          centered ? "text-[1.625rem] font-bold tracking-tight" : "text-2xl font-semibold",
          centered && "flex justify-center",
          valueClassName,
        )}
      >
        {value}
      </div>
      {sub ? (
        <p className={cn("mt-1", centered ? "truncate text-[10.5px] text-muted-foreground/70" : "text-xs text-muted-foreground")}>
          {sub}
        </p>
      ) : null}
    </article>
  );
}
