"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { BudgetSetupStepper, type BudgetSetupStep } from "./budget-setup-stepper";
import { BudgetSetupHowItWorks } from "./budget-setup-how-it-works";
import { BudgetSetupStepTotal } from "./budget-setup-step-total";
import { BudgetSetupStepAllocation } from "./budget-setup-step-allocation";
import { BudgetSetupStepConfirm } from "./budget-setup-step-confirm";
import { Button } from "@/components/ui/button";
import { buildFallbackAllocation, type WeddingBudgetInput, type BudgetAllocation } from "../../../../budgetAI";
import type { CultureId } from "../../../../weddingCultures";

type BudgetSetupFlowProps = {
  weddingSlug: string;
  coupleName: string;
  cultures: string[];
  initialBudgetPaise: number;
};

// Proportionally rescale all other rows so total stays at 100%.
// The last "other" row absorbs any rounding remainder.
function redistributeProportionally(
  allocations: BudgetAllocation[],
  currentPcts: Record<string, string>,
  changedId: string,
  newPct: number,
): Record<string, string> {
  const clamped = Math.min(100, Math.max(0, newPct));
  const others = allocations.filter((r) => r.categoryId !== changedId);
  const sumOthers = others.reduce((s, r) => s + (parseFloat(currentPcts[r.categoryId] ?? String(r.percentage)) || 0), 0);
  const targetRemaining = 100 - clamped;

  const result: Record<string, string> = { ...currentPcts, [changedId]: String(clamped) };

  if (others.length === 0) return result;

  if (sumOthers <= 0) {
    // Nothing to scale from — split evenly
    const share = Math.round((targetRemaining / others.length) * 100) / 100;
    for (const other of others) result[other.categoryId] = String(share);
    return result;
  }

  let assigned = 0;
  for (let i = 0; i < others.length; i++) {
    const other = others[i];
    const oldPct = parseFloat(currentPcts[other.categoryId] ?? String(other.percentage)) || 0;
    if (i === others.length - 1) {
      // Last row absorbs rounding remainder
      const remainder = Math.round((targetRemaining - assigned) * 100) / 100;
      result[other.categoryId] = String(Math.max(0, remainder));
    } else {
      const scaled = Math.round((oldPct / sumOthers) * targetRemaining * 100) / 100;
      result[other.categoryId] = String(scaled);
      assigned += scaled;
    }
  }

  return result;
}

