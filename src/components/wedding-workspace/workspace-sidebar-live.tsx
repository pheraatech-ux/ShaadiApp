import { dashboardMockData } from "@/components/dashboard/mock-data";
import { WorkspaceSidebar } from "@/components/wedding-workspace/workspace-sidebar";
import { getCurrentPlanner } from "@/lib/get-current-planner";

type WorkspaceSidebarLiveProps = {
  weddingId: string;
};

export async function WorkspaceSidebarLive({ weddingId }: WorkspaceSidebarLiveProps) {
  const planner = await getCurrentPlanner();

  return (
    <WorkspaceSidebar
      weddingId={weddingId}
      workspaceName={dashboardMockData.workspaceName}
      userName={planner.displayName}
      userEmail={planner.email}
    />
  );
}
