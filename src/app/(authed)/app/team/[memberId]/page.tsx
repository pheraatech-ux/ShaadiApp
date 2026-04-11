import { Suspense } from "react";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardTopbarLive } from "@/components/dashboard/dashboard-topbar-live";
import { MemberProfileView } from "@/components/dashboard/team/member-profile-view";
import { SidebarLive } from "@/components/dashboard/sidebar-live";
import { getTeamMemberProfileView } from "@/lib/data/app-data";

type TeamMemberProfilePageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function TeamMemberProfilePage({ params }: TeamMemberProfilePageProps) {
  const { memberId } = await params;
  const view = await getTeamMemberProfileView(memberId);
  if (!view) {
    notFound();
  }

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
