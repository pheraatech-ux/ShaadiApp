"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

type AddWeddingBudgetStepProps = {
  onBudgetChange?: (budget: { totalBudgetPaise: number }) => void;
};

export function AddWeddingBudgetStep({ onBudgetChange }: AddWeddingBudgetStepProps) {
  const [budgetRupees, setBudgetRupees] = useState("");

  const totalBudgetPaise = budgetRupees ? Math.max(0, parseInt(budgetRupees, 10)) * 100 : 0;

  useEffect(() => {
    onBudgetChange?.({ totalBudgetPaise });
  }, [totalBudgetPaise, onBudgetChange]);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Budget</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Set an estimated total budget for the wedding. You can update this anytime from the budget page.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Total estimated wedding budget{" "}
          <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/20 px-3 py-2">
          <span className="text-lg font-semibold text-muted-foreground">INR</span>
          <Input
            className="h-10 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            inputMode="numeric"
            placeholder="0"
            value={budgetRupees}
            onChange={(e) => setBudgetRupees(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
        {budgetRupees ? (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            = INR {(parseInt(budgetRupees, 10) / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh
          </p>
        ) : null}
      </div>
    </div>
  );
}
