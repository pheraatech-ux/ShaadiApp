"use client";

import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AddWeddingCoupleStep,
  type AddWeddingCoupleForm,
} from "@/components/app-dashboard/dashboard/add-wedding-couple-step";
import {
  AddWeddingEventsStep,
  type EventsTab,
} from "@/components/app-dashboard/dashboard/add-wedding-events-step";
import { AddWeddingBudgetStep } from "@/components/app-dashboard/budget/add-wedding-budget-step";
import { ReviewConfirmPanel } from "@/components/app-dashboard/add-wedding-budget/review-confirm-panel";
import {
  AddWeddingStepper,
  type WeddingFlowStep,
} from "@/components/app-dashboard/dashboard/add-wedding-stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type CultureId,
  type WeddingEvent,
} from "../../../../weddingCultures";

type AddWeddingFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(date?: Date) {
  if (!date) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function toLakhLabel(rupees: number) {
  if (!rupees) return "Not set";
  const lakh = rupees / 100000;
  return `INR ${lakh.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`;
}

export function AddWeddingFlowDialog({ open, onOpenChange }: AddWeddingFlowDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<WeddingFlowStep>(1);
  const [showStepOneErrors, setShowStepOneErrors] = useState(false);
  const [showCultureErrors, setShowCultureErrors] = useState(false);
  const [eventsTab, setEventsTab] = useState<EventsTab>("choose-culture");
  const [selectedCultureIds, setSelectedCultureIds] = useState<CultureId[]>([]);
  const [eventsAiResolved, setEventsAiResolved] = useState(false);
  const [reviewEvents, setReviewEvents] = useState<WeddingEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totalBudgetPaise, setTotalBudgetPaise] = useState(0);
  const [coupleForm, setCoupleForm] = useState<AddWeddingCoupleForm>({
    brideName: "",
    groomName: "",
    weddingDate: undefined,
    city: "",
    venueName: "",
    brideFamilyContact: "",
    groomFamilyContact: "",
  });

  function resetFlowState() {
    setStep(1);
    setShowStepOneErrors(false);
    setShowCultureErrors(false);
    setEventsTab("choose-culture");
    setSelectedCultureIds([]);
    setReviewEvents([]);
    setIsSubmitting(false);
    setSubmitError(null);
    setTotalBudgetPaise(0);
    setCoupleForm({
      brideName: "",
      groomName: "",
      weddingDate: undefined,
      city: "",
      venueName: "",
      brideFamilyContact: "",
      groomFamilyContact: "",
    });
  }

  function isStepOneValid() {
    return Boolean(coupleForm.brideName.trim()) && Boolean(coupleForm.groomName.trim());
  }

  async function handleCreateWedding() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/weddings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brideName: coupleForm.brideName,
          groomName: coupleForm.groomName,
          weddingDate: coupleForm.weddingDate ? coupleForm.weddingDate.toISOString().slice(0, 10) : null,
          city: coupleForm.city,
          venueName: coupleForm.venueName,
          cultures: selectedCultureIds,
          totalBudgetPaise,
          events: reviewEvents.map((event) => ({
            title: event.name,
            cultureLabel: event.cultures[0] ?? null,
          })),
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errBody?.error ?? "Unable to create wedding right now.");
      }

      const payload = (await response.json()) as { weddingSlug: string };
      handleOpenChange(false);
      router.refresh();
      router.push(`/app/weddings/${payload.weddingSlug}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create wedding.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetFlowState();
    }
    onOpenChange(nextOpen);
  }

  const isLastStep = step === 4;
  const isReviewEventsTab = step === 2 && eventsTab === "review-events";

  const coupleLabel = `${coupleForm.brideName || "Bride"} & ${coupleForm.groomName || "Groom"}`;
  const cityVenueLabel = [coupleForm.city || "City", coupleForm.venueName || "Venue"].join(" · ");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[860px] gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-[860px]" showCloseButton={false}>
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="sr-only">Add wedding</DialogTitle>
              <DialogDescription className="sr-only">
                Multi-step form to create a wedding workspace.
              </DialogDescription>
              <AddWeddingStepper step={step} />
            </div>
            <DialogClose render={<Button variant="ghost" size="icon-sm" className="rounded-full" />}>
              <X />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className={cn("px-6 py-5", step === 4 ? "h-[64vh] overflow-y-auto" : "max-h-[64vh] overflow-y-auto")}>
          {step === 1 ? (
            <AddWeddingCoupleStep
              value={coupleForm}
              onChange={setCoupleForm}
              showErrors={showStepOneErrors}
            />
          ) : step === 2 ? (
            <AddWeddingEventsStep
              selectedCultures={selectedCultureIds}
              onSelectedCulturesChange={(next) => {
                setSelectedCultureIds(next);
                setReviewEvents([]);
                setEventsAiResolved(false);
                if (next.length > 0) {
                  setShowCultureErrors(false);
                }
              }}
              reviewEvents={reviewEvents}
              onReviewEventsChange={setReviewEvents}
              activeTab={eventsTab}
              onActiveTabChange={setEventsTab}
              showCultureError={showCultureErrors}
              onAiResolved={() => setEventsAiResolved(true)}
            />
          ) : step === 3 ? (
            <AddWeddingBudgetStep
              onBudgetChange={(b) => setTotalBudgetPaise(b.totalBudgetPaise)}
            />
          ) : (
            <ReviewConfirmPanel
              coupleLabel={coupleLabel}
              weddingDateLabel={formatDate(coupleForm.weddingDate)}
              cityVenueLabel={cityVenueLabel}
              selectedCultures={selectedCultureIds}
              reviewEvents={reviewEvents}
              totalBudgetLabel={toLakhLabel(totalBudgetPaise / 100)}
              weddingDate={coupleForm.weddingDate}
            />
          )}
        </div>

        <DialogFooter className="mt-0 flex-row items-center justify-end rounded-none border-t bg-card px-6 py-3 sm:justify-end">
          <div className="pb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-xl"
              disabled={step === 1 || isSubmitting}
              onClick={() => {
                if (isReviewEventsTab) {
                  setEventsTab("choose-culture");
                  return;
                }
                setStep((prev) => (prev > 1 ? ((prev - 1) as WeddingFlowStep) : prev));
              }}
            >
              Back
            </Button>
            <Button
              className="rounded-xl"
              disabled={isSubmitting || (isReviewEventsTab && !eventsAiResolved)}
              onClick={() => {
                if (isLastStep) {
                  void handleCreateWedding();
                  return;
                }
                if (step === 1 && !isStepOneValid()) {
                  setShowStepOneErrors(true);
                  return;
                }
                if (step === 2) {
                  if (selectedCultureIds.length === 0) {
                    setShowCultureErrors(true);
                    setEventsTab("choose-culture");
                    return;
                  }
                  setShowCultureErrors(false);
                  if (eventsTab === "choose-culture") {
                    setEventsTab("review-events");
                    return;
                  }
                }
                setShowStepOneErrors(false);
                setStep((prev) => (prev < 4 ? ((prev + 1) as WeddingFlowStep) : prev));
              }}
            >
              {isLastStep
                ? isSubmitting
                  ? "Creating..."
                  : "Create wedding"
                : step === 2 && eventsTab === "choose-culture"
                  ? "Review events"
                  : step === 2 && eventsTab === "review-events"
                    ? "Continue to budget"
                    : step === 3
                      ? "Review and confirm"
                      : "Continue"}
              <ArrowRight />
            </Button>
          </div>
          {submitError ? (
            <p className="pb-2 text-sm text-destructive">{submitError}</p>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
