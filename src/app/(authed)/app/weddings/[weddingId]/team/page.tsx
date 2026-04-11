import { notFound } from "next/navigation";

import { WorkspaceTeamView } from "@/components/wedding-workspace/team/workspace-team-view";
import { getWeddingTeamViewBySlug } from "@/lib/data/app-data";

type TeamPageProps = {
  params: Promise<{ weddingId: string }>;
  searchParams: Promise<{ invite?: string }>;
};

export default async function WeddingWorkspaceTeamPage({ params, searchParams }: TeamPageProps) {
  const { weddingId } = await params;
  const sp = await searchParams;
  const defaultInviteOpen = sp.invite === "1";
  const view = await getWeddingTeamViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <WorkspaceTeamView view={view} defaultInviteOpen={defaultInviteOpen} />;
}
