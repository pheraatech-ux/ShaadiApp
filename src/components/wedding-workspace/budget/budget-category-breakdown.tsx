"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type BudgetItem = {
  id: string;
  category: string;
  allocatedPaise: number;
  spentPaise: number;
  allocationPct: number | null;
};

type BudgetCategoryBreakdownProps = {
  items: BudgetItem[];
  totalBudgetPaise: number;
  showAddForm: boolean;
  onCloseAddForm: () => void;
  onAdd: (category: string, allocatedRupees: number, spentRupees: number) => Promise<void>;
  onEdit: (id: string, category: string, allocatedRupees: number, spentRupees: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRowClick: (id: string) => void;
  savingId: string | null;
  deletingId: string | null;
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

type StatusInfo = { label: string; variant: "emerald" | "amber" | "rose" };

function getStatus(spentPaise: number, allocatedPaise: number): StatusInfo {
  if (allocatedPaise <= 0) return { label: "Unallocated", variant: "amber" };
  const utilization = (spentPaise / allocatedPaise) * 100;
  if (utilization >= 100) return { label: "Over budget", variant: "rose" };
  if (utilization >= 80) return { label: "At limit", variant: "amber" };
  return { label: "On track", variant: "emerald" };
}

const STATUS_CLASSES: Record<StatusInfo["variant"], string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const BAR_CLASSES: Record<StatusInfo["variant"], string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

// ─── Add row ─────────────────────────────────────────────────────────────────

type AddRowProps = {
  onSave: (category: string, allocatedRupees: number, spentRupees: number) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
};

function AddRow({ onSave, onCancel, saving }: AddRowProps) {
  const [category, setCategory] = useState("");
  const [allocated, setAllocated] = useState("");
  const [spent, setSpent] = useState("");

  async function handleSave() {
    const cat = category.trim();
    if (!cat) return;
    await onSave(cat, parseFloat(allocated) || 0, parseFloat(spent) || 0);
  }

  return (
    <div className="grid grid-cols-[minmax(120px,1fr)_140px_120px_120px_170px_110px_64px] items-center gap-x-2 border-t bg-muted/20 px-4 py-2">
      <Input
        className="h-7 rounded-lg text-sm"
        placeholder="Category name"
        value={category}
        autoFocus
        onChange={(e) => setCategory(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        placeholder="0"
        inputMode="numeric"
        value={allocated}
        onChange={(e) => setAllocated(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        placeholder="0"
        inputMode="numeric"
        value={spent}
        onChange={(e) => setSpent(e.target.value.replace(/[^\d.]/g, ""))}
      />
      {/* Remaining + Utilization + Status are read-only — blank on add */}
      <div />
      <div />
      <div />
      <div className="flex items-center justify-end gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => void handleSave()} disabled={saving || !category.trim()}>
          <Check className="size-3.5 text-emerald-500" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Edit row ────────────────────────────────────────────────────────────────

type EditRowProps = {
  item: BudgetItem;
  onSave: (id: string, category: string, allocatedRupees: number, spentRupees: number) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
};

function EditRow({ item, onSave, onCancel, saving }: EditRowProps) {
  const [category, setCategory] = useState(item.category);
  const [allocated, setAllocated] = useState(String(Math.round(item.allocatedPaise / 100)));
  const [spent, setSpent] = useState(String(Math.round(item.spentPaise / 100)));

  const allocatedPaise = (parseFloat(allocated) || 0) * 100;
  const spentPaise = (parseFloat(spent) || 0) * 100;
  const remainingPaise = Math.max(0, allocatedPaise - spentPaise);
  const utilization = pct(spentPaise, allocatedPaise);
  const status = getStatus(spentPaise, allocatedPaise);

  async function handleSave() {
    const cat = category.trim();
    if (!cat) return;
    await onSave(item.id, cat, parseFloat(allocated) || 0, parseFloat(spent) || 0);
  }

  return (
    <div className="grid grid-cols-[minmax(120px,1fr)_140px_120px_120px_170px_110px_64px] items-center gap-x-2 border-t bg-muted/10 px-4 py-2">
      <Input
        className="h-7 rounded-lg text-sm"
        value={category}
        autoFocus
        onChange={(e) => setCategory(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); if (e.key === "Escape") onCancel(); }}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        inputMode="numeric"
        value={allocated}
        onChange={(e) => setAllocated(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <Input
        className="h-7 rounded-lg text-center text-sm"
        inputMode="numeric"
        value={spent}
        onChange={(e) => setSpent(e.target.value.replace(/[^\d.]/g, ""))}
      />
      <p className="text-center text-sm font-medium">{formatInr(remainingPaise)}</p>
      <div className="flex items-center gap-2 px-1">
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${BAR_CLASSES[status.variant]}`}
            style={{ width: `${clamp(utilization, 0, 100)}%` }}
          />
        </div>
        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{utilization}%</span>
      </div>
      <div className="flex justify-center">
        <Badge variant="outline" className={`text-[11px] ${STATUS_CLASSES[status.variant]}`}>
          {status.label}
        </Badge>
      </div>
      <div className="flex items-center justify-end gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => void handleSave()} disabled={saving || !category.trim()}>
          <Check className="size-3.5 text-emerald-500" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BudgetCategoryBreakdown({
  items,
  totalBudgetPaise,
  showAddForm,
  onCloseAddForm,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
  savingId,
  deletingId,
}: BudgetCategoryBreakdownProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalAllocated = items.reduce((s, i) => s + i.allocatedPaise, 0);
  const totalSpent = items.reduce((s, i) => s + i.spentPaise, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const totalUtilization = pct(totalSpent, totalAllocated);
  const totalStatus = getStatus(totalSpent, totalAllocated);

  async function handleEdit(id: string, category: string, allocatedRupees: number, spentRupees: number) {
    await onEdit(id, category, allocatedRupees, spentRupees);
    setEditingId(null);
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Header row */}
      <div className="grid grid-cols-[minmax(120px,1fr)_140px_120px_120px_170px_110px_64px] border-b bg-muted/30 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allocated</p>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spent</p>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remaining</p>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Utilization</p>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
        <div />
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddRow
          onSave={async (cat, alloc, sp) => { await onAdd(cat, alloc, sp); onCloseAddForm(); }}
          onCancel={onCloseAddForm}
          saving={savingId === "__add__"}
        />
      )}

      {/* Data rows */}
      {items.length === 0 && !showAddForm && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No categories yet. Click <span className="font-medium text-foreground">Add category</span> to get started.
        </div>
      )}

      {items.map((item) => {
        if (editingId === item.id) {
          return (
            <EditRow
              key={item.id}
              item={item}
              onSave={handleEdit}
              onCancel={() => setEditingId(null)}
              saving={savingId === item.id}
            />
          );
        }

        const remainingPaise = Math.max(0, item.allocatedPaise - item.spentPaise);
        const utilization = pct(item.spentPaise, item.allocatedPaise);
        const status = getStatus(item.spentPaise, item.allocatedPaise);
        const allocPct = item.allocationPct ?? pct(item.allocatedPaise, totalBudgetPaise);
        const isDeleting = deletingId === item.id;

        return (
          <div
            key={item.id}
            className="group grid grid-cols-[minmax(120px,1fr)_140px_120px_120px_170px_110px_64px] cursor-pointer items-center border-t px-4 py-3 transition-colors hover:bg-muted/20"
            onClick={() => onRowClick(item.id)}
          >
            <div>
              <p className="text-sm font-medium">{item.category}</p>
              {allocPct > 0 && (
                <p className="text-xs text-muted-foreground">{allocPct}% of budget</p>
              )}
            </div>
            <p className="text-center text-sm font-medium">{formatInr(item.allocatedPaise)}</p>
            <p className="text-center text-sm">{formatInr(item.spentPaise)}</p>
            <p className={`text-center text-sm font-medium ${item.spentPaise > item.allocatedPaise ? "text-rose-500" : ""}`}>
              {formatInr(remainingPaise)}
            </p>
            <div className="flex items-center gap-2 px-1">
              <div className="h-1.5 flex-1 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${BAR_CLASSES[status.variant]}`}
                  style={{ width: `${clamp(utilization, 0, 100)}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{utilization}%</span>
            </div>
            <div className="flex justify-center">
              <Badge variant="outline" className={`text-[11px] ${STATUS_CLASSES[status.variant]}`}>
                {status.label}
              </Badge>
            </div>
            <div
              className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={isDeleting || savingId === item.id}
                onClick={() => setEditingId(item.id)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={isDeleting || savingId === item.id}
                onClick={() => void onDelete(item.id)}
              >
                <Trash2 className={`size-3.5 ${isDeleting ? "animate-pulse text-rose-500" : "text-muted-foreground"}`} />
              </Button>
            </div>
          </div>
        );
      })}

      {/* Total row */}
      {items.length > 0 && (
        <div className="grid grid-cols-[minmax(120px,1fr)_140px_120px_120px_170px_110px_64px] items-center border-t bg-muted/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="text-center text-sm font-semibold">{formatInr(totalAllocated)}</p>
          <p className="text-center text-sm font-semibold">{formatInr(totalSpent)}</p>
          <p className="text-center text-sm font-semibold">{formatInr(totalRemaining)}</p>
          <div className="flex items-center gap-2 px-1">
            <div className="h-1.5 flex-1 rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${BAR_CLASSES[totalStatus.variant]}`}
                style={{ width: `${clamp(totalUtilization, 0, 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{totalUtilization}%</span>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className={`text-[11px] ${STATUS_CLASSES[totalStatus.variant]}`}>
              {totalStatus.label}
            </Badge>
          </div>
          <div />
        </div>
      )}
    </div>
  );
}
