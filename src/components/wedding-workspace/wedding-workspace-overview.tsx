import { AIBriefBanner } from "@/components/wedding-workspace/ai-brief-banner";
import { LeadBanner } from "@/components/wedding-workspace/lead-banner";
import { SetupBanner } from "@/components/wedding-workspace/setup-banner";
import { TeamPanel } from "@/components/wedding-workspace/team-panel";
import { TimelinePanel } from "@/components/wedding-workspace/timeline-panel";
import { VendorsNeededPanel } from "@/components/wedding-workspace/vendors-needed-panel";
import { WorkspaceHeader } from "@/components/wedding-workspace/workspace-header";
import { WorkspaceKpiGrid } from "@/components/wedding-workspace/workspace-kpi-grid";
import { WorkspaceNav } from "@/components/wedding-workspace/workspace-nav";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

type WeddingWorkspaceOverviewProps = {
  workspace: WeddingWorkspaceViewModel;
};

export function WeddingWorkspaceOverview({ workspace }: WeddingWorkspaceOverviewProps) {
  return (
    <div className="space-y-4">
      <WorkspaceHeader workspace={workspace} />
      <WorkspaceNav workspace={workspace} />
      <SetupBanner workspace={workspace} />
      <LeadBanner workspace={workspace} />
      <WorkspaceKpiGrid workspace={workspace} />
      <AIBriefBanner workspace={workspace} />
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
