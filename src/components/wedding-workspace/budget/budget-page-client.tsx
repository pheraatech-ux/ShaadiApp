"use client";

import { BudgetSetupFlow } from "@/components/wedding-workspace/budget/budget-setup-flow";
import { BudgetDashboard } from "@/components/wedding-workspace/budget/budget-dashboard";
import type { WeddingBudgetWorkspaceViewModel } from "@/lib/data/app-data";

type BudgetPageClientProps = {
  view: WeddingBudgetWorkspaceViewModel;
};

export function BudgetPageClient({ view }: BudgetPageClientProps) {
  if (!view.budgetSetupCompleted) {
    return (
      <BudgetSetupFlow
        weddingSlug={view.weddingSlug}
        coupleName={view.coupleName}
        cultures={view.cultures}
        initialBudgetPaise={view.totalBudgetPaise}
      />
    );
  }

  return <BudgetDashboard view={view} />;
}
