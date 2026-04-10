"use client";

import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

import {
  AddWeddingCoupleStep,
  type AddWeddingCoupleForm,
} from "@/components/dashboard/add-wedding-couple-step";
import {
  AddWeddingStepper,
  type WeddingFlowStep,
} from "@/components/dashboard/add-wedding-stepper";
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

type AddWeddingFlowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddWeddingFlowDialog({ open, onOpenChange }: AddWeddingFlowDialogProps) {
  const [step, setStep] = useState<WeddingFlowStep>(1);
  const [showStepOneErrors, setShowStepOneErrors] = useState(false);
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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetFlowState();
    }
    onOpenChange(nextOpen);
  }

  const isLastStep = step === 3;

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

        <div className="max-h-[64vh] overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <AddWeddingCoupleStep
              value={coupleForm}
              onChange={setCoupleForm}
              showErrors={showStepOneErrors}
            />
          ) : step === 2 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
              Events step coming next.
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
              Budget and review step coming next.
            </div>
          )}
        </div>

        <DialogFooter className="mt-0 flex-row items-center justify-end rounded-none border-t bg-card px-6 py-3 sm:justify-end">
          <div className="pb-4 flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-xl"
              disabled={step === 1}
              onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as WeddingFlowStep) : prev))}
            >
              Back
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => {
                if (isLastStep) {
                  handleOpenChange(false);
                  return;
                }
                if (step === 1 && !isStepOneValid()) {
                  setShowStepOneErrors(true);
                  return;
                }
                setShowStepOneErrors(false);
                setStep((prev) => (prev < 3 ? ((prev + 1) as WeddingFlowStep) : prev));
              }}
            >
              {isLastStep ? "Create wedding" : "Continue"}
              <ArrowRight />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
