"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BudgetKpiSectionProps = {
  totalBudgetPaise: number;
  spentBudgetPaise: number;
  allocatedBudgetPaise: number;
  onSaveTotalBudget: (rupees: number) => Promise<void>;
  savingTotal: boolean;
};

function formatInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function BudgetKpiSection({
  totalBudgetPaise,
  spentBudgetPaise,
  allocatedBudgetPaise,
  onSaveTotalBudget,
  savingTotal,
}: BudgetKpiSectionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const remainingPaise = Math.max(0, totalBudgetPaise - spentBudgetPaise);
  const utilization = pct(spentBudgetPaise, totalBudgetPaise);
  const spentPct = pct(spentBudgetPaise, totalBudgetPaise);
  const remainingPct = pct(remainingPaise, totalBudgetPaise);
  const allocatedPct = pct(allocatedBudgetPaise, totalBudgetPaise);

  const utilizationBarColor =
    utilization >= 100 ? "bg-rose-500" : utilization >= 80 ? "bg-amber-500" : "bg-emerald-500";

  function startEdit() {
    setDraft(String(Math.round(totalBudgetPaise / 100)));
    setEditing(true);
  }

  async function saveEdit() {
    const rupees = Math.max(0, parseInt(draft || "0", 10));
    await onSaveTotalBudget(rupees);
    setEditing(false);
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Budget */}
      <article className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Budget</p>
        {editing ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm font-semibold text-muted-foreground">₹</span>
            <Input
              className="h-8 flex-1 rounded-lg border-input bg-muted/30 px-2 text-sm font-semibold shadow-none focus-visible:ring-1"
              inputMode="numeric"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") void saveEdit();
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <Button size="icon-sm" variant="ghost" onClick={() => void saveEdit()} disabled={savingTotal}>
              <Check className="size-3.5 text-emerald-500" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-2xl font-bold tracking-tight">{formatInr(totalBudgetPaise)}</p>
        )}
        {!editing && (
          <button
            type="button"
            onClick={startEdit}
            className="mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
          >
            <Pencil className="size-3" /> Edit
          </button>
        )}
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${clamp(allocatedPct, 0, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{allocatedPct}% allocated</p>
      </article>

      {/* Total Spent */}
      <article className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Spent</p>
        <p className="mt-2 text-2xl font-bold tracking-tight">{formatInr(spentBudgetPaise)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{spentPct}% of budget</p>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${utilization >= 100 ? "bg-rose-500" : utilization >= 80 ? "bg-amber-500" : "bg-rose-400"}`}
            style={{ width: `${clamp(spentPct, 0, 100)}%` }}
          />
        </div>
      </article>

      {/* Remaining */}
      <article className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remaining Budget</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight ${spentBudgetPaise > totalBudgetPaise ? "text-rose-500" : ""}`}>
          {formatInr(remainingPaise)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{remainingPct}% of budget</p>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${clamp(remainingPct, 0, 100)}%` }}
          />
        </div>
      </article>

      {/* Utilization */}
      <article className="rounded-xl border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget Utilization</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight ${utilization >= 100 ? "text-rose-500" : utilization >= 80 ? "text-amber-500" : ""}`}>
          {utilization}%
        </p>
        <p className="mt-1 text-xs text-muted-foreground">of total budget spent</p>
        <div className="mt-3 h-1.5 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${utilizationBarColor}`}
            style={{ width: `${clamp(utilization, 0, 100)}%` }}
          />
        </div>
      </article>
    </section>
  );
}
