import { notFound } from "next/navigation";

import { WeddingTasksWorkspace } from "@/components/wedding-workspace/tasks/wedding-tasks-workspace";
import { getWeddingTasksBoardViewBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceTasksPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceTasksPage({ params }: WeddingWorkspaceTasksPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingTasksBoardViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <WeddingTasksWorkspace view={view} />;
}
