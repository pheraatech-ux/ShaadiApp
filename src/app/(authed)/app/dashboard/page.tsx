import { Suspense } from "react";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";

export default function DashboardPage() {
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
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardShell>
  );
}
