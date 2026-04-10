"use client";

import { useMemo, useState } from "react";

import type { AddWeddingCoupleForm } from "@/components/dashboard/add-wedding-couple-step";
import {
  BudgetEditorPanel,
  type BudgetVisibility,
} from "@/components/dashboard/add-wedding-budget/budget-editor-panel";
import { ReviewConfirmPanel } from "@/components/dashboard/add-wedding-budget/review-confirm-panel";
import { buildFallbackAllocation, type WeddingBudgetInput } from "../../../budgetAI";
import type { CultureId, WeddingEvent } from "../../../weddingCultures";

type AddWeddingBudgetStepProps = {
  coupleForm: AddWeddingCoupleForm;
  selectedCultures: CultureId[];
  reviewEvents: WeddingEvent[];
};

const paymentTermLabels: Record<string, string> = {
  "50-50": "50% advance, 50% on wedding day",
  "40-40-20": "40% booking, 40% mid-way, 20% on wedding week",
  "30-40-30": "30% booking, 40% planning phase, 30% before wedding",
};

function toLakhLabel(rupees: number) {
  const lakh = rupees / 100000;
  return `INR ${lakh.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`;
}

function formatDate(date?: Date) {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function parseNumber(value: string) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function advancePercentFromTerms(terms: string) {
  const first = terms.split("-")[0];
  const n = Number.parseInt(first, 10);
  return Number.isFinite(n) ? n : 50;
}

export function AddWeddingBudgetStep({ coupleForm, selectedCultures, reviewEvents }: AddWeddingBudgetStepProps) {
  const [budgetRupees, setBudgetRupees] = useState("2500000");
  const [plannerFeeRupees, setPlannerFeeRupees] = useState("");
  const [budgetVisibility, setBudgetVisibility] = useState<BudgetVisibility>("planner");
  const [paymentTerms, setPaymentTerms] = useState("50-50");

  const totalBudgetRupees = parseNumber(budgetRupees);
  const totalBudgetPaise = totalBudgetRupees * 100;

  const fallbackInput: WeddingBudgetInput = useMemo(
    () => ({
      totalBudgetPaise,
      cultures: selectedCultures,
      weddingCity: coupleForm.city || "Not specified",
      estimatedGuestCount: undefined,
      numberOfEvents: reviewEvents.length,
      numberOfDays: Math.max(1, Math.min(5, Math.ceil(reviewEvents.length / 5))),
      includeDecor: true,
      includePhotography: true,
      isDestinationWedding: false,
      venueTier: "mid",
    }),
    [totalBudgetPaise, selectedCultures, coupleForm.city, reviewEvents.length],
  );

  const allocationResult = useMemo(() => buildFallbackAllocation(fallbackInput), [fallbackInput]);
  const sortedAllocations = useMemo(
    () => [...allocationResult.allocations].sort((a, b) => b.percentage - a.percentage),
    [allocationResult.allocations],
  );

  const coupleLabel = `${coupleForm.brideName || "Bride"} & ${coupleForm.groomName || "Groom"}`;
  const cityVenueLabel = [coupleForm.city || "City", coupleForm.venueName || "Venue"].join(" · ");
  const contextLine = `${coupleLabel} · ${selectedCultures.length} culture${selectedCultures.length === 1 ? "" : "s"} · ${reviewEvents.length} events`;
  const plannerFeeLabel = plannerFeeRupees ? `INR ${parseNumber(plannerFeeRupees).toLocaleString("en-IN")}` : "Not set";
  const advanceDue = Math.round((advancePercentFromTerms(paymentTerms) / 100) * totalBudgetRupees);

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="min-h-0 overflow-y-auto pr-1">
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

      <div className="min-h-0 overflow-y-auto pl-1">
        <ReviewConfirmPanel
          coupleLabel={coupleLabel}
          weddingDateLabel={formatDate(coupleForm.weddingDate)}
          cityVenueLabel={cityVenueLabel}
          selectedCultures={selectedCultures}
          reviewEvents={reviewEvents}
          totalBudgetLabel={toLakhLabel(totalBudgetRupees)}
          plannerFeeLabel={plannerFeeLabel}
          paymentTermsLabel={paymentTermLabels[paymentTerms] ?? paymentTerms}
          advanceDueLabel={`INR ${advanceDue.toLocaleString("en-IN")}`}
          weddingDate={coupleForm.weddingDate}
        />
      </div>
    </div>
  );
}
