import { AppSidebarWithLiveCounts } from "@/components/app-dashboard/dashboard/app-sidebar-with-live-counts";
import { getAppSidebarCounts, getWorkspaceShellInfo } from "@/lib/data/app-data";

export async function EmployeeSidebarLive() {
  const [planner, initialCounts] = await Promise.all([getWorkspaceShellInfo(), getAppSidebarCounts()]);

  return (
    <AppSidebarWithLiveCounts
      userName={planner.userName}
      userEmail={planner.userEmail}
      initialCounts={initialCounts}
      basePath="/app/employee"
      hideBudgetTab
      hideTeamTab
    />
  );
}
