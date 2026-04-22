import { AppSidebarWithLiveCounts } from "@/components/app-dashboard/dashboard/app-sidebar-with-live-counts";
import { getAccessibleWeddingIds, getAppSidebarCounts, getWorkspaceShellInfo } from "@/lib/data/app-data";

export async function SidebarLive() {
  const [planner, initialCounts, weddingIds] = await Promise.all([
    getWorkspaceShellInfo(),
    getAppSidebarCounts(),
    getAccessibleWeddingIds(),
  ]);

  return (
    <AppSidebarWithLiveCounts
      userName={planner.userName}
      userEmail={planner.userEmail}
      initialCounts={initialCounts}
      weddingIds={weddingIds}
    />
  );
}
