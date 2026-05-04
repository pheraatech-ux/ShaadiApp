import type { Database } from "@/types/database";

export type WeddingTasksBoardStatus = Database["public"]["Enums"]["task_status"];
export type WeddingTaskPriority = Database["public"]["Enums"]["task_priority"];
export type WeddingTaskVisibility = Database["public"]["Enums"]["task_visibility"];

export type WeddingTasksBoardMemberOption = {
  id: string;
  label: string;
  role: Database["public"]["Enums"]["wedding_member_role"];
  isCurrentUser: boolean;
  isVendor?: boolean;
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
  /** Populated only in the all-weddings view; used to show the wedding badge on cards. */
  weddingName?: string;
  /** Primary assignee id (first in array) — kept for backward-compat filters. */
  assigneeId: string | null;
  /** All assignee user ids. */
  assigneeIds: string[];
  assigneeLabel: string;
  assigneeLabels: string[];
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
  weddingId: string;
  weddingSlug: string;
  coupleName: string;
  cultureTags: string[];
  /** Server only returned tasks tied to this user (assignee or raiser); UI skips extra “team member” narrowing. */
  scopedToEmployeeTasks?: boolean;
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

export type AllTasksBoardTask = WeddingTasksBoardTask & {
  weddingId: string;
  weddingSlug: string;
  weddingName: string;
};

export type AllTasksBoardWedding = {
  id: string;
  slug: string;
  name: string;
  members: WeddingTasksBoardMemberOption[];
  events: { id: string; label: string; dateLabel: string }[];
};

export type AllTasksBoardViewModel = {
  currentUserId: string;
  currentUserLabel: string;
  /** Server scoped tasks to this user only (employee persona). */
  scopedToEmployeeTasks: boolean;
  tasks: AllTasksBoardTask[];
  weddings: AllTasksBoardWedding[];
  /** Deduplicated members across all accessible weddings. */
  allMembers: WeddingTasksBoardMemberOption[];
  summary: {
    total: number;
    myTasks: number;
    completed: number;
    overdue: number;
    dueThisWeek: number;
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
