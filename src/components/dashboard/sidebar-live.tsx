import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { dashboardMockData } from "@/components/dashboard/mock-data";
import { getCurrentPlanner } from "@/lib/get-current-planner";

export async function SidebarLive() {
  const planner = await getCurrentPlanner();

  return (
    <AppSidebar
      workspaceName={dashboardMockData.workspaceName}
      userName={planner.displayName}
      userEmail={planner.email}
      currentPath="/app"
    />
  );
}
