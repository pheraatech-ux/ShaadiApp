import { WorkspaceSetupAndLead } from "@/components/wedding-workspace/overview/workspace-setup-and-lead";
import { TeamPanel } from "@/components/wedding-workspace/overview/team-panel";
import { TimelinePanel } from "@/components/wedding-workspace/overview/timeline-panel";
import { VendorsNeededPanel } from "@/components/wedding-workspace/overview/vendors-needed-panel";
import { WorkspaceCoupleHeader } from "@/components/wedding-workspace/overview/workspace-couple-header";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";

type WeddingWorkspaceOverviewProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function WeddingWorkspaceOverview({ workspace }: WeddingWorkspaceOverviewProps) {
  const overviewSubtitle = `Overview — ${workspace.plannerName} • ${workspace.eventCountLabel} • ${workspace.dateLabel}`;

  return (
    <div className="space-y-4">
      <WorkspaceCoupleHeader
        avatarLabel={workspace.avatarLabel}
        coupleName={workspace.coupleName}
        subtitleLine={overviewSubtitle}
        cultureTags={workspace.cultureTags.map((label) => ({ label }))}
      />
      <WorkspaceSetupAndLead workspace={workspace} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <TimelinePanel workspace={workspace} />
        <div className="flex flex-col gap-4">
          <VendorsNeededPanel workspace={workspace} />
          <TeamPanel workspace={workspace} />
        </div>
      </div>
    </div>
  );
}
