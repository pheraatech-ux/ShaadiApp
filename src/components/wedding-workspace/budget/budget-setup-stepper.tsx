"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type BudgetSetupStep = 1 | 2 | 3;

const steps: { id: BudgetSetupStep; label: string }[] = [
  { id: 1, label: "Total budget" },
  { id: 2, label: "Review" },
  { id: 3, label: "Confirm" },
];

type BudgetSetupStepperProps = {
  step: BudgetSetupStep;
};

export function BudgetSetupStepper({ step }: BudgetSetupStepperProps) {
  return (
    <nav>
      {steps.map((item, index) => {
        const isDone = item.id < step;
        const isCurrent = item.id === step;

        return (
          <div key={item.id}>
            <div className="flex items-start gap-3">
              <div className="flex w-6 flex-col items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : item.id}
                </span>
              </div>
              <span
                className={cn(
                  "pt-0.5 text-sm",
                  isCurrent ? "font-semibold text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex w-6 justify-center py-1">
                <div className={cn("h-7 w-px", isDone ? "bg-emerald-500" : "bg-border")} />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
