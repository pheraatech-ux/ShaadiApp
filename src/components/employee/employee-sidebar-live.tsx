import { AppSidebar } from "@/components/app-dashboard/dashboard/app-sidebar";
import { getAppSidebarCounts, getWorkspaceShellInfo } from "@/lib/data/app-data";

const EMPLOYEE_BASE = "/app/employee";

export async function EmployeeSidebarLive() {
  const [planner, counts] = await Promise.all([getWorkspaceShellInfo(), getAppSidebarCounts()]);

  return (
    <AppSidebar
      userName={planner.userName}
      userEmail={planner.userEmail}
      counts={counts}
      basePath={EMPLOYEE_BASE}
    />
  );
}
