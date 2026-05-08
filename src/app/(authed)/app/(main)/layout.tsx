import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/app-dashboard/dashboard/dashboard-shell";
import {
  DashboardTopbarSkeleton,
  SidebarChromeSkeleton,
} from "@/components/app-dashboard/dashboard/dashboard-skeletons";
import { DashboardTopbarLive } from "@/components/app-dashboard/dashboard/dashboard-topbar-live";
import { SidebarLive } from "@/components/app-dashboard/dashboard/sidebar-live";
import { TourWrapper } from "@/components/onboarding/tour-wrapper";
import { KnockClientProvider } from "@/components/notifications/knock-client-provider";
import { generateKnockUserToken } from "@/lib/knock";
import { getKnockPublicKey } from "@/lib/env";
import { hasPendingWelcome, needsPlannerOnboarding } from "@/lib/auth/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MainAppShellLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/app/dashboard");
  }

  if (needsPlannerOnboarding(user)) {
    redirect("/app/onboarding");
  }

  if (hasPendingWelcome(user)) {
    redirect("/app/welcome");
  }

  const userId = user?.id ?? null;
  const [userToken, publicKey] = userId
    ? await Promise.all([generateKnockUserToken(userId), Promise.resolve(getKnockPublicKey())])
    : [undefined, undefined];

  return (
    <KnockClientProvider userId={userId} userToken={userToken} apiKey={publicKey}>
      <TourWrapper>
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
      </TourWrapper>
    </KnockClientProvider>
  );
}
