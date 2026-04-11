import { WorkspaceTeamView } from "@/components/wedding-workspace/team/workspace-team-view";
import { getTeamPageMock } from "@/components/wedding-workspace/team/team-mock-data";

type TeamPageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ invite?: string }>;
};

export default async function WeddingWorkspaceTeamPage({ params, searchParams }: TeamPageProps) {
  const { weddingId } = await params;
  const sp = await searchParams;
  const defaultInviteOpen = sp.invite === "1";
  const view = getTeamPageMock(weddingId);

  return <WorkspaceTeamView view={view} defaultInviteOpen={defaultInviteOpen} />;
}
