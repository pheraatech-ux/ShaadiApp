import { Suspense } from "react";

import { DashboardContent } from "@/components/app-dashboard/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/app-dashboard/dashboard/dashboard-skeletons";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
