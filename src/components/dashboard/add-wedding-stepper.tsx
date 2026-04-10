"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type WeddingFlowStep = 1 | 2 | 3;

const steps: { id: WeddingFlowStep; label: string }[] = [
  { id: 1, label: "The couple" },
  { id: 2, label: "Events" },
  { id: 3, label: "Budget & review" },
];

type AddWeddingStepperProps = {
  step: WeddingFlowStep;
};

export function AddWeddingStepper({ step }: AddWeddingStepperProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Step {step} of 3</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {steps.map((item) => {
          const isDone = item.id < step;
          const isCurrent = item.id === step;
          const isActive = item.id <= step;

          return (
            <div key={item.id} className="space-y-2">
              <div className={cn("h-1 rounded-full transition-colors", isActive ? "bg-emerald-500" : "bg-muted")} />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : item.id}
                </span>
                <span className={cn(isActive ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
