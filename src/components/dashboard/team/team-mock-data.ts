import {
  TeamListPageViewModel,
  TeamMemberProfileViewModel,
  TeamMemberSummary,
} from "@/components/dashboard/team/team-types";

const members: TeamMemberSummary[] = [
  {
    id: "vik-ram",
    name: "Vik Ram",
    email: "vik@gmail.com",
    phone: "+91 98765 43210",
    initials: "VR",
    roleLabel: "Owner / admin",
    role: "owner-admin",
    activeWeddings: ["Priya & Rahul", "Sneha & Karan", "+2"],
    tasksCompleted: 34,
    tasksTotal: 47,
    overdueTasks: 0,
    lastActive: "Online now",
    status: "online",
  },
  {
    id: "ananya-mehta",
    name: "Ananya Mehta",
    email: "ananya@gmail.com",
    phone: "+91 98111 22233",
    initials: "AM",
    roleLabel: "Lead",
    role: "lead",
    activeWeddings: ["Priya & Rahul x3", "Sneha & Karan x2"],
    tasksCompleted: 12,
    tasksTotal: 28,
    overdueTasks: 5,
    lastActive: "2 hours ago",
    status: "away",
  },
  {
    id: "rohan-das",
    name: "Rohan Das",
    email: "rohan@gmail.com",
    phone: "+91 90099 12312",
    initials: "RD",
    roleLabel: "Coordinator",
    role: "coordinator",
    activeWeddings: ["Priya & Rahul x2", "Ananya & Dev"],
    tasksCompleted: 9,
    tasksTotal: 14,
    overdueTasks: 2,
    lastActive: "Yesterday",
    status: "offline",
  },
  {
    id: "preethi-sharma",
    name: "Preethi Sharma",
    email: "preethi@gmail.com",
    phone: "+91 87654 32109",
    initials: "PS",
    roleLabel: "Viewer",
    role: "viewer",
    activeWeddings: ["Maya & Arjun"],
    tasksCompleted: 0,
    tasksTotal: 0,
    overdueTasks: 0,
    lastActive: "3 days ago",
    status: "offline",
  },
];

export const teamListPageMockData: TeamListPageViewModel = {
  workspaceLabel: "All staff across your business",
  kpis: [
    { id: "members", title: "Team members", value: "4", helperText: "Including you (owner)" },
    { id: "overdue", title: "Overdue tasks (team)", value: "7", helperText: "Across 2 members" },
    { id: "weddings", title: "Weddings covered", value: "5", helperText: "4 active, 1 completed" },
    { id: "completion", title: "Avg task completion", value: "61%", helperText: "Across all active weddings" },
  ],
  alertText: "Ananya Mehta has 5 overdue tasks across 2 weddings. Rohan Das has 2 overdue.",
  members,
};

const memberTaskMap: Record<string, TeamMemberProfileViewModel["tasks"]> = {
  "vik-ram": [
    { id: "1", title: "Finalize Haldi decor vendor", weddingLabel: "Priya & Rahul", dueLabel: "Due in 1 day", status: "in-progress" },
    { id: "2", title: "Review reception timeline", weddingLabel: "Sneha & Karan", dueLabel: "Due in 3 days", status: "in-progress" },
    { id: "3", title: "Share budget summary with family", weddingLabel: "Ananya & Dev", dueLabel: "Completed", status: "done" },
  ],
  "ananya-mehta": [
    { id: "1", title: "Confirm Mehendi artist arrival", weddingLabel: "Priya & Rahul", dueLabel: "2 days overdue", status: "overdue" },
    { id: "2", title: "Close open photographer quote", weddingLabel: "Priya & Rahul", dueLabel: "1 day overdue", status: "overdue" },
    { id: "3", title: "Share catering shortlist", weddingLabel: "Sneha & Karan", dueLabel: "2 days overdue", status: "overdue" },
    { id: "4", title: "Get final baraat route approval", weddingLabel: "Sneha & Karan", dueLabel: "1 week overdue", status: "overdue" },
    { id: "5", title: "Assign venue walkthrough checklist", weddingLabel: "Priya & Rahul", dueLabel: "3 days overdue", status: "overdue" },
    { id: "6", title: "Send updated staffing plan", weddingLabel: "Sneha & Karan", dueLabel: "Due tomorrow", status: "in-progress" },
  ],
  "rohan-das": [
    { id: "1", title: "Lock transport schedule", weddingLabel: "Priya & Rahul", dueLabel: "1 day overdue", status: "overdue" },
    { id: "2", title: "Call stage sound vendor", weddingLabel: "Ananya & Dev", dueLabel: "3 days overdue", status: "overdue" },
    { id: "3", title: "Upload rehearsal notes", weddingLabel: "Ananya & Dev", dueLabel: "Completed", status: "done" },
  ],
  "preethi-sharma": [{ id: "1", title: "No assigned tasks yet", weddingLabel: "Maya & Arjun", dueLabel: "Read-only access", status: "in-progress" }],
};

export function getTeamMemberProfileMock(memberId: string): TeamMemberProfileViewModel {
  const member = members.find((m) => m.id === memberId) ?? members[0];
  const completionPercent =
    member.tasksTotal > 0 ? Math.round((member.tasksCompleted / member.tasksTotal) * 100) : 0;

  return {
    member,
    completionPercent,
    tasks: memberTaskMap[member.id] ?? [],
  };
}
