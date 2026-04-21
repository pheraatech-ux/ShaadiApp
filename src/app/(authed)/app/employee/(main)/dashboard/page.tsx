import { Suspense } from "react";

import { EmployeeDashboardContent } from "@/components/employee/employee-dashboard-content";
import { DashboardSkeleton } from "@/components/app-dashboard/dashboard/dashboard-skeletons";

export default function EmployeeDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
