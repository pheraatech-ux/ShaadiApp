import { notFound } from "next/navigation";

import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";
import { generateWeddingAiReport } from "@/lib/ai/gemini";
import { AiReportView } from "@/components/wedding-workspace/ai-report/ai-report-view";

type WeddingWorkspaceAiReportPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceAiReportPage({ params }: WeddingWorkspaceAiReportPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  let reportText: string | null = null;
  let reportError: string | null = null;

  try {
    reportText = await generateWeddingAiReport({
      coupleName: summary.wedding.couple_name,
      weddingDate: summary.wedding.wedding_date ?? null,
      tasks: summary.tasks,
      vendors: summary.vendors,
      budgetItems: summary.budgetItems,
      documents: summary.documents,
      messageCount: summary.messages.length,
    });
  } catch (err) {
    reportError = err instanceof Error ? err.message : "Failed to generate report.";
  }

  return (
    <AiReportView
      coupleName={summary.wedding.couple_name}
      reportText={reportText}
      reportError={reportError}
      signalCount={
        summary.tasks.length +
        summary.vendors.length +
        summary.messages.length +
        summary.documents.length +
        summary.budgetItems.length
      }
    />
  );
}
