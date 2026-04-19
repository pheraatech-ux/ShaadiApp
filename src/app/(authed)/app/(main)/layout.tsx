import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  DashboardTopbarSkeleton,
  SidebarChromeSkeleton,
} from "@/components/app-dashboard/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/app-dashboard/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/app-dashboard/dashboard/sidebar-live";

export default function MainAppShellLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      sidebar={
        <Suspense fallback={<SidebarChromeSkeleton />}>
          <SidebarLive />
        </Suspense>
      }
      topbar={
        <Suspense fallback={<DashboardTopbarSkeleton />}>
          <DashboardTopbarLive />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}
