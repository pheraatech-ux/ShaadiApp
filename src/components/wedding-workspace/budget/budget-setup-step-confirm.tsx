"use client";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { BudgetAllocation } from "../../../../budgetAI";

type BudgetSetupStepConfirmProps = {
  budgetRupees: string;
  allocations: BudgetAllocation[];
  userPcts: Record<string, string>;
};

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(n)));
}

export function BudgetSetupStepConfirm({ budgetRupees, allocations, userPcts }: BudgetSetupStepConfirmProps) {
  const total = parseInt(budgetRupees || "0", 10);
  const lakhDisplay = (total / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const rows = allocations.map((row) => {
    const pct = parseFloat(userPcts[row.categoryId] ?? String(row.percentage)) || 0;
    return {
      ...row,
      pct,
      amountRupees: Math.round((pct / 100) * total),
    };
  });

  const topRows = rows.slice(0, 6);
  const remaining = rows.length - topRows.length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Step 3 of 3</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Confirm your budget</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your settings. You can edit everything from the budget page anytime.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600 dark:text-emerald-400">
          Total budget
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">₹ {formatInr(total)}</p>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">= INR {lakhDisplay} Lakh</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Allocation plan</p>
        <div className="space-y-1.5">
          {topRows.map((row) => (
            <div
              key={row.categoryId}
              className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2"
            >
              <p className="text-sm font-medium">{row.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm tabular-nums text-muted-foreground">₹ {formatInr(row.amountRupees)}</span>
                <Badge variant="outline" className="rounded-md text-[10px] tabular-nums">
                  {row.pct}%
                </Badge>
              </div>
            </div>
          ))}
          {remaining > 0 && (
            <p className="px-3 text-xs text-muted-foreground">+ {remaining} more categories</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-4 py-3">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
        <p className="text-sm text-muted-foreground">
          Your workspace is ready to track expenses and manage vendors once you confirm.
        </p>
      </div>
    </div>
  );
}
