import { WorkspaceSetupAndLead } from "@/components/wedding-workspace/overview/workspace-setup-and-lead";
import { TeamPanel } from "@/components/wedding-workspace/overview/team-panel";
import { TimelinePanel } from "@/components/wedding-workspace/overview/timeline-panel";
import { TasksForWeddingPanel } from "@/components/wedding-workspace/overview/tasks-for-wedding-panel";
import { TasksForWeddingPanelClient } from "@/components/wedding-workspace/overview/tasks-for-wedding-panel-client";
import { VendorsNeededPanel } from "@/components/wedding-workspace/overview/vendors-needed-panel";
import { WorkspaceWeddingDetailsHeader } from "@/components/wedding-workspace/overview/workspace-wedding-details-header";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";
import { WeddingTasksBoardMemberOption, WeddingTasksBoardTask } from "@/components/wedding-workspace/tasks/types";

type WeddingWorkspaceOverviewProps = {
  workspace: WeddingWorkspaceViewModel;
  /** Hide setup chips + lead banner (e.g. employee wedding workspace). */
  hideWorkspaceSetup?: boolean;
  /** Hide vendors needed panel (e.g. employee wedding workspace). */
  hideVendors?: boolean;
  /** Employee-scoped tasks to show above the timeline (employee view only). */
  assignedTasks?: WeddingTasksBoardTask[];
  /** Wedding slug — required to enable clickable task detail panel. */
  weddingSlug?: string;
  /** Team members — required to enable clickable task detail panel. */
  members?: WeddingTasksBoardMemberOption[];
  /** href for the "Show all tasks" link (e.g. /app/employee/weddings/slug/tasks). */
  tasksHref?: string;
};

export function WeddingWorkspaceOverview({ workspace, hideWorkspaceSetup = false, hideVendors = false, assignedTasks, weddingSlug, members, tasksHref }: WeddingWorkspaceOverviewProps) {
  const overviewSubtitle = `Overview — ${workspace.plannerName} • ${workspace.eventCountLabel} • ${workspace.dateLabel}`;

  return (
    <div className="space-y-4">
      <WorkspaceWeddingDetailsHeader
        avatarLabel={workspace.avatarLabel}
        coupleName={workspace.coupleName}
        dateLabel={workspace.dateLabel}
        locationLabel={workspace.locationLabel}
        cultureSummary={workspace.cultureSummary}
        countdownBadgeLabel={workspace.countdownBadgeLabel}
        strip={workspace.weddingDetailsStrip}
      />
      <p className="text-sm text-muted-foreground">{overviewSubtitle}</p>
      {hideWorkspaceSetup ? null : <WorkspaceSetupAndLead workspace={workspace} />}
      {assignedTasks ? (
        weddingSlug && members
          ? <TasksForWeddingPanelClient tasks={assignedTasks} weddingSlug={weddingSlug} members={members} tasksHref={tasksHref ?? ""} />
          : <TasksForWeddingPanel tasks={assignedTasks} tasksHref={tasksHref} />
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <TimelinePanel workspace={workspace} />
        <div className="flex flex-col gap-4">
          {hideVendors ? null : <VendorsNeededPanel workspace={workspace} />}
          <TeamPanel workspace={workspace} />
        </div>
      </div>
    </div>
  );
}
