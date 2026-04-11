import { notFound } from "next/navigation";

import { WeddingWorkspaceOverview } from "@/components/wedding-workspace/wedding-workspace-overview";
import { getWeddingWorkspaceBySlug } from "@/lib/data/app-data";

type WeddingWorkspacePageProps = {
  params: Promise<{
    weddingId: string;
  }>;
};

export default async function WeddingWorkspacePage({ params }: WeddingWorkspacePageProps) {
  const { weddingId } = await params;
  const workspace = await getWeddingWorkspaceBySlug(weddingId);
  if (!workspace) {
    notFound();
  }

  return <WeddingWorkspaceOverview workspace={workspace} />;
}
