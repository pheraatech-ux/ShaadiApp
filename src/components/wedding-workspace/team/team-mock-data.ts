import { TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";

const teamByWeddingId: Record<string, TeamPageViewModel> = {
  "priya-rahul": {
    weddingId: "priya-rahul",
    coupleName: "Priya & Rahul",
    avatarLabel: "PR",
    cultureTags: [
      { label: "Punjabi", tone: "punjabi" },
      { label: "Tamil", tone: "tamil" },
    ],
    venueLine: "Team — Grand Palace, Mumbai • 15 Dec 2025",
    memberCountLabel: "3/3",
    memberCap: 3,
    summaryDescription:
      "Free plan: 3 members max including you. Members get role-specific access to tasks, vendors, and messages for this wedding only.",
    kpis: [
      {
        id: "members",
        title: "Members on this wedding",
        value: "3",
        helperText: "Owner + 2 team members",
      },
      {
        id: "completion",
        title: "Task completion",
        value: "64%",
        helperText: "Across assigned wedding tasks",
      },
      {
        id: "overdue",
        title: "Overdue tasks",
        value: "4",
        helperText: "Need reminders today",
      },
    ],
    members: [
      {
        id: "vik",
        name: "Vik Ram (you)",
        subtitle: "Lead planner • wedding admin",
        avatarLabel: "VR",
        avatarClassName: "bg-emerald-600 text-white",
        status: "active",
        accessLevel: "full",
        activeTaskCount: 18,
        completedTaskCount: 15,
        overdueTaskCount: 0,
        rightLabel: "Admin - owner",
        rightClassName: "text-muted-foreground",
      },
      {
        id: "krishna",
        name: "krishna",
        subtitle: "Invite sent • pending join",
        avatarLabel: "K",
        avatarClassName: "bg-violet-600 text-white",
        status: "invited",
        accessLevel: "coordinator",
        activeTaskCount: 14,
        completedTaskCount: 9,
        overdueTaskCount: 3,
        rightLabel: "Invited",
        rightClassName: "text-violet-600 dark:text-violet-400",
      },
      {
        id: "rohan",
        name: "Rohan Das",
        subtitle: "Coordinator • joined 3 weeks ago",
        avatarLabel: "RD",
        avatarClassName: "bg-sky-600 text-white",
        status: "active",
        accessLevel: "coordinator",
        activeTaskCount: 12,
        completedTaskCount: 8,
        overdueTaskCount: 1,
        rightLabel: "Active",
        rightClassName: "text-emerald-600 dark:text-emerald-400",
      },
      {
        id: "liaison",
        name: "Invite assistant or family liaison",
        subtitle: "Read-only or assigned tasks only",
        avatarLabel: "+",
        status: "placeholder",
        accessLevel: "removed",
        activeTaskCount: 0,
        completedTaskCount: 0,
        overdueTaskCount: 0,
        rightLabel: "Invite",
        rightClassName: "",
      },
    ],
  },
};

export function getTeamPageMock(weddingId: string): TeamPageViewModel {
  return (
    teamByWeddingId[weddingId] ?? {
      ...teamByWeddingId["priya-rahul"],
      weddingId,
    }
  );
}
