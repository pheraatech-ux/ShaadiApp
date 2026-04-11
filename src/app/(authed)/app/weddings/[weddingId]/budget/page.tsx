import { notFound } from "next/navigation";

import { WorkspaceQuickAddForm } from "@/components/wedding-workspace/workspace-quick-add-form";
import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceBudgetPageProps = {
  params: Promise<{ weddingId: string }>;
};

function toInr(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export default async function WeddingWorkspaceBudgetPage({ params }: WeddingWorkspaceBudgetPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <WorkspaceQuickAddForm
        weddingSlug={weddingId}
        kind="budget"
        primaryLabel="Budget category"
        secondaryLabel="Allocated amount (INR)"
        primaryPlaceholder="Catering"
        secondaryPlaceholder="500000"
      />
      <WorkspaceSectionDataView
        title="Budget"
        subtitle={`Budget categories for ${summary.wedding.couple_name}`}
        totalLabel={`${summary.budgetItems.length} categories • Total ${toInr(summary.wedding.total_budget_paise)}`}
        emptyState="No budget categories yet. Add budget items to track planned vs spent amounts."
        items={summary.budgetItems.map((item) => ({
          id: item.id,
          primary: item.category,
          secondary: `${toInr(item.spent_paise)} spent of ${toInr(item.allocated_paise)}`,
        }))}
      />
    </div>
  );
}
