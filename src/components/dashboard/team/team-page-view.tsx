import { TeamAlertBanner } from "@/components/dashboard/team/team-alert-banner";
import { TeamMembersTable } from "@/components/dashboard/team/team-members-table";
import { TeamSummaryCards } from "@/components/dashboard/team/team-summary-cards";
import { TeamListPageViewModel } from "@/components/dashboard/team/team-types";

type TeamPageViewProps = {
  view: TeamListPageViewModel;
};

export function TeamPageView({ view }: TeamPageViewProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">{view.workspaceLabel}</p>
      </section>
      <TeamSummaryCards cards={view.kpis} />
      <TeamAlertBanner message={view.alertText} />
      <TeamMembersTable members={view.members} />
    </div>
  );
}
