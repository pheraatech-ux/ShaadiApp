import { notFound } from "next/navigation";

import { WeddingMessagesWorkspace } from "@/components/wedding-workspace/messages/wedding-messages-workspace";
import { getWeddingMessagesWorkspaceViewBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceMessagesPageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ thread?: string }>;
};

export default async function WeddingWorkspaceMessagesPage({ params, searchParams }: WeddingWorkspaceMessagesPageProps) {
  const [{ weddingId }, resolvedSearch] = await Promise.all([params, searchParams]);
  const view = await getWeddingMessagesWorkspaceViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <WeddingMessagesWorkspace view={view} initialThreadId={resolvedSearch.thread} />;
}
