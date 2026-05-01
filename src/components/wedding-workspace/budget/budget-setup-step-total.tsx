"use client";

import { Input } from "@/components/ui/input";

type BudgetSetupStepTotalProps = {
  budgetRupees: string;
  onChange: (val: string) => void;
};

export function BudgetSetupStepTotal({ budgetRupees, onChange }: BudgetSetupStepTotalProps) {
  const parsed = budgetRupees ? parseInt(budgetRupees, 10) : 0;
  const lakhDisplay =
    parsed > 0
      ? parsed / 100000 >= 1
        ? `${(parsed / 100000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`
        : `${(parsed / 1000).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Thousand`
      : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Step 1 of 3</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Enter total wedding budget</h2>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Total budget (INR){" "}
          <span className="font-normal normal-case tracking-normal text-muted-foreground/60">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/20 px-3 py-2">
          <span className="text-xl font-semibold text-muted-foreground">₹</span>
          <Input
            className="h-10 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            inputMode="numeric"
            placeholder="0"
            value={budgetRupees}
            onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
        {lakhDisplay ? (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">= INR {lakhDisplay}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">You can adjust the allocation in the next step.</p>
      </div>
    </div>
  );
}
