import { TeamPageView } from "@/components/app-dashboard/team/team-page-view";
import { getPlannerContext, getTeamListView } from "@/lib/data/app-data";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const [planner, view] = await Promise.all([getPlannerContext(), getTeamListView()]);
  const isEmployee = planner.persona === "employee";

  return (
    <TeamPageView
      view={view}
      basePath={isEmployee ? "/app/employee" : "/app"}
      canManageTeam={!isEmployee}
    />
  );
}
