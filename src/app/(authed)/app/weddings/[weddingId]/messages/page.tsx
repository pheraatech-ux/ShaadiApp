import { notFound } from "next/navigation";

import { WeddingMessagesWorkspace } from "@/components/wedding-workspace/messages/wedding-messages-workspace";
import { getWeddingMessagesWorkspaceViewBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceMessagesPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceMessagesPage({ params }: WeddingWorkspaceMessagesPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingMessagesWorkspaceViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <WeddingMessagesWorkspace view={view} />;
}
