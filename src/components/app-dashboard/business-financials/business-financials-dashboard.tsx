"use client";

import { useState } from "react";

import { AppPageHeader } from "@/components/app-dashboard/dashboard/app-page-header";
import { Badge } from "@/components/ui/badge";

import { OverviewTab } from "./overview-tab";
import { OpsExpensesTab } from "./ops-expenses-tab";
import { ForecastingTab } from "./forecasting-tab";
import { ExpensesPanel } from "./expenses-panel";
import type { PeriodFilter } from "./types";

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

type Tab = "overview" | "expenses" | "forecasting" | "wedding-portfolio";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Business Overview" },
  { id: "expenses", label: "Ops Expenses" },
  { id: "forecasting", label: "Forecasting" },
  { id: "wedding-portfolio", label: "Wedding Portfolio" },
];

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
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Portfolio total</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(totalBudgetPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all accessible weddings</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Allocated</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(totalAllocatedPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Planner line items planned</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="mt-1 text-2xl font-semibold">{toInr(totalSpentPaise)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{portfolioUtilizationPercent}% utilization</p>
        </article>
        <article className="rounded-xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground">Weddings at risk</p>
          <p className="mt-1 text-2xl font-semibold">{weddingsAtRisk}</p>
          <p className="mt-1 text-xs text-muted-foreground">Watch and overrun status combined</p>
        </article>
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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [forecastPeriod] = useState<PeriodFilter>("ytd");
  const [showExpensesPanel, setShowExpensesPanel] = useState(false);

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
      <AppPageHeader
        title="Financials"
        description="Business revenue, operations expenses, forecasting and wedding portfolio"
      />

      {/* Tab bar */}
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab totalWeddings={totalWeddings} />}
      {activeTab === "expenses" && (
        <OpsExpensesTab onShowAllEntries={() => setShowExpensesPanel(true)} />
      )}
      {activeTab === "forecasting" && (
        <ForecastingTab totalWeddings={totalWeddings} period={forecastPeriod} />
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
