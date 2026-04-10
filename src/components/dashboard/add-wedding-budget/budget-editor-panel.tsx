"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetAllocation } from "../../../../budgetAI";

export type BudgetVisibility = "planner" | "shared" | "transparent";

type BudgetEditorPanelProps = {
  budgetRupees: string;
  onBudgetRupeesChange: (next: string) => void;
  plannerFeeRupees: string;
  onPlannerFeeRupeesChange: (next: string) => void;
  budgetVisibility: BudgetVisibility;
  onBudgetVisibilityChange: (next: BudgetVisibility) => void;
  paymentTerms: string;
  onPaymentTermsChange: (next: string) => void;
  allocations: BudgetAllocation[];
  totalBudgetRupeesLabel: string;
  contextLine: string;
};

const visibilityOptions: Array<{
  id: BudgetVisibility;
  title: string;
  description: string;
  badge?: string;
}> = [
  {
    id: "planner",
    title: "Planner manages fully",
    description: "You control all budget visibility. Family sees only what you share with them explicitly.",
    badge: "Recommended",
  },
  {
    id: "shared",
    title: "Shared with client family",
    description: "Each family sees their side's line items. Cross-family amounts stay private between both sides.",
  },
  {
    id: "transparent",
    title: "Fully transparent",
    description: "Both families can see all budget items. Best for close-knit families with shared expenses.",
  },
];

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(n)));
}

export function BudgetEditorPanel({
  budgetRupees,
  onBudgetRupeesChange,
  plannerFeeRupees,
  onPlannerFeeRupeesChange,
  budgetVisibility,
  onBudgetVisibilityChange,
  paymentTerms,
  onPaymentTermsChange,
  allocations,
  totalBudgetRupeesLabel,
  contextLine,
}: BudgetEditorPanelProps) {
  return (
    <div className="space-y-4 pr-1">
      <div>
        <h3 className="text-3xl font-semibold tracking-tight">Budget</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the total budget, allocate across categories, and choose what the family can see.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Total wedding budget</p>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/20 px-3 py-2">
          <span className="text-lg font-semibold text-muted-foreground">INR</span>
          <Input
            className="h-10 border-0 bg-transparent px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            inputMode="numeric"
            value={budgetRupees}
            onChange={(e) => onBudgetRupeesChange(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">= {totalBudgetRupeesLabel}</p>
        <p className="text-sm text-muted-foreground">{contextLine}</p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-3 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Allocate by category (optional)
          </p>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            {allocations.map((row) => (
              <div key={row.categoryId} className="h-full bg-emerald-500/90" style={{ width: `${row.percentage}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-[1.3fr_1fr_auto] gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <p>Category</p>
            <p>Amount (INR)</p>
            <p>%</p>
          </div>
          <div className="space-y-2">
            {allocations.map((row) => (
              <div key={row.categoryId} className="grid grid-cols-[1.3fr_1fr_auto] items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
                <p className="text-sm font-semibold">{row.label}</p>
                <p className="rounded-md border border-input bg-muted/20 px-2 py-1 text-sm font-semibold">
                  {formatInr(row.estimatedAmount / 100)}
                </p>
                <Badge variant="outline" className="rounded-md text-[11px]">
                  {row.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Budget visibility</p>
        <div className="space-y-2">
          {visibilityOptions.map((option) => {
            const isSelected = budgetVisibility === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onBudgetVisibilityChange(option.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : "border-border/70 bg-card hover:border-emerald-500/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{option.title}</p>
                  {option.badge ? (
                    <Badge variant="secondary" className="rounded-md text-[11px]">
                      {option.badge}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Your planner fee (INR) optional</p>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/20 px-3 py-2">
          <span className="text-lg font-semibold text-muted-foreground">INR</span>
          <Input
            className="h-10 border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
            inputMode="numeric"
            placeholder="e.g. 150000"
            value={plannerFeeRupees}
            onChange={(e) => onPlannerFeeRupeesChange(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
        <p className="text-sm text-muted-foreground">Never visible to the client family. Used for your own P and L tracking.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Client payment schedule</p>
        <Select value={paymentTerms} onValueChange={(value) => value && onPaymentTermsChange(value)}>
          <SelectTrigger className="h-10 w-full rounded-xl bg-muted/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50-50">50% advance, 50% on wedding day</SelectItem>
            <SelectItem value="40-40-20">40% booking, 40% mid-way, 20% on wedding week</SelectItem>
            <SelectItem value="30-40-30">30% booking, 40% planning phase, 30% before wedding</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
