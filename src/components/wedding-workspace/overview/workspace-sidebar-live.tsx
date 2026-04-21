import { WorkspaceSidebar } from "@/components/wedding-workspace/overview/workspace-sidebar";
import { getWorkspaceShellInfo, getWorkspaceSidebarCounts } from "@/lib/data/app-data";

type WorkspaceSidebarLiveProps = {
  weddingId: string;
  appRoot?: "/app" | "/app/employee";
};

export async function WorkspaceSidebarLive({ weddingId, appRoot = "/app" }: WorkspaceSidebarLiveProps) {
  const [planner, counts] = await Promise.all([
    getWorkspaceShellInfo(),
    getWorkspaceSidebarCounts(weddingId),
  ]);

  return (
    <WorkspaceSidebar
      weddingId={weddingId}
      userName={planner.userName}
      userEmail={planner.userEmail}
      badgeCounts={counts}
      appRoot={appRoot}
      hideBudgetTab={appRoot === "/app/employee"}
    />
  );
}
