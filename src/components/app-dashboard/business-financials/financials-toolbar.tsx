"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AddCategoryDialog } from "./add-category-dialog";
import { AddExpenseDialog } from "./add-expense-dialog";
import { AddRevenueDialog } from "./add-revenue-dialog";
import { PERIOD_SHORT_LABELS, type PeriodFilter } from "./types";

export type FinancialsTab = "overview" | "expenses" | "forecasting" | "wedding-portfolio";

const TABS: { id: FinancialsTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "expenses", label: "Expenses" },
  { id: "forecasting", label: "Forecasting" },
  { id: "wedding-portfolio", label: "Wedding Portfolio" },
];

const PERIODS: PeriodFilter[] = ["ytd", "quarter", "month"];

type Props = {
  activeTab: FinancialsTab;
  onTabChange: (tab: FinancialsTab) => void;
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  expandProgress?: number;
  contentPaddingX?: number;
};

function SegmentButton({
  active,
  onClick,
  children,
  className,
  variant = "tab",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  variant?: "tab" | "period";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap font-medium transition-all",
        variant === "tab"
          ? "rounded-md px-3.5 py-2 text-sm"
          : "rounded-md px-3 py-2 text-sm",
        active
          ? variant === "tab"
            ? "bg-muted/70 text-foreground"
            : "bg-muted text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FinancialsToolbar({
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  expandProgress = 0,
  contentPaddingX = 16,
}: Props) {
  const showControls = activeTab === "overview" || activeTab === "expenses";
  const radius = 12 * (1 - expandProgress);
  const padX = 8 + expandProgress * (contentPaddingX - 8);
  const padY = 8 + expandProgress * 4;

  return (
    <div
      className={cn(
        "border border-border/70 bg-gradient-to-b from-card to-card/80 shadow-sm",
        expandProgress > 0.4 && "border-x-transparent bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85",
        expandProgress > 0.85 && "rounded-none border-t-0 border-b-border/70",
      )}
      style={{
        borderRadius: expandProgress > 0.85 ? 0 : radius,
        paddingLeft: padX,
        paddingRight: padX,
        paddingTop: padY,
        paddingBottom: padY,
      }}
    >
      <div className="flex min-h-10 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Section tabs */}
        <div className="flex min-h-10 min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <SegmentButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </SegmentButton>
          ))}
        </div>

        <div
          className={cn(
            "flex min-h-10 shrink-0 items-center gap-2 sm:gap-3",
            !showControls && "pointer-events-none invisible",
          )}
          aria-hidden={!showControls}
        >
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-1">
            {PERIODS.map((p) => (
              <SegmentButton
                key={p}
                variant="period"
                active={period === p}
                onClick={() => onPeriodChange(p)}
              >
                {PERIOD_SHORT_LABELS[p]}
              </SegmentButton>
            ))}
          </div>

          <div className="hidden h-10 w-px bg-border/70 sm:block" />

          {activeTab === "expenses" ? (
            <div className="flex items-center gap-2">
              <AddCategoryDialog />
              <AddExpenseDialog />
            </div>
          ) : (
            <AddRevenueDialog />
          )}
        </div>
      </div>
    </div>
  );
}
