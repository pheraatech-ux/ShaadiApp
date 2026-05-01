"use client";

import {
  Building2,
  UtensilsCrossed,
  Flower2,
  Camera,
  Shirt,
  Music2,
  Paintbrush,
  BookOpen,
  Car,
  Mail,
  Tag,
  Info,
  Lock,
  LockOpen,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import type { BudgetAllocation } from "../../../../budgetAI";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  venue: Building2,
  catering: UtensilsCrossed,
  decor: Flower2,
  photo: Camera,
  photography: Camera,
  outfits: Shirt,
  music: Music2,
  mehendi: Paintbrush,
  priests: BookOpen,
  priest: BookOpen,
  transport: Car,
  invites: Mail,
  invitations: Mail,
  misc: Tag,
};

function formatInr(rupees: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(0, Math.round(rupees)));
}

function CategoryIcon({ categoryId }: { categoryId: string }) {
  const Icon = CATEGORY_ICONS[categoryId.toLowerCase()] ?? Tag;
  return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
}

const colClass = "grid grid-cols-[minmax(90px,1fr)_90px_120px_90px_120px]";

const headerCellClass = "flex items-center justify-center whitespace-nowrap text-center text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground";

type BudgetSetupStepAllocationProps = {
  allocations: BudgetAllocation[];
  totalBudgetRupees: number;
  userPcts: Record<string, string>;
  autoAdjust: boolean;
  onAutoAdjustChange: (v: boolean) => void;
  onUserPctChange: (categoryId: string, value: string) => void;
  onUserAmountChange: (categoryId: string, amountStr: string) => void;
};

export function BudgetSetupStepAllocation({
  allocations,
  totalBudgetRupees,
  userPcts,
  autoAdjust,
  onAutoAdjustChange,
  onUserPctChange,
  onUserAmountChange,
}: BudgetSetupStepAllocationProps) {
  const rows = allocations.map((row) => {
    const rawPct = userPcts[row.categoryId] ?? String(row.percentage);
    const parsedPct = parseFloat(rawPct) || 0;
    const userAmountRupees = Math.round((parsedPct / 100) * totalBudgetRupees);
    return { ...row, rawPct, parsedPct, userAmountRupees };
  });

  const totalUserPct = rows.reduce((s, r) => s + r.parsedPct, 0);
  const totalUserAmount = rows.reduce((s, r) => s + r.userAmountRupees, 0);
  const totalSuggestedAmount = rows.reduce((s, r) => s + Math.round(r.estimatedAmount / 100), 0);
  const pctOff = Math.abs(Math.round(totalUserPct * 10) / 10 - 100) > 0.05;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Step 2 of 3</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">Review suggested allocation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve suggested this allocation based on current industry trends for your location and wedding type.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x rounded-xl border bg-muted/20">
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Total budget (INR)</p>
          <p className="mt-1 text-base font-semibold tabular-nums">₹ {formatInr(totalBudgetRupees)}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Categories</p>
          <p className="mt-1 text-base font-semibold">{allocations.length}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Suggested by</p>
          <p className="mt-1 flex items-center gap-1 text-base font-semibold">
            ShaadiOS Insights
            <Info className="size-3.5 text-muted-foreground" />
          </p>
        </div>
      </div>

      {/* Auto-adjust toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted-foreground">
          {autoAdjust ? "Auto-adjusting to 100%" : "Free edit mode"}
        </span>
        <button
          type="button"
          onClick={() => onAutoAdjustChange(!autoAdjust)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            autoAdjust
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
              : "border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted/60"
          }`}
        >
          {autoAdjust ? <Lock className="size-3" /> : <LockOpen className="size-3" />}
          {autoAdjust ? "Linked" : "Unlinked"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        {/* Header */}
        <div className={`${colClass} gap-x-2 border-b bg-muted/30 px-3 py-2`}>
          <div className={`${headerCellClass} justify-start`}>Category</div>
          <div className={headerCellClass}>Suggested&nbsp;%</div>
          <div className={headerCellClass}>Suggested&nbsp;amount</div>
          <div className={headerCellClass}>Your&nbsp;%</div>
          <div className={headerCellClass}>Amount</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.categoryId} className={`${colClass} items-center gap-x-2 px-3 py-2`}>
              {/* Category */}
              <div className="flex items-center gap-2 overflow-hidden">
                <CategoryIcon categoryId={row.categoryId} />
                <span className="truncate text-sm font-medium">{row.label}</span>
              </div>

              {/* Suggested % */}
              <p className="text-center text-sm text-muted-foreground">{row.percentage}%</p>

              {/* Suggested amount */}
              <p className="text-center text-sm tabular-nums text-muted-foreground">
                ₹&nbsp;{formatInr(row.estimatedAmount / 100)}
              </p>

              {/* Your % — editable */}
              <div className="flex items-center justify-center gap-1">
                <Input
                  className="h-7 w-12 rounded-lg border-border/70 bg-muted/30 px-1 text-center text-sm shadow-none focus-visible:ring-1"
                  inputMode="decimal"
                  value={row.rawPct}
                  onChange={(e) => onUserPctChange(row.categoryId, e.target.value.replace(/[^\d.]/g, ""))}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>

              {/* Amount — editable, derived from pct */}
              <div className="flex items-center justify-center gap-1">
                <Input
                  className="h-7 w-20 rounded-lg border-border/70 bg-muted/30 px-1 text-center text-sm shadow-none focus-visible:ring-1"
                  inputMode="numeric"
                  value={row.userAmountRupees}
                  onChange={(e) => onUserAmountChange(row.categoryId, e.target.value.replace(/[^\d]/g, ""))}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total row */}
        <div className={`${colClass} items-center gap-x-2 border-t bg-muted/20 px-3 py-2.5`}>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Total</p>
          <p className="text-center text-sm font-semibold text-muted-foreground">100%</p>
          <p className="text-center text-sm font-semibold tabular-nums text-muted-foreground">
            ₹&nbsp;{formatInr(totalSuggestedAmount)}
          </p>
          <p className={`text-center text-sm font-semibold tabular-nums ${pctOff ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
            {Math.round(totalUserPct * 10) / 10}%
          </p>
          <p className={`text-center text-sm font-semibold tabular-nums ${pctOff ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
            ₹&nbsp;{formatInr(totalUserAmount)}
          </p>
        </div>
      </div>

      {/* Footer note */}
      {pctOff && !autoAdjust && (
        <p className="flex items-center gap-1.5 text-xs text-amber-500">
          <Info className="size-3.5 shrink-0" />
          Allocations don&apos;t add up to 100%. Enable Linked mode to auto-balance.
        </p>
      )}
      {!pctOff && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          You can edit percentages or amounts directly. Amounts update automatically.
        </p>
      )}
    </div>
  );
}
