"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const SETUP_DURATION_MS = 5000;

const SETUP_STEPS = [
  { id: "workspace", label: "Creating wedding workspace" },
  { id: "events", label: "Building event timeline" },
  { id: "budget", label: "Configuring budget tracker" },
  { id: "tasks", label: "Preparing task templates" },
  { id: "dashboard", label: "Finalising your dashboard" },
] as const;

type WorkspaceSetupOverlayProps = {
  coupleLabel: string;
  onComplete: () => void;
};

type StepStatus = "pending" | "active" | "done";

function getStepStatuses(elapsedMs: number): StepStatus[] {
  const stepDuration = SETUP_DURATION_MS / SETUP_STEPS.length;
  return SETUP_STEPS.map((_, index) => {
    const stepStart = index * stepDuration;
    const stepEnd = (index + 1) * stepDuration;
    if (elapsedMs >= stepEnd) return "done";
    if (elapsedMs >= stepStart) return "active";
    return "pending";
  });
}

export function WorkspaceSetupOverlay({ coupleLabel, onComplete }: WorkspaceSetupOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const nextElapsed = Math.min(now - startedAt, SETUP_DURATION_MS);
      setElapsedMs(nextElapsed);
      if (nextElapsed < SETUP_DURATION_MS) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    const completeTimer = window.setTimeout(onComplete, SETUP_DURATION_MS);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const progress = (elapsedMs / SETUP_DURATION_MS) * 100;
  const stepStatuses = getStepStatuses(elapsedMs);
  const activeStepIndex = stepStatuses.findIndex((status) => status === "active");
  const statusMessage =
    activeStepIndex >= 0 ? SETUP_STEPS[activeStepIndex].label : SETUP_STEPS[SETUP_STEPS.length - 1].label;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 px-4 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.14),transparent),radial-gradient(ellipse_55%_45%_at_85%_100%,rgba(16,185,129,0.08),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-5 w-fit">
            <div className="absolute inset-0 scale-125 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="relative flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <Loader2 className="size-7 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
            Setting up workspace
          </p>
          <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            {coupleLabel}
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMessage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {statusMessage}…
            </motion.p>
          </AnimatePresence>
        </div>

        <ul className="space-y-2.5">
          {SETUP_STEPS.map((step, index) => {
            const status = stepStatuses[index];
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300",
                  status === "done" && "border-emerald-500/25 bg-emerald-500/[0.06]",
                  status === "active" && "border-emerald-500/35 bg-emerald-500/[0.08]",
                  status === "pending" && "border-border/60 bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    status === "done" && "border-emerald-500 bg-emerald-500 text-white",
                    status === "active" && "border-emerald-500/70 bg-emerald-500/10",
                    status === "pending" && "border-border bg-background",
                  )}
                >
                  {status === "done" ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : status === "active" ? (
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    status === "done" && "text-foreground",
                    status === "active" && "font-medium text-foreground",
                    status === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            This usually takes a few seconds
          </p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
