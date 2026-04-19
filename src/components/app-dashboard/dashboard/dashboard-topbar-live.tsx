import { DashboardTopbar } from "@/components/app-dashboard/dashboard/dashboard-topbar";
import { getCurrentPlanner } from "@/lib/get-current-planner";
import { buildTimeOfDayGreeting } from "@/lib/planner-display";

export async function DashboardTopbarLive() {
  const planner = await getCurrentPlanner();
  const greeting = buildTimeOfDayGreeting(planner.displayName);

  return <DashboardTopbar greeting={greeting} />;
}
