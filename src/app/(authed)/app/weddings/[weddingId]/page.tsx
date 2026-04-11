import { getWeddingWorkspaceMock } from "@/components/wedding-workspace/mock-data";
import { WeddingWorkspaceOverview } from "@/components/wedding-workspace/wedding-workspace-overview";

type WeddingWorkspacePageProps = {
  params: Promise<{
    weddingId: string;
  }>;
};

export default async function WeddingWorkspacePage({ params }: WeddingWorkspacePageProps) {
  const { weddingId } = await params;
  const workspace = getWeddingWorkspaceMock(weddingId);

  return <WeddingWorkspaceOverview workspace={workspace} />;
}
