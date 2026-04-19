import { TeamPageView } from "@/components/app-dashboard/team/team-page-view";
import { getTeamListView } from "@/lib/data/app-data";

export default async function TeamPage() {
  const view = await getTeamListView();

  return <TeamPageView view={view} />;
}
