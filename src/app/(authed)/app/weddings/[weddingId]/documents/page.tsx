import { notFound } from "next/navigation";

import { getWeddingDocumentsViewBySlug } from "@/lib/data/app-data";
import { WeddingDocumentsWorkspace } from "@/components/wedding-workspace/documents/wedding-documents-workspace";

type WeddingWorkspaceDocumentsPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceDocumentsPage({ params }: WeddingWorkspaceDocumentsPageProps) {
  const { weddingId } = await params;
  const viewData = await getWeddingDocumentsViewBySlug(weddingId);
  if (!viewData) notFound();

  return <WeddingDocumentsWorkspace viewData={viewData} />;
}
