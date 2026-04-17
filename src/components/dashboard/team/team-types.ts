export type EmployeeRole = "owner-admin" | "lead" | "coordinator" | "assistant" | "viewer";

export type EmployeeStatus = "online" | "offline" | "away";

export type TeamMemberSummary = {
  id: string;
  linkedUserId?: string | null;
  name: string;
  email: string;
  phone: string;
  initials: string;
  roleLabel: string;
  role: EmployeeRole;
  activeWeddings: string[];
  tasksCompleted: number;
  tasksTotal: number;
  overdueTasks: number;
  lastActive: string;
  status: EmployeeStatus;
  employmentStatus: "invited" | "active" | "inactive";
  inviteExpiresAt?: string | null;
};

export type TeamKpiCard = {
  id: string;
  title: string;
  value: string;
  helperText: string;
};

export type TeamListPageViewModel = {
  workspaceLabel: string;
  kpis: TeamKpiCard[];
  alertText: string;
  members: TeamMemberSummary[];
};

export type TeamTaskStatus = "done" | "in-progress" | "overdue";

export type TeamTaskItem = {
  id: string;
  title: string;
  weddingLabel: string;
  dueLabel: string;
  status: TeamTaskStatus;
};

export type TeamMemberProfileViewModel = {
  member: TeamMemberSummary;
  completionPercent: number;
  tasks: TeamTaskItem[];
};
