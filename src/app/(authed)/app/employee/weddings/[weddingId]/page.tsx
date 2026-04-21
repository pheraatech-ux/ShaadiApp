import { notFound } from "next/navigation";

import { WeddingWorkspaceOverview } from "@/components/wedding-workspace/overview/wedding-workspace-overview";
import { getWeddingWorkspaceBySlug } from "@/lib/data/app-data";

type EmployeeWeddingWorkspacePageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function EmployeeWeddingWorkspacePage({ params }: EmployeeWeddingWorkspacePageProps) {
  const { weddingId } = await params;
  const workspace = await getWeddingWorkspaceBySlug(weddingId);
  if (!workspace) {
    notFound();
  }

  return <WeddingWorkspaceOverview workspace={workspace} hideWorkspaceSetup />;
}
