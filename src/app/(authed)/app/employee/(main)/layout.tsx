import { Suspense, type ReactNode } from "react";

import { EmployeeSidebarLive } from "@/components/employee/employee-sidebar-live";
import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  DashboardTopbarSkeleton,
  SidebarChromeSkeleton,
} from "@/components/app-dashboard/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/app-dashboard/dashboard/dashboard-topbar-live";

export default function EmployeeMainLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      sidebar={
        <Suspense fallback={<SidebarChromeSkeleton />}>
          <EmployeeSidebarLive />
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
