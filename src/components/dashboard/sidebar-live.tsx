import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { getAppSidebarCounts, getWorkspaceShellInfo } from "@/lib/data/app-data";

type SidebarLiveProps = {
  currentPath?: string;
};

export async function SidebarLive({ currentPath = "/app/dashboard" }: SidebarLiveProps) {
  const [planner, counts] = await Promise.all([getWorkspaceShellInfo(), getAppSidebarCounts()]);

  return (
    <AppSidebar
      workspaceName={planner.workspaceName}
      userName={planner.userName}
      userEmail={planner.userEmail}
      currentPath={currentPath}
      counts={counts}
    />
  );
}
