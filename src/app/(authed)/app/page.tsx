import { Suspense } from "react";

import { AppSidebarCompact } from "@/components/dashboard/app-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";

export default function AppHomePage() {
  return (
    <DashboardShell
      sidebar={
        <Suspense>
          <SidebarLive />
        </Suspense>
      }
      topbar={
        <Suspense>
          <DashboardTopbarLive />
        </Suspense>
      }
      mobileSidebar={<AppSidebarCompact currentPath="/app" />}
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
