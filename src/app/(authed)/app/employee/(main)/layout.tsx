import { Suspense, type ReactNode } from "react";

import { EmployeeSidebarLive } from "@/components/employee/employee-sidebar-live";
import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  DashboardTopbarSkeleton,
  SidebarChromeSkeleton,
} from "@/components/app-dashboard/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/app-dashboard/dashboard/dashboard-topbar-live";
import { KnockClientProvider } from "@/components/notifications/knock-client-provider";
import { generateKnockUserToken } from "@/lib/knock";
import { getKnockPublicKey } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EmployeeMainLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const [userToken, publicKey] = userId
    ? await Promise.all([generateKnockUserToken(userId), Promise.resolve(getKnockPublicKey())])
    : [undefined, undefined];

  return (
    <KnockClientProvider userId={userId} userToken={userToken} apiKey={publicKey}>
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
    </KnockClientProvider>
  );
}
