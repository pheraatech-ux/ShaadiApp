import { WorkspaceSidebar } from "@/components/wedding-workspace/workspace-sidebar";
import { getWorkspaceShellInfo, getWorkspaceSidebarCounts } from "@/lib/data/app-data";

type WorkspaceSidebarLiveProps = {
  weddingId: string;
};

export async function WorkspaceSidebarLive({ weddingId }: WorkspaceSidebarLiveProps) {
  const [planner, counts] = await Promise.all([
    getWorkspaceShellInfo(),
    getWorkspaceSidebarCounts(weddingId),
  ]);

  return (
    <WorkspaceSidebar
      weddingId={weddingId}
      workspaceName={planner.workspaceName}
      userName={planner.userName}
      userEmail={planner.userEmail}
      badgeCounts={counts}
    />
  );
}
