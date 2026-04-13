import { AppPageHeader } from "@/components/dashboard/app-page-header";
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
      <AppPageHeader title="Teams" description={view.workspaceLabel} />
      <TeamSummaryCards cards={view.kpis} />
      <TeamAlertBanner message={view.alertText} />
      <TeamMembersTable members={view.members} />
    </div>
  );
}
