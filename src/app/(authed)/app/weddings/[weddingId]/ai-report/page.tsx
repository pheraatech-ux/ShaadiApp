import { notFound } from "next/navigation";

import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceAiReportPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceAiReportPage({ params }: WeddingWorkspaceAiReportPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  const readiness =
    summary.tasks.length +
    summary.vendors.length +
    summary.messages.length +
    summary.documents.length +
    summary.budgetItems.length;

  return (
    <WorkspaceSectionDataView
      title="AI report"
      subtitle={`Readiness summary for ${summary.wedding.couple_name}`}
      totalLabel={`Signals available: ${readiness}`}
      emptyState="No operational data yet. Add tasks, vendors, budget, and docs to generate richer AI reports."
      items={[
        { id: "tasks", primary: "Tasks", secondary: `${summary.tasks.length} records` },
        { id: "vendors", primary: "Vendors", secondary: `${summary.vendors.length} records` },
        { id: "messages", primary: "Messages", secondary: `${summary.messages.length} records` },
        { id: "documents", primary: "Documents", secondary: `${summary.documents.length} records` },
        { id: "budget", primary: "Budget items", secondary: `${summary.budgetItems.length} records` },
      ]}
    />
  );
}
