"use client";

import { useMemo, useState } from "react";

import {
  BudgetEditorPanel,
  type BudgetVisibility,
} from "@/components/app-dashboard/add-wedding-budget/budget-editor-panel";
import { buildFallbackAllocation, type WeddingBudgetInput } from "../../../../budgetAI";
import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";
import type { CultureId } from "../../../../weddingCultures";

type BudgetPageClientProps = {
  view: WeddingBudgetWorkspaceViewModel;
};

function toLakhLabel(rupees: number) {
  const lakh = rupees / 100000;
  return `INR ${lakh.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`;
}

export function BudgetPageClient({ view }: BudgetPageClientProps) {
  const [budgetRupees, setBudgetRupees] = useState(
    String(Math.round(view.totalBudgetPaise / 100)),
  );
  const [plannerFeeRupees, setPlannerFeeRupees] = useState("");
  const [budgetVisibility, setBudgetVisibility] = useState<BudgetVisibility>("planner");
  const [paymentTerms, setPaymentTerms] = useState("50-50");

  const totalBudgetRupees = Math.max(0, parseInt(budgetRupees || "0", 10));
  const totalBudgetPaise = totalBudgetRupees * 100;

  const fallbackInput: WeddingBudgetInput = useMemo(
    () => ({
      totalBudgetPaise,
      cultures: view.cultures as CultureId[],
      weddingCity: "Not specified",
      estimatedGuestCount: undefined,
      numberOfEvents: 5,
      numberOfDays: 2,
      includeDecor: true,
      includePhotography: true,
      isDestinationWedding: false,
      venueTier: "mid",
    }),
    [totalBudgetPaise, view.cultures],
  );

  const allocationResult = useMemo(() => buildFallbackAllocation(fallbackInput), [fallbackInput]);
  const sortedAllocations = useMemo(
    () => [...allocationResult.allocations].sort((a, b) => b.percentage - a.percentage),
    [allocationResult.allocations],
  );

  const contextLine = `${view.coupleName} · ${view.cultures.length} culture${view.cultures.length === 1 ? "" : "s"}`;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <BudgetEditorPanel
        budgetRupees={budgetRupees}
        onBudgetRupeesChange={setBudgetRupees}
        plannerFeeRupees={plannerFeeRupees}
        onPlannerFeeRupeesChange={setPlannerFeeRupees}
        budgetVisibility={budgetVisibility}
        onBudgetVisibilityChange={setBudgetVisibility}
        paymentTerms={paymentTerms}
        onPaymentTermsChange={setPaymentTerms}
        allocations={sortedAllocations}
        totalBudgetRupeesLabel={toLakhLabel(totalBudgetRupees)}
        contextLine={contextLine}
      />
    </div>
  );
}
