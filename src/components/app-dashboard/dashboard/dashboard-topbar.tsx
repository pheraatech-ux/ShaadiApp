"use client";

import confetti from "canvas-confetti";
import { Building2 } from "lucide-react";
import { ReactNode, useCallback, useRef } from "react";

import { GlobalSearch } from "@/components/app-dashboard/dashboard/global-search";
import { PageTitle } from "@/components/app-dashboard/dashboard/page-title";
import { ThemeToggle } from "@/components/app-dashboard/dashboard/theme-toggle";

type DashboardTopbarProps = {
  greeting: string;
  workspaceName?: string;
  actions?: ReactNode;
};

function BusinessNamePill({ name }: { name: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fireConfetti = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.88;
    const y = rect ? rect.bottom / window.innerHeight : 0.06;

    confetti({
      particleCount: 100,
      angle: 270,
      spread: 120,
      startVelocity: 10,
      gravity: 0.5,
      origin: { x, y },
      colors: ["#f43f5e", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc"],
      scalar: 0.85,
      ticks: 200,
    });
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={fireConfetti}
      className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2 transition-colors hover:bg-muted lg:flex"
      title="🎉"
    >
      <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="max-w-[180px] truncate text-xs font-medium text-foreground/80">
        {name}
      </span>
    </button>
  );
}

export function DashboardTopbar({ greeting: _greeting, workspaceName, actions }: DashboardTopbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageTitle />
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        {actions}
        <ThemeToggle />
        {workspaceName && <BusinessNamePill name={workspaceName} />}
      </div>
    </div>
  );
}
