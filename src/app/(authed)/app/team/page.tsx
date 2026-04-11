import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";
import { TeamPageView } from "@/components/dashboard/team/team-page-view";
import { getTeamListView } from "@/lib/data/app-data";

export default async function TeamPage() {
  const view = await getTeamListView();

  return (
    <DashboardShell
      sidebar={
        <Suspense>
          <SidebarLive currentPath="/app/team" />
        </Suspense>
      }
      topbar={
        <Suspense>
          <DashboardTopbarLive />
        </Suspense>
      }
    >
      <TeamPageView view={view} />
    </DashboardShell>
  );
}
