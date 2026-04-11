import { notFound } from "next/navigation";

import { WorkspaceQuickAddForm } from "@/components/wedding-workspace/workspace-quick-add-form";
import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceDocumentsPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceDocumentsPage({ params }: WeddingWorkspaceDocumentsPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <WorkspaceQuickAddForm
        weddingSlug={weddingId}
        kind="document"
        primaryLabel="Document title"
        secondaryLabel="File URL"
        primaryPlaceholder="Venue contract"
        secondaryPlaceholder="https://..."
      />
      <WorkspaceSectionDataView
        title="Documents"
        subtitle={`Files and docs for ${summary.wedding.couple_name}`}
        totalLabel={`${summary.documents.length} documents`}
        emptyState="No documents yet. Upload and link files to manage this wedding."
        items={summary.documents.map((document) => ({
          id: document.id,
          primary: document.title,
          secondary: document.file_url ?? "No file URL",
        }))}
      />
    </div>
  );
}
