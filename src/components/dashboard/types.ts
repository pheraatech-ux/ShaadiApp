export type DashboardStat = {
  id: string;
  title: string;
  value: string;
  helperText: string;
  progress?: number;
};

export type DashboardAlert = {
  id: string;
  message: string;
  ctaLabel?: string;
};

export type WeddingStatus = "upcoming" | "completed";

export type WeddingItem = {
  id: string;
  name: string;
  city: string;
  firstEventDate: string;
  daysLeft: number;
  tasksDone: number;
  tasksTotal: number;
  status: WeddingStatus;
};

export type UrgentTaskItem = {
  id: string;
  title: string;
  owner: string;
  overdueLabel?: string;
  completed?: boolean;
};

export type WeeklyCompletionDay = {
  id: string;
  label: string;
  value: number;
};

export type DashboardViewModel = {
  greeting: string;
  workspaceName: string;
  userName: string;
  userEmail: string;
  stats: DashboardStat[];
  alerts: DashboardAlert[];
  weddings: WeddingItem[];
  urgentTasks: UrgentTaskItem[];
  weeklyCompletion: WeeklyCompletionDay[];
};
