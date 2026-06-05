"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useFinancialData } from "./use-financial-data";

export function AddCategoryDialog() {
  const { addCustomExpenseCategory } = useFinancialData();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  const handleSubmit = () => {
    if (!label.trim()) return;
    void addCustomExpenseCategory(label);
    setLabel("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="default" variant="outline" className="h-10 shrink-0 gap-1.5 px-4" />}>
        <PlusIcon className="size-4" />
        <span className="hidden sm:inline">New Category</span>
        <span className="sm:hidden">Category</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Expense Category</DialogTitle>
        </DialogHeader>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Category Name</label>
          <Input
            placeholder="e.g. Equipment Rental"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
