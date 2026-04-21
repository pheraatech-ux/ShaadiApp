import { notFound } from "next/navigation";

import { EmployeeWorkspaceTeamView } from "@/components/wedding-workspace/team/employee-workspace-team-view";
import { getWeddingTeamViewBySlug } from "@/lib/data/app-data";

type TeamPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function EmployeeWeddingWorkspaceTeamPage({ params }: TeamPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingTeamViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <EmployeeWorkspaceTeamView view={view} />;
}
