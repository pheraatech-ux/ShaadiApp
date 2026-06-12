import { MemberProfileHeader } from "@/components/app-dashboard/team/member-profile-header";
import { MemberTaskList } from "@/components/app-dashboard/team/member-task-list";
import { TeamMemberProfileViewModel } from "@/components/app-dashboard/team/team-types";

type MemberProfileViewProps = {
  view: TeamMemberProfileViewModel;
  teamBackHref?: string;
};

export function MemberProfileView({ view, teamBackHref }: MemberProfileViewProps) {
  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Employee profile</h1>
        <p className="text-sm text-muted-foreground">Task ownership and progress across assigned weddings.</p>
      </section>
      <MemberProfileHeader view={view} teamBackHref={teamBackHref} />
      <MemberTaskList
        tasks={view.tasks}
        tasksCompleted={view.member.tasksCompleted}
        tasksTotal={view.member.tasksTotal}
      />
    </div>
  );
}
