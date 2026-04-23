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

  return (
    <div className="-mx-4 -my-5 flex h-[calc(100svh-4rem)] sm:-mx-6 sm:-my-6">
      <WeddingMessagesWorkspace view={view} initialThreadId={resolvedSearch.thread} />
    </div>
  );
}
