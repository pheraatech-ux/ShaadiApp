"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { DEFAULT_EXPENSE_CATEGORIES } from "./types";
import { useFinancialData } from "./use-financial-data";

export function AddExpenseDialog() {
  const { data, ready, addExpenseEntry } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(DEFAULT_EXPENSE_CATEGORIES[0].id);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const allCategories = ready
    ? [...DEFAULT_EXPENSE_CATEGORIES, ...data.customExpenseCategories]
    : DEFAULT_EXPENSE_CATEGORIES;

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
      <DialogTrigger render={<Button size="default" className="h-10 shrink-0 gap-1.5 px-4 shadow-sm" disabled={!ready} />}>
        <PlusIcon className="size-4" />
        <span className="hidden sm:inline">Add Expense</span>
        <span className="sm:hidden">Expense</span>
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
