import { notFound } from "next/navigation";

import { MemberProfileView } from "@/components/app-dashboard/team/member-profile-view";
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

  return <MemberProfileView view={view} />;
}
