import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { getAppSidebarCounts, getWorkspaceShellInfo } from "@/lib/data/app-data";

export async function SidebarLive() {
  const [planner, counts] = await Promise.all([getWorkspaceShellInfo(), getAppSidebarCounts()]);

  return (
    <AppSidebar
      workspaceName={planner.workspaceName}
      userName={planner.userName}
      userEmail={planner.userEmail}
      counts={counts}
    />
  );
}
