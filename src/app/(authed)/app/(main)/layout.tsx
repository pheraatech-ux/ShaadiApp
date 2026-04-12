import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DashboardTopbarSkeleton,
  SidebarChromeSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/dashboard/sidebar-live";

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
