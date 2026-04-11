import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";
import { teamListPageMockData } from "@/components/dashboard/team/team-mock-data";
import { TeamPageView } from "@/components/dashboard/team/team-page-view";

export default function TeamPage() {
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
      <TeamPageView view={teamListPageMockData} />
    </DashboardShell>
  );
}
