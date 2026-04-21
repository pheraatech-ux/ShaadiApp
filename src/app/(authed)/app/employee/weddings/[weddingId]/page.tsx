import { notFound } from "next/navigation";

import { WeddingWorkspaceOverview } from "@/components/wedding-workspace/overview/wedding-workspace-overview";
import { getWeddingWorkspaceBySlug, getWeddingTasksBoardViewBySlug } from "@/lib/data/app-data";

type EmployeeWeddingWorkspacePageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function EmployeeWeddingWorkspacePage({ params }: EmployeeWeddingWorkspacePageProps) {
  const { weddingId } = await params;
  const [workspace, tasksBoard] = await Promise.all([
    getWeddingWorkspaceBySlug(weddingId),
    getWeddingTasksBoardViewBySlug(weddingId),
  ]);
  if (!workspace) {
    notFound();
  }

  const assignedTasks = (tasksBoard?.tasks ?? []).filter((t) => t.isAssignedToCurrentUser);

  return (
    <WeddingWorkspaceOverview
      workspace={workspace}
      hideWorkspaceSetup
      hideVendors
      assignedTasks={assignedTasks}
    />
  );
}
