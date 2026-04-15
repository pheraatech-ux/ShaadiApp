import type { FormEvent } from "react";

import { toInr } from "@/components/wedding-workspace/budget/budget-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";

type DraftRow = { category: string; allocated: string; spent: string };

type BudgetLineItemsPanelProps = {
  view: WeddingBudgetWorkspaceViewModel;
  newCategory: string;
  newAllocatedRupees: string;
  newSpentRupees: string;
  onNewCategoryChange: (value: string) => void;
  onNewAllocatedChange: (value: string) => void;
  onNewSpentChange: (value: string) => void;
  onAddSubmit: (event: FormEvent<HTMLFormElement>) => void;
  draftById: Record<string, DraftRow>;
  onDraftChange: (itemId: string, patch: Partial<DraftRow>) => void;
  onSaveItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  savingItemId: string | null;
  deletingItemId: string | null;
};

export function BudgetLineItemsPanel({
  view,
  newCategory,
  newAllocatedRupees,
  newSpentRupees,
  onNewCategoryChange,
  onNewAllocatedChange,
  onNewSpentChange,
  onAddSubmit,
  draftById,
  onDraftChange,
  onSaveItem,
  onDeleteItem,
  savingItemId,
  deletingItemId,
}: BudgetLineItemsPanelProps) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Budget Line Items</p>
          <p className="text-[11px] text-zinc-500">Planner view - editable allocation + spend</p>
        </div>
        <div className="text-xs text-zinc-400">Filter +</div>
      </div>

      <form
        onSubmit={onAddSubmit}
        className="mb-3 grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
      >
        <Input
          value={newCategory}
          onChange={(event) => onNewCategoryChange(event.target.value)}
          placeholder="Add budget item"
          className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
        />
        <Input
          value={newAllocatedRupees}
          onChange={(event) => onNewAllocatedChange(event.target.value.replace(/[^\d]/g, ""))}
          placeholder="Allocated"
          inputMode="numeric"
          className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
        />
        <Input
          value={newSpentRupees}
          onChange={(event) => onNewSpentChange(event.target.value.replace(/[^\d]/g, ""))}
          placeholder="Spent"
          inputMode="numeric"
          className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
        />
        <Button type="submit" size="sm" className="h-8 rounded-md bg-emerald-600 px-3 text-xs hover:bg-emerald-500">
          Add
        </Button>
      </form>

      <div className="space-y-2">
        {view.budgetItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-700 p-4 text-xs text-zinc-400">
            No budget lines yet. Add a first item above.
          </div>
        ) : (
          view.budgetItems.map((item) => {
            const draft = draftById[item.id];
            return (
              <article key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_auto]">
                  <Input
                    value={draft?.category ?? ""}
                    onChange={(event) => onDraftChange(item.id, { category: event.target.value })}
                    className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                  />
                  <Input
                    value={draft?.allocated ?? ""}
                    onChange={(event) => onDraftChange(item.id, { allocated: event.target.value.replace(/[^\d]/g, "") })}
                    inputMode="numeric"
                    className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                  />
                  <Input
                    value={draft?.spent ?? ""}
                    onChange={(event) => onDraftChange(item.id, { spent: event.target.value.replace(/[^\d]/g, "") })}
                    inputMode="numeric"
                    className="h-8 border-zinc-700 bg-zinc-900 text-zinc-100"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onSaveItem(item.id)}
                      disabled={savingItemId === item.id}
                      className="h-8 rounded-md border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-200 hover:bg-zinc-700"
                    >
                      {savingItemId === item.id ? "..." : "Save"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-md px-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                      onClick={() => onDeleteItem(item.id)}
                      disabled={deletingItemId === item.id}
                    >
                      {deletingItemId === item.id ? "..." : "Del"}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{item.bucketLabel}</span>
                  </div>
                  <span>
                    {toInr(Number(draft?.spent ?? "0") * 100)} spent / {toInr(Number(draft?.allocated ?? "0") * 100)} planned
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </article>
  );
}
