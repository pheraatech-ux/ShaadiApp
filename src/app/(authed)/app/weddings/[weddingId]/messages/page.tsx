import { notFound } from "next/navigation";

import { WorkspaceQuickAddForm } from "@/components/wedding-workspace/workspace-quick-add-form";
import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceMessagesPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceMessagesPage({ params }: WeddingWorkspaceMessagesPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <WorkspaceQuickAddForm
        weddingSlug={weddingId}
        kind="message"
        primaryLabel="Message"
        primaryPlaceholder="Client asked for an updated floral quote."
      />
      <WorkspaceSectionDataView
        title="Messages"
        subtitle={`Latest thread activity for ${summary.wedding.couple_name}`}
        totalLabel={`${summary.messages.length} messages`}
        emptyState="No messages yet. Conversations will appear here once teammates start messaging."
        items={summary.messages.map((message) => ({
          id: message.id,
          primary: message.body,
          secondary: new Date(message.created_at).toLocaleString("en-IN"),
        }))}
      />
    </div>
  );
}
