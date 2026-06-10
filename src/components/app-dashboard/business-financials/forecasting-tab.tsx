"use client";

import { useState } from "react";
import { BotIcon, SendIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { FinancialKpiCard } from "./financial-kpi-card";
import { DEFAULT_EXPENSE_CATEGORIES, getPeriodDisplayLabel, REVENUE_CATEGORIES, type PeriodFilter } from "./types";
import { filterByPeriod, sumRupees, useFinancialData } from "./use-financial-data";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^#{1,3}\s+(.+)$/gm, "<p class='font-semibold text-foreground mt-3 mb-1'>$1</p>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n{2,}/g, "</p><p class='mt-2'>")
    .replace(/\n/g, "<br/>");
}

export function ForecastingTab({
  totalWeddings,
  period,
}: {
  totalWeddings: number;
  period: PeriodFilter;
}) {
  const { data, ready } = useFinancialData();
  const [forecast, setForecast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-xl bg-muted/40" />;
  }

  const revenueInPeriod = filterByPeriod(data.revenueEntries, period);
  const expensesInPeriod = filterByPeriod(data.expenseEntries, period);

  const totalRevenue = sumRupees(revenueInPeriod);
  const totalExpenses = sumRupees(expensesInPeriod);
  const grossMargin = totalRevenue > 0
    ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)
    : "0.0";
  const overdueReceivables = sumRupees(data.overdueReceivables);

  const allExpenseCats = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...data.customExpenseCategories,
  ];

  const revenueByCategory: Record<string, number> = {};
  for (const cat of REVENUE_CATEGORIES) {
    const total = sumRupees(revenueInPeriod.filter((e) => e.category === cat.id));
    if (total > 0) revenueByCategory[cat.label] = total;
  }

  const expensesByCategory: Record<string, number> = {};
  for (const cat of allExpenseCats) {
    const total = sumRupees(expensesInPeriod.filter((e) => e.categoryId === cat.id));
    if (total > 0) expensesByCategory[cat.label] = total;
  }

  const hasData = totalRevenue > 0 || totalExpenses > 0;

  const periodLabel = getPeriodDisplayLabel(period);

  async function generateForecast(message?: string) {
    setLoading(true);
    setError("");
    setForecast("");
    try {
      const res = await fetch("/api/business/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revenueByCategory,
          totalRevenue,
          totalExpenses,
          expensesByCategory,
          overdueReceivables,
          activeWeddings: totalWeddings,
          period: periodLabel,
          userMessage: message ?? "",
        }),
      });
      const json = (await res.json()) as { forecast?: string; error?: string };
      if (json.error) {
        setError(json.error);
      } else {
        setForecast(json.forecast ?? "");
        setHasGenerated(true);
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialKpiCard
          centered
          label="Revenue"
          value={INR(totalRevenue)}
          sub={periodLabel}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <FinancialKpiCard
          centered
          label="Expenses"
          value={INR(totalExpenses)}
          sub={periodLabel}
        />
        <FinancialKpiCard
          centered
          label="Gross Margin"
          value={`${grossMargin}%`}
          valueClassName={
            parseFloat(grossMargin) >= 50
              ? "text-green-600 dark:text-green-400"
              : parseFloat(grossMargin) >= 25
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
          }
        />
        <FinancialKpiCard
          centered
          label="Overdue Receivables"
          value={INR(overdueReceivables)}
          valueClassName={overdueReceivables > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
      </section>

      <div>
        <h2 className="text-sm font-semibold">Financial Forecasting</h2>
        <p className="text-xs text-muted-foreground">
          AI-powered analysis based on your revenue and expense data ({periodLabel})
        </p>
      </div>

      {!hasData && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Add financial data first</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Go to the Business Overview or Operations Expenses tabs to add revenue and expense entries. The AI will use this data to generate meaningful forecasts.
          </p>
        </div>
      )}

      {/* AI Panel */}
      <section className="rounded-xl border border-border/70 bg-card">
        <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
          <BotIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">AI Financial Advisor</h3>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Claude
          </span>
        </div>

        <div className="p-4">
          {!hasGenerated && !loading && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <SparklesIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Generate a financial forecast</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The AI will analyze your current revenue, expenses, and active weddings to provide tailored insights and projections.
                </p>
              </div>
              <Button onClick={() => generateForecast()} disabled={!hasData || loading}>
                <SparklesIcon className="h-4 w-4" />
                Generate Forecast
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Analyzing your financials…</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {forecast && !loading && (
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground [&_li]:mt-1 [&_p]:mt-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(forecast) }}
            />
          )}
        </div>

        {/* Follow-up input */}
        {hasGenerated && !loading && (
          <div className="border-t border-border/70 p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask a follow-up question… e.g. 'How do I increase vendor commission revenue?' or 'What if I take on 3 more weddings?'"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (userMessage.trim()) {
                      generateForecast(userMessage.trim());
                      setUserMessage("");
                    }
                  }
                }}
              />
              <Button
                size="icon-sm"
                onClick={() => {
                  if (userMessage.trim()) {
                    generateForecast(userMessage.trim());
                    setUserMessage("");
                  }
                }}
                disabled={!userMessage.trim()}
                className="self-end"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Press Enter to send · Shift+Enter for newline</p>
          </div>
        )}

        {hasGenerated && !loading && (
          <div className="border-t border-border/70 px-4 py-2">
            <button
              onClick={() => generateForecast()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Regenerate forecast
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
