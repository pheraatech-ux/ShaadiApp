import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MemberProfileView } from "@/components/app-dashboard/team/member-profile-view";
import { getPlannerContext, getTeamMemberProfileView } from "@/lib/data/app-data";

type TeamMemberProfilePageProps = {
  params: Promise<{ memberId: string }>;
};

export async function generateMetadata({ params }: TeamMemberProfilePageProps): Promise<Metadata> {
  const { memberId } = await params;
  const view = await getTeamMemberProfileView(memberId);
  return { title: view?.member.name ?? "Team Member" };
}

export default async function TeamMemberProfilePage({ params }: TeamMemberProfilePageProps) {
  const { memberId } = await params;
  const [planner, view] = await Promise.all([getPlannerContext(), getTeamMemberProfileView(memberId)]);
  if (!view) {
    notFound();
  }

  return (
    <MemberProfileView
      view={view}
      teamBackHref={planner.persona === "employee" ? "/app/employee/team" : "/app/team"}
    />
  );
}
