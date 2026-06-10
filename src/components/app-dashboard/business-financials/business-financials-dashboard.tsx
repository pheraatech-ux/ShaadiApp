"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";

import { FinancialKpiCard } from "./financial-kpi-card";
import { OverviewTab } from "./overview-tab";
import { OpsExpensesTab } from "./ops-expenses-tab";
import { ForecastingTab } from "./forecasting-tab";
import { ExpensesPanel } from "./expenses-panel";
import { FinancialsToolbar, type FinancialsTab } from "./financials-toolbar";
import type { PeriodFilter } from "./types";
import { useToolbarScrollExpand } from "@/components/app-dashboard/use-toolbar-scroll-expand";

type WeddingRow = {
  id: string;
  weddingSlug: string;
  coupleName: string;
  totalBudgetPaise: number;
  allocatedPaise: number;
  spentPaise: number;
  status: "healthy" | "watch" | "overrun";
  cultures: string[];
};

type Props = {
  totalWeddings: number;
  weddingsAtRisk: number;
  weddingRows: WeddingRow[];
  totalBudgetPaise: number;
  totalAllocatedPaise: number;
  totalSpentPaise: number;
  portfolioUtilizationPercent: number;
};

function toInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function WeddingPortfolioTab({
  totalBudgetPaise,
  totalAllocatedPaise,
  totalSpentPaise,
  portfolioUtilizationPercent,
  weddingsAtRisk,
  weddingRows,
}: Omit<Props, "totalWeddings">) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialKpiCard
          centered
          label="Portfolio total"
          value={toInr(totalBudgetPaise)}
          sub="Across all accessible weddings"
        />
        <FinancialKpiCard
          centered
          label="Allocated"
          value={toInr(totalAllocatedPaise)}
          sub="Planner line items planned"
        />
        <FinancialKpiCard
          centered
          label="Spent"
          value={toInr(totalSpentPaise)}
          sub={`${portfolioUtilizationPercent}% utilization`}
        />
        <FinancialKpiCard
          centered
          label="Weddings at risk"
          value={weddingsAtRisk}
          sub="Watch and overrun status combined"
        />
      </section>

      <article className="rounded-xl border border-border/70 bg-card p-4">
        <h2 className="text-sm font-semibold">Wedding budget health</h2>
        <div className="mt-3 space-y-2">
          {weddingRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weddings yet.</p>
          ) : (
            weddingRows.slice(0, 12).map((row) => (
              <div key={row.id} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{row.coupleName}</p>
                  <Badge
                    variant={
                      row.status === "overrun"
                        ? "destructive"
                        : row.status === "watch"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {row.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total {toInr(row.totalBudgetPaise)} · Spent {toInr(row.spentPaise)} · Allocated {toInr(row.allocatedPaise)}
                </p>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}

export function BusinessFinancialsDashboard({
  totalWeddings,
  weddingsAtRisk,
  weddingRows,
  totalBudgetPaise,
  totalAllocatedPaise,
  totalSpentPaise,
  portfolioUtilizationPercent,
}: Props) {
  const [activeTab, setActiveTab] = useState<FinancialsTab>("overview");
  const [period, setPeriod] = useState<PeriodFilter>("ytd");
  const [showExpensesPanel, setShowExpensesPanel] = useState(false);
  const { shellRef, barRef, progress, layout, barHeight, isFloating, floatStyle } =
    useToolbarScrollExpand();

  // Full-screen expenses panel — same takeover pattern as tasks and vendors
  if (showExpensesPanel) {
    return (
      <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] flex-col overflow-hidden sm:-mx-6 sm:-my-6">
        <ExpensesPanel onBack={() => setShowExpensesPanel(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div ref={shellRef}>
        {isFloating && barHeight > 0 ? (
          <div aria-hidden className="pointer-events-none" style={{ height: barHeight }} />
        ) : null}
        <div
          ref={barRef}
          className={isFloating ? undefined : "sticky top-0 z-30"}
          style={floatStyle}
        >
          <FinancialsToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            period={period}
            onPeriodChange={setPeriod}
            expandProgress={progress}
            contentPaddingX={layout.paddingX}
          />
        </div>
      </div>

      {activeTab === "overview" && <OverviewTab totalWeddings={totalWeddings} period={period} />}
      {activeTab === "expenses" && (
        <OpsExpensesTab period={period} onShowAllEntries={() => setShowExpensesPanel(true)} />
      )}
      {activeTab === "forecasting" && (
        <ForecastingTab totalWeddings={totalWeddings} period={period} />
      )}
      {activeTab === "wedding-portfolio" && (
        <WeddingPortfolioTab
          totalBudgetPaise={totalBudgetPaise}
          totalAllocatedPaise={totalAllocatedPaise}
          totalSpentPaise={totalSpentPaise}
          portfolioUtilizationPercent={portfolioUtilizationPercent}
          weddingsAtRisk={weddingsAtRisk}
          weddingRows={weddingRows}
        />
      )}
    </div>
  );
}
