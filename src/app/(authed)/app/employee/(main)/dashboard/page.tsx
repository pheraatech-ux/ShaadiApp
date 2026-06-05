import { Suspense } from "react";

import { EmployeeDashboardContent } from "@/components/employee/employee-dashboard-content";
import { EmployeeDashboardSkeleton } from "@/components/app-dashboard/dashboard/dashboard-skeletons";

export default function EmployeeDashboardPage() {
  return (
    <Suspense fallback={<EmployeeDashboardSkeleton />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
