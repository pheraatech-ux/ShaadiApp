"use client";

import { X } from "lucide-react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";

import { Button } from "@/components/ui/button";

const TOUR_DONE_KEY = "shaadi_tour_v1_done";

function markTourDone() {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOUR_DONE_KEY, "1");
  }
}

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda } = useOnborda();
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  function handleClose() {
    markTourDone();
    closeOnborda();
  }

  function handleDone() {
    markTourDone();
    closeOnborda();
  }

  return (
    <div className="relative z-[9999] w-72 rounded-2xl border border-border/60 bg-background p-5 shadow-2xl">
      {arrow}
      <button
        onClick={handleClose}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Skip tour"
      >
        <X className="size-4" />
      </button>

      <div className="mb-3 flex items-center gap-2 pr-6">
        {step.icon && <span className="text-base leading-none">{step.icon}</span>}
        <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
      </div>

      <div className="mb-5 text-sm leading-relaxed text-muted-foreground">{step.content}</div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-4 bg-emerald-500" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {!isFirst && (
            <Button variant="outline" size="sm" onClick={prevStep} className="h-8 rounded-lg text-xs">
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={isLast ? handleDone : nextStep}
            className="h-8 rounded-lg bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isLast ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
