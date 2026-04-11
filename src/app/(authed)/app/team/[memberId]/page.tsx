import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { MemberProfileView } from "@/components/dashboard/team/member-profile-view";
import { getTeamMemberProfileMock } from "@/components/dashboard/team/team-mock-data";
import { SidebarLive } from "@/components/dashboard/sidebar-live";

type TeamMemberProfilePageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function TeamMemberProfilePage({ params }: TeamMemberProfilePageProps) {
  const { memberId } = await params;
  const view = getTeamMemberProfileMock(memberId);

  return (
    <DashboardShell
      sidebar={
        <Suspense>
          <SidebarLive currentPath="/app/team" />
        </Suspense>
      }
      topbar={
        <Suspense>
          <DashboardTopbarLive />
        </Suspense>
      }
    >
      <MemberProfileView view={view} />
    </DashboardShell>
  );
}
