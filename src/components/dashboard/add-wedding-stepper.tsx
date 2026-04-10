"use client";

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
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">Step {step} of 3</p>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {steps.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                item.id <= step ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {item.id}
            </span>
            <span className={cn(item.id <= step ? "text-foreground" : "text-muted-foreground")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
