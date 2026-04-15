import type { FormEvent } from "react";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BudgetHeaderSectionProps = {
  coupleName: string;
  cultures: string[];
  editingTotalRupees: string;
  onEditingTotalRupeesChange: (value: string) => void;
  onSaveTotalSubmit: (event: FormEvent<HTMLFormElement>) => void;
  savingTotal: boolean;
};

export function BudgetHeaderSection({
  coupleName,
  cultures,
  editingTotalRupees,
  onEditingTotalRupeesChange,
  onSaveTotalSubmit,
  savingTotal,
}: BudgetHeaderSectionProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-semibold tracking-tight">{coupleName}</p>
            {cultures.map((culture) => (
              <Badge key={culture} className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-800">
                {culture}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-zinc-400">Super Admin View - Wedding Workspace Budget</p>
        </div>
        <div className="flex items-center gap-2">
          <form
            onSubmit={onSaveTotalSubmit}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-2 py-1"
          >
            <Input
              value={editingTotalRupees}
              onChange={(event) => onEditingTotalRupeesChange(event.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="Total budget INR"
              className="h-8 w-32 border-0 bg-transparent text-right text-zinc-100 focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="sm"
              className="h-7 rounded-md bg-emerald-600 px-2 text-xs hover:bg-emerald-500"
              disabled={savingTotal}
            >
              {savingTotal ? "..." : "Save"}
            </Button>
          </form>
          <Badge className="border-amber-900 bg-amber-950/70 text-amber-300">
            <CalendarDays className="mr-1 h-3 w-3" />
            Budget workspace
          </Badge>
        </div>
    </div>
  );
}