export function BudgetSetupFlow({ weddingSlug, coupleName, cultures, initialBudgetPaise }: BudgetSetupFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<BudgetSetupStep>(1);
  const [budgetRupees, setBudgetRupees] = useState(
    initialBudgetPaise > 0 ? String(Math.round(initialBudgetPaise / 100)) : "",
  );
  const [userPcts, setUserPcts] = useState<Record<string, string>>({});
  const [autoAdjust, setAutoAdjust] = useState(true);
  const userPctsInitialized = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalBudgetPaise = budgetRupees ? Math.max(0, parseInt(budgetRupees, 10)) * 100 : 0;
  const totalBudgetRupees = Math.round(totalBudgetPaise / 100);

  const fallbackInput: WeddingBudgetInput = useMemo(
    () => ({
      totalBudgetPaise,
      cultures: cultures as CultureId[],
      weddingCity: "Not specified",
      estimatedGuestCount: undefined,
      numberOfEvents: 5,
      numberOfDays: 2,
      includeDecor: true,
      includePhotography: true,
      isDestinationWedding: false,
      venueTier: "mid",
    }),
    [totalBudgetPaise, cultures],
  );

  const allocationResult = useMemo(() => buildFallbackAllocation(fallbackInput), [fallbackInput]);
  const sortedAllocations = useMemo(
    () => [...allocationResult.allocations].sort((a, b) => b.percentage - a.percentage),
    [allocationResult.allocations],
  );

  // Initialise user percentages once from the suggested allocations
  useEffect(() => {
    if (!userPctsInitialized.current && sortedAllocations.length > 0) {
      userPctsInitialized.current = true;
      const init: Record<string, string> = {};
      for (const row of sortedAllocations) init[row.categoryId] = String(row.percentage);
      setUserPcts(init);
    }
  }, [sortedAllocations]);

  function handleAutoAdjustChange(next: boolean) {
    if (next) {
      // Switching to Linked — normalize current values to sum to 100, preserving relative weights.
      // If total is 0, fall back to AI suggestions.
      setUserPcts((prev) => {
        const total = sortedAllocations.reduce(
          (s, r) => s + (parseFloat(prev[r.categoryId] ?? String(r.percentage)) || 0),
          0,
        );
        if (total <= 0) {
          const reset: Record<string, string> = {};
          for (const r of sortedAllocations) reset[r.categoryId] = String(r.percentage);
          return reset;
        }
        const factor = 100 / total;
        const result: Record<string, string> = {};
        let assigned = 0;
        for (let i = 0; i < sortedAllocations.length; i++) {
          const r = sortedAllocations[i];
          const oldPct = parseFloat(prev[r.categoryId] ?? String(r.percentage)) || 0;
          if (i === sortedAllocations.length - 1) {
            result[r.categoryId] = String(Math.round((100 - assigned) * 100) / 100);
          } else {
            const scaled = Math.round(oldPct * factor * 100) / 100;
            result[r.categoryId] = String(scaled);
            assigned += scaled;
          }
        }
        return result;
      });
    }
    setAutoAdjust(next);
  }

  function handleUserPctChange(categoryId: string, value: string) {
    const parsed = parseFloat(value) || 0;
    if (autoAdjust) {
      setUserPcts((prev) => redistributeProportionally(sortedAllocations, prev, categoryId, parsed));
    } else {
      setUserPcts((prev) => ({ ...prev, [categoryId]: value }));
    }
  }

  function handleUserAmountChange(categoryId: string, amountStr: string) {
    if (totalBudgetRupees === 0) return;
    const amount = parseFloat(amountStr) || 0;
    const derivedPct = (amount / totalBudgetRupees) * 100;
    if (autoAdjust) {
      setUserPcts((prev) => redistributeProportionally(sortedAllocations, prev, categoryId, derivedPct));
    } else {
      setUserPcts((prev) => ({ ...prev, [categoryId]: String(Math.round(derivedPct * 100) / 100) }));
    }
  }

  async function handleComplete() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/budget`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalBudgetRupees: Math.max(0, parseInt(budgetRupees || "0", 10)),
          completeBudgetSetup: true,
        }),
      });
      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errBody?.error ?? "Unable to save budget.");
      }
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to save budget.");
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (step === 3) void handleComplete();
    else setStep((prev) => (prev < 3 ? ((prev + 1) as BudgetSetupStep) : prev));
  }

  function handleBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as BudgetSetupStep) : prev));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Create wedding budget</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {coupleName} · Enter the total budget and review the suggested allocation across categories.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid min-h-[520px] grid-cols-[200px_1fr_240px] divide-x">
          <div className="bg-muted/30 p-6">
            <BudgetSetupStepper step={step} />
          </div>

          <div className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
              {step === 1 && (
                <BudgetSetupStepTotal budgetRupees={budgetRupees} onChange={setBudgetRupees} />
              )}
              {step === 2 && (
                <BudgetSetupStepAllocation
                  allocations={sortedAllocations}
                  totalBudgetRupees={totalBudgetRupees}
                  userPcts={userPcts}
                  autoAdjust={autoAdjust}
                  onAutoAdjustChange={handleAutoAdjustChange}
                  onUserPctChange={handleUserPctChange}
                  onUserAmountChange={handleUserAmountChange}
                />
              )}
              {step === 3 && (
                <BudgetSetupStepConfirm
                  budgetRupees={budgetRupees}
                  allocations={sortedAllocations}
                  userPcts={userPcts}
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t px-8 py-4">
              <div>
                {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <Button variant="ghost" className="rounded-xl" disabled={isSubmitting} onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button
                  className="rounded-xl"
                  disabled={isSubmitting || (step === 1 && !budgetRupees)}
                  onClick={handleNext}
                >
                  {step === 3 ? (isSubmitting ? "Saving…" : "Set up budget") : "Continue"}
                  {step < 3 && <ArrowRight className="size-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-muted/20 p-6">
            <BudgetSetupHowItWorks />
          </div>
        </div>
      </div>
    </div>
  );
}
