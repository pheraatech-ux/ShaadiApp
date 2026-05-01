"use client";

import { useState } from "react";
import { ArrowLeftIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { DEFAULT_EXPENSE_CATEGORIES } from "./types";
import { sumRupees, useFinancialData } from "./use-financial-data";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function AddExpenseDialog({
  allCategories,
}: {
  allCategories: { id: string; label: string }[];
}) {
  const { addExpenseEntry } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(DEFAULT_EXPENSE_CATEGORIES[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const cat = allCategories.find((c) => c.id === categoryId);
    void addExpenseEntry({
      categoryId,
      categoryLabel: cat?.label ?? categoryId,
      amountRupees: amt,
      date,
      description,
    });
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon className="h-3.5 w-3.5" />
        Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (₹)</label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Description (optional)
            </label>
            <Input
              placeholder="e.g. Riya — May salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={!amount || parseFloat(amount) <= 0}>
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpensesPanel({ onBack }: { onBack: () => void }) {
  const { data, ready, deleteExpenseEntry } = useFinancialData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...(data.customExpenseCategories ?? []),
  ];

  const filtered = data.expenseEntries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((e) => {
      if (categoryFilter !== "all" && e.categoryId !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.categoryLabel.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.date.includes(q) ||
          String(e.amountRupees).includes(q)
        );
      }
      return true;
    });

  const totalFiltered = sumRupees(filtered);

  if (!ready) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <div className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card px-4 py-2.5">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex-1 p-6">
          <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* ── Top bar ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Expenses
        </button>
        <span className="text-border/60">·</span>
        <span className="text-sm font-semibold">Expense Entries</span>
      </div>

      {/* ── Filter + action bar ── */}
      <div className="flex shrink-0 flex-col gap-2 border-b border-border/60 bg-card/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "entry" : "entries"}
            </span>
            <span className="h-4 w-px bg-border/70" />
            <span className="text-muted-foreground">
              Total{" "}
              <span className="font-semibold text-foreground">{INR(totalFiltered)}</span>
            </span>
            {(search.trim() || categoryFilter !== "all") && (
              <>
                <span className="h-4 w-px bg-border/70" />
                <button
                  onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
          <AddExpenseDialog allCategories={allCategories} />
        </div>

        {/* Right: search + category */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-8 text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Entries table ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">
              {data.expenseEntries.length === 0
                ? "No expense entries yet. Add your first one above."
                : "No entries match your filters."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted/60 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((e) => (
                <tr key={e.id} className="bg-background hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{e.categoryLabel}</span>
                      {data.customExpenseCategories.find((c) => c.id === e.categoryId) && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          custom
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.description || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3 text-right font-semibold">{INR(e.amountRupees)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { void deleteExpenseEntry(e.id); }}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete entry"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
