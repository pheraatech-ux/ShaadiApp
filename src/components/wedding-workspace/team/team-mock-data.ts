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
    memberCountLabel: "2/3",
    memberCap: 3,
    summaryDescription:
      "Free plan: 3 members max including you. Members get role-specific access to tasks, vendors, and messages for this wedding only.",
    members: [
      {
        id: "vik",
        name: "Vik Ram (you)",
        subtitle: "Lead planner • wedding admin",
        avatarLabel: "VR",
        avatarClassName: "bg-emerald-600 text-white",
        status: "active",
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
        rightLabel: "Invited",
        rightClassName: "text-violet-600 dark:text-violet-400",
      },
      {
        id: "liaison",
        name: "Invite assistant or family liaison",
        subtitle: "Read-only or assigned tasks only",
        avatarLabel: "+",
        status: "placeholder",
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
