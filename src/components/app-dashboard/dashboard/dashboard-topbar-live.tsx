import { DashboardTopbar } from "@/components/app-dashboard/dashboard/dashboard-topbar";
import { getWorkspaceShellInfo } from "@/lib/data/app-data";
import { buildTimeOfDayGreeting } from "@/lib/planner-display";

export async function DashboardTopbarLive() {
  const planner = await getWorkspaceShellInfo();
  const greeting = buildTimeOfDayGreeting(planner.userName);

  return <DashboardTopbar greeting={greeting} />;
}
