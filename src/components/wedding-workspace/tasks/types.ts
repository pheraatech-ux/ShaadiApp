import type { Database } from "@/types/database";

export type WeddingTasksBoardStatus = Database["public"]["Enums"]["task_status"];
export type WeddingTaskPriority = Database["public"]["Enums"]["task_priority"];
export type WeddingTaskVisibility = Database["public"]["Enums"]["task_visibility"];

export type WeddingTasksBoardMemberOption = {
  id: string;
  label: string;
  role: Database["public"]["Enums"]["wedding_member_role"];
  isCurrentUser: boolean;
};

export type WeddingTasksBoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: WeddingTasksBoardStatus;
  priority: WeddingTaskPriority;
  dueDate: string | null;
  linkedEventId: string | null;
  linkedEventLabel: string;
  assigneeId: string | null;
  assigneeLabel: string;
  raisedByUserId: string | null;
  raisedByLabel: string;
  visibility: WeddingTaskVisibility[];
  commentCount: number;
  isAssignedToCurrentUser: boolean;
  isOverdue: boolean;
  isDueThisWeek: boolean;
  createdAt: string;
};

export type WeddingTaskComment = {
  id: string;
  body: string;
  createdAt: string;
  authorUserId: string | null;
  authorLabel: string;
  isSystem: boolean;
};

export type WeddingTasksBoardViewModel = {
  weddingSlug: string;
  coupleName: string;
  cultureTags: string[];
  currentUserId: string;
  currentUserLabel: string;
  members: WeddingTasksBoardMemberOption[];
  events: {
    id: string;
    label: string;
    dateLabel: string;
  }[];
  tasks: WeddingTasksBoardTask[];
  summary: {
    total: number;
    myTasks: number;
    completed: number;
    overdue: number;
    dueThisWeek: number;
    flagged: number;
  };
  memberSummaries: {
    id: string;
    label: string;
    assignedCount: number;
    doneCount: number;
    overdueCount: number;
    progressPercent: number;
  }[];
};
