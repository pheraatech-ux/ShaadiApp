import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { DashboardViewModel, WeddingItem } from "@/components/app-dashboard/dashboard/types";
import type {
  TeamListPageViewModel,
  TeamMemberProfileViewModel,
  TeamMemberSummary,
  TeamTaskItem,
} from "@/components/app-dashboard/team/team-types";
import type { AllWeddingRow, AllWeddingsPageView, AllWeddingsStage } from "@/components/app-dashboard/all-weddings/types";
import type { TeamPageViewModel } from "@/components/wedding-workspace/team/team-types";
import type {
  WeddingTasksBoardMemberOption,
  WeddingTasksBoardTask,
  WeddingTasksBoardViewModel,
} from "@/components/wedding-workspace/tasks/types";
import type { WeddingMessagesWorkspaceViewModel } from "@/components/wedding-workspace/messages/types";
import type { WeddingVendorsWorkspaceViewModel } from "@/components/wedding-workspace/vendors/types";
import type { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/overview/types";
import { buildTimeOfDayGreeting } from "@/lib/planner-display";
import {
  BUDGET_BUCKETS,
  buildRecommendedBudgetSplit,
  mapBudgetCategoryToBucket,
  type BudgetBucketId,
} from "@/lib/budget-recommendations";
import { resolvePersona } from "@/lib/employee/persona";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { taskTouchesWorkspaceUser } from "@/lib/wedding-task-scope";
import type { Database } from "@/types/database";

export type WorkspaceSidebarBadgeCounts = {
  teamCount: number;
  memberCap: number;
  vendorPendingCount: number;
  taskOverdueCount: number;
  messageCount: number;
};

export type AppSidebarCounts = {
  weddings: number;
  team: number;
  tasksOverdue: number;
  messages: number;
};

export type CreateWeddingInput = {
  brideName: string;
  groomName: string;
  weddingDate?: string;
  city?: string;
  venueName?: string;
  cultures: string[];
  events: { title: string; eventDate?: string; cultureLabel?: string }[];
  totalBudgetPaise: number;
};

export type WeddingBudgetWorkspaceViewModel = {
  weddingSlug: string;
  coupleName: string;
  cultures: string[];
  totalBudgetPaise: number;
  spentBudgetPaise: number;
  allocatedBudgetPaise: number;
  recommendationProfile: string;
  recommendationNotes: string[];
  buckets: Array<{
    id: BudgetBucketId;
    label: string;
    recommendedPercent: number;
    recommendedPaise: number;
    allocatedPaise: number;
    spentPaise: number;
  }>;
  budgetItems: Array<{
    id: string;
    category: string;
    allocatedPaise: number;
    spentPaise: number;
    bucketId: BudgetBucketId;
    bucketLabel: string;
  }>;
};

export type BudgetPortfolioViewModel = {
  totalBudgetPaise: number;
  totalAllocatedPaise: number;
  totalSpentPaise: number;
  weddingsAtRisk: number;
  portfolioUtilizationPercent: number;
  topBuckets: Array<{
    id: BudgetBucketId;
    label: string;
    spentPaise: number;
    allocatedPaise: number;
  }>;
  weddingRows: Array<{
    id: string;
    weddingSlug: string;
    coupleName: string;
    totalBudgetPaise: number;
    allocatedPaise: number;
    spentPaise: number;
    status: "healthy" | "watch" | "overrun";
    cultures: string[];
  }>;
};

type WeddingRow = {
  id: string;
  slug: string;
  couple_name: string;
  bride_name: string;
  groom_name: string;
  city: string | null;
  venue_name: string | null;
  wedding_date: string | null;
  cultures: string[];
  status: "upcoming" | "completed" | "cancelled";
  total_budget_paise: number;
  spent_budget_paise: number;
};

type WeddingMemberRow = {
  id: string;
  wedding_id: string;
  user_id: string | null;
  invited_email: string | null;
  display_name: string | null;
  role: "owner" | "lead" | "coordinator" | "viewer";
  status: "active" | "invited" | "removed";
};

type CompanyEmployeeRow = {
  id: string;
  owner_user_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  role: "coordinator" | "assistant" | "viewer";
  employment_status: "invited" | "active" | "inactive";
  invited_at: string | null;
  created_at: string;
};

type CompanyEmployeeInviteRow = {
  id: string;
  employee_id: string;
  expires_at: string;
  created_at: string;
  claimed_at: string | null;
  revoked_at: string | null;
};

type TaskRow = {
  id: string;
  wedding_id: string;
  title: string;
  assignee_user_id: string | null;
  raised_by_user_id: string | null;
  linked_event_id: string | null;
  status: "todo" | "in_progress" | "needs_review" | "done";
  due_date: string | null;
  completed_at: string | null;
};

type PlannerContext = {
  userId: string;
  email: string;
  displayName: string;
  workspaceName: string;
};

function formatDateLabel(dateStr?: string | null) {
  if (!dateStr) return "Not scheduled";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(label: string) {
  return label
    .split("&")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(`${dateStr}T00:00:00`);
  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

function toInrLakh(paise: number) {
  const rupees = paise / 100;
  const lakh = rupees / 100000;
  return `₹${lakh.toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
}

function normalizeInviteStatus(value: string | null | undefined): "not_sent" | "sent" | "joined" {
  if (value === "sent" || value === "joined") return value;
  return "not_sent";
}

function safeSlugPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildStatusFromWedding(wedding: WeddingRow): "upcoming" | "completed" {
  return wedding.status === "completed" ? "completed" : "upcoming";
}

async function getPlannerContextFromSupabase(supabase: SupabaseClient<Database>): Promise<PlannerContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, business_name")
    .eq("id", user.id)
    .maybeSingle();

  const firstName = profile?.first_name?.trim() ?? "";
  const lastName = profile?.last_name?.trim() ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "Planner";
  const workspaceName = profile?.business_name?.trim() || "ShaadiOS Workspace";

  return {
    userId: user.id,
    email: user.email ?? "",
    displayName,
    workspaceName,
  };
}

const getPlannerContext = cache(async (): Promise<PlannerContext> => {
  const supabase = await createSupabaseServerClient();
  return getPlannerContextFromSupabase(supabase);
});

async function getAccessibleWeddingIds(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wedding_members")
    .select("wedding_id")
    .eq("user_id", userId)
    .neq("status", "removed");

  if (error) throw error;
  return [...new Set((data ?? []).map((row) => row.wedding_id))];
}

async function getAccessibleWeddings(userId: string) {
  const supabase = await createSupabaseServerClient();
  const weddingIds = await getAccessibleWeddingIds(userId);
  if (!weddingIds.length) return [] as WeddingRow[];

  const { data, error } = await supabase
    .from("weddings")
    .select(
      "id, slug, couple_name, bride_name, groom_name, city, venue_name, wedding_date, cultures, status, total_budget_paise, spent_budget_paise",
    )
    .in("id", weddingIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as WeddingRow[];
}

async function getTasksForWeddingIds(weddingIds: string[]) {
  if (!weddingIds.length) return [] as TaskRow[];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, wedding_id, title, assignee_user_id, raised_by_user_id, linked_event_id, status, due_date, completed_at")
    .in("wedding_id", weddingIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TaskRow[];
}

async function buildUrgentTaskItems(
  overdueTasks: TaskRow[],
  weddings: WeddingRow[],
  tasksAppRoot: "/app" | "/app/employee",
): Promise<DashboardViewModel["urgentTasks"]> {
  const sorted = [...overdueTasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
  const sliced = sorted.slice(0, 5);
  if (!sliced.length) return [];

  const supabase = await createSupabaseServerClient();
  const weddingById = new Map(weddings.map((w) => [w.id, w]));
  const taskIds = sliced.map((t) => t.id);
  const eventIds = [...new Set(sliced.map((t) => t.linked_event_id).filter(Boolean))] as string[];

  const [{ data: commentRows }, { data: eventRows }] = await Promise.all([
    supabase.from("task_comments").select("task_id").in("task_id", taskIds),
    eventIds.length
      ? supabase.from("wedding_events").select("id, title").in("id", eventIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const commentCountByTask = new Map<string, number>();
  for (const row of commentRows ?? []) {
    const tid = row.task_id;
    commentCountByTask.set(tid, (commentCountByTask.get(tid) ?? 0) + 1);
  }

  const eventTitleById = new Map((eventRows ?? []).map((e) => [e.id, e.title]));

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return sliced.map((task) => {
    const wedding = weddingById.get(task.wedding_id);
    const slug = wedding?.slug ?? "";
    const coupleName = wedding?.couple_name ?? "Wedding";
    const due = task.due_date;
    const dueDt = due ? new Date(`${due}T00:00:00`) : null;
    const daysOverdue = dueDt
      ? Math.max(1, Math.ceil((todayStart.getTime() - dueDt.getTime()) / 86400000))
      : undefined;

    const dueDateLabel = dueDt
      ? dueDt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      : undefined;

    const contextLabel = task.linked_event_id
      ? (eventTitleById.get(task.linked_event_id) ?? "General")
      : "General";

    const href = slug ? `${tasksAppRoot}/weddings/${encodeURIComponent(slug)}/tasks` : undefined;

    return {
      id: task.id,
      title: task.title,
      owner: "Team",
      overdueLabel: daysOverdue ? `${daysOverdue}d overdue` : undefined,
      taskHref: href,
      coupleName,
      contextLabel,
      dueDateLabel,
      daysOverdue,
      commentCount: commentCountByTask.get(task.id) ?? 0,
    };
  });
}

export const getWorkspaceShellInfo = cache(async () => {
  const planner = await getPlannerContext();
  return {
    workspaceName: planner.workspaceName,
    userName: planner.displayName,
    userEmail: planner.email,
  };
});

export const getAppSidebarCounts = cache(async (): Promise<AppSidebarCounts> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((w) => w.id);
  if (!weddingIds.length) {
    return {
      weddings: 0,
      team: 0,
      tasksOverdue: 0,
      messages: 0,
    };
  }
  const tasks = await getTasksForWeddingIds(weddingIds);

  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today).length;

  const supabase = await createSupabaseServerClient();
  const { data: memberRows } = await supabase
    .from("wedding_members")
    .select("user_id")
    .in("wedding_id", weddingIds)
    .eq("status", "active")
    .not("user_id", "is", null);

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { head: true, count: "exact" })
    .in("wedding_id", weddingIds);

  const memberSet = new Set((memberRows ?? []).map((row) => row.user_id).filter(Boolean));

  return {
    weddings: weddings.length,
    team: memberSet.size,
    tasksOverdue: overdue,
    messages: messageCount ?? 0,
  };
});

export const getWeddingSlugList = cache(async () => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  return weddings.map((wedding) => wedding.slug);
});

export const getAllWeddingsPageView = cache(async (): Promise<AllWeddingsPageView> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((wedding) => wedding.id);
  const today = new Date().toISOString().slice(0, 10);

  if (!weddingIds.length) {
    return {
      items: [],
      counts: {
        all: 0,
        active: 0,
        planning: 0,
        completed: 0,
      },
      planCap: 5,
      usedSlots: 0,
    };
  }

  const supabase = await createSupabaseServerClient();
  const persona = await resolvePersona(supabase, planner.userId);
  const [{ data: tasksData }, { data: docsData }] = await Promise.all([
    supabase
      .from("tasks")
      .select("wedding_id, status, due_date, assignee_user_id, raised_by_user_id")
      .in("wedding_id", weddingIds),
    supabase
      .from("documents")
      .select("wedding_id")
      .in("wedding_id", weddingIds),
  ]);

  type TaskAggRow = {
    wedding_id: string;
    status: string;
    due_date: string | null;
    assignee_user_id: string | null;
    raised_by_user_id: string | null;
  };
  const rawTasks = (tasksData ?? []) as TaskAggRow[];
  const tasksForStats =
    persona === "employee" ? rawTasks.filter((t) => taskTouchesWorkspaceUser(t, planner.userId)) : rawTasks;

  const tasksByWedding = new Map<
    string,
    {
      total: number;
      done: number;
      overdue: number;
    }
  >();

  for (const task of tasksForStats) {
    const current = tasksByWedding.get(task.wedding_id) ?? { total: 0, done: 0, overdue: 0 };
    current.total += 1;
    if (task.status === "done") {
      current.done += 1;
    } else if (task.due_date && task.due_date < today) {
      current.overdue += 1;
    }
    tasksByWedding.set(task.wedding_id, current);
  }

  const docsByWedding = new Map<string, number>();
  for (const row of docsData ?? []) {
    docsByWedding.set(row.wedding_id, (docsByWedding.get(row.wedding_id) ?? 0) + 1);
  }

  const items = weddings.map((wedding) => {
    const taskStats = tasksByWedding.get(wedding.id) ?? { total: 0, done: 0, overdue: 0 };
    const docsCount = docsByWedding.get(wedding.id) ?? 0;
    const daysAway = daysUntil(wedding.wedding_date);
    const completionRatio = taskStats.total > 0 ? taskStats.done / taskStats.total : 0;

    const stage: AllWeddingsStage =
      wedding.status === "completed"
        ? "completed"
        : taskStats.overdue > 0 || daysAway <= 90
          ? "active"
          : "planning";
    const stageLabel = stage === "completed" ? "Done" : stage === "active" ? "Active" : "Planning";
    const taskSubtitle =
      taskStats.overdue > 0
        ? `${taskStats.overdue} overdue`
        : taskStats.total === 0
          ? "No tasks yet"
          : "On track";
    const proposalStatus: AllWeddingRow["proposalStatus"] =
      stage === "completed" || completionRatio >= 0.6
        ? "Signed"
        : taskStats.total > 0
          ? "Draft"
          : "Pending";
    const invoiceStatus: AllWeddingRow["invoiceStatus"] =
      stage === "completed"
        ? "Closed"
        : taskStats.overdue > 0
          ? "Pending"
          : taskStats.done > 0
            ? "Sent"
            : "None";

    return {
      id: wedding.slug,
      coupleName: wedding.couple_name,
      city: wedding.city ?? "Not set",
      venueName: wedding.venue_name ?? "Venue TBD",
      dateLabel: formatDateLabel(wedding.wedding_date),
      weddingDateRaw: wedding.wedding_date,
      daysAway,
      stage,
      stageLabel,
      overdueCount: taskStats.overdue,
      pendingCount: Math.max(0, taskStats.total - taskStats.done - taskStats.overdue),
      tasksDone: taskStats.done,
      tasksTotal: taskStats.total,
      taskSubtitle,
      cultures: wedding.cultures ?? [],
      budgetLabel: toInrLakh(wedding.total_budget_paise),
      proposalStatus,
      invoiceStatus,
      documentsCount: docsCount,
    };
  });

  return {
    items,
    counts: {
      all: items.length,
      active: items.filter((item) => item.stage === "active").length,
      planning: items.filter((item) => item.stage === "planning").length,
      completed: items.filter((item) => item.stage === "completed").length,
    },
    planCap: 5,
    usedSlots: items.length,
  };
});

export const getDashboardView = cache(async (): Promise<DashboardViewModel> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((w) => w.id);
  const tasks = await getTasksForWeddingIds(weddingIds);
  const supabase = await createSupabaseServerClient();

  const { data: vendorRows } = weddingIds.length
    ? await supabase
        .from("vendors")
        .select("status, wedding_id")
        .in("wedding_id", weddingIds)
    : { data: [] as { status: "pending" | "confirmed" | "declined"; wedding_id: string }[] };

  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = tasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today);
  const doneTaskIds = new Set(tasks.filter((task) => task.status === "done").map((task) => task.id));
  const budgetTotal = weddings.reduce((sum, wedding) => sum + wedding.total_budget_paise, 0);
  const overBudgetCount = weddings.filter((wedding) => wedding.spent_budget_paise > wedding.total_budget_paise).length;
  const vendorPending = (vendorRows ?? []).filter((vendor) => vendor.status !== "confirmed").length;

  const tasksByWedding = new Map<string, { total: number; done: number }>();
  for (const task of tasks) {
    const current = tasksByWedding.get(task.wedding_id) ?? { total: 0, done: 0 };
    current.total += 1;
    if (doneTaskIds.has(task.id)) current.done += 1;
    tasksByWedding.set(task.wedding_id, current);
  }

  const weddingItems: WeddingItem[] = weddings.map((wedding) => {
    const counts = tasksByWedding.get(wedding.id) ?? { total: 0, done: 0 };
    return {
      id: wedding.slug,
      name: wedding.couple_name,
      city: wedding.city ?? "Not set",
      firstEventDate: formatDateLabel(wedding.wedding_date),
      daysLeft: daysUntil(wedding.wedding_date),
      tasksDone: counts.done,
      tasksTotal: counts.total,
      status: buildStatusFromWedding(wedding),
    };
  });

  const urgentTasks = await buildUrgentTaskItems(overdueTasks, weddings, "/app");

  const weekdayIds = [
    { id: "monday", label: "M" },
    { id: "tuesday", label: "T" },
    { id: "wednesday", label: "W" },
    { id: "thursday", label: "T" },
    { id: "friday", label: "F" },
  ];
  const weeklyCompletion = weekdayIds.map((day) => ({ ...day, value: 0 }));

  return {
    greeting: buildTimeOfDayGreeting(planner.displayName),
    workspaceName: planner.workspaceName,
    userName: planner.displayName,
    userEmail: planner.email,
    stats: [
      {
        id: "active-weddings",
        title: "Active Weddings",
        value: String(weddings.filter((w) => w.status !== "completed").length),
        helperText: `${weddings.length} total`,
        progress: weddings.length > 0 ? 100 : 0,
      },
      {
        id: "tasks-overdue",
        title: "Tasks Overdue",
        value: String(overdueTasks.length),
        helperText: "Across all accessible weddings",
        progress: tasks.length > 0 ? Math.round((overdueTasks.length / tasks.length) * 100) : 0,
      },
      {
        id: "total-budget",
        title: "Total Budget Managed",
        value: toInrLakh(budgetTotal),
        helperText: `${weddings.length} weddings`,
        progress: 0,
      },
      {
        id: "vendors-unconfirmed",
        title: "Vendors Unconfirmed",
        value: String(vendorPending),
        helperText: "Needs follow-up",
        progress: (vendorRows ?? []).length > 0 ? Math.round((vendorPending / (vendorRows ?? []).length) * 100) : 0,
      },
    ],
    alerts: [
      ...(overdueTasks.length > 0
        ? [
            {
              id: "overdue",
              message: `${overdueTasks.length} tasks are overdue and need attention.`,
              ctaLabel: "Review now",
            },
          ]
        : []),
      ...(overBudgetCount > 0
        ? [
            {
              id: "budget-overrun",
              message: `${overBudgetCount} wedding budgets are trending over plan.`,
              ctaLabel: "Open budget",
            },
          ]
        : []),
    ],
    weddings: weddingItems,
    urgentTasks,
    weeklyCompletion,
  };
});

export const getEmployeeDashboardView = cache(async (): Promise<DashboardViewModel> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((w) => w.id);
  const tasks = await getTasksForWeddingIds(weddingIds);
  const scopedTasks = tasks.filter((task) => taskTouchesWorkspaceUser(task, planner.userId));

  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = scopedTasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today);
  const pendingTasks = scopedTasks.filter((task) => task.status === "todo");
  const inProgressTasks = scopedTasks.filter((task) => task.status === "in_progress");
  const doneTaskIds = new Set(scopedTasks.filter((task) => task.status === "done").map((task) => task.id));

  const tasksByWedding = new Map<string, { total: number; done: number }>();
  for (const task of scopedTasks) {
    const current = tasksByWedding.get(task.wedding_id) ?? { total: 0, done: 0 };
    current.total += 1;
    if (doneTaskIds.has(task.id)) current.done += 1;
    tasksByWedding.set(task.wedding_id, current);
  }

  const weddingItems: WeddingItem[] = weddings.map((wedding) => {
    const counts = tasksByWedding.get(wedding.id) ?? { total: 0, done: 0 };
    return {
      id: wedding.slug,
      name: wedding.couple_name,
      city: wedding.city ?? "Not set",
      firstEventDate: formatDateLabel(wedding.wedding_date),
      daysLeft: daysUntil(wedding.wedding_date),
      tasksDone: counts.done,
      tasksTotal: counts.total,
      status: buildStatusFromWedding(wedding),
    };
  });

  const urgentTasks = await buildUrgentTaskItems(overdueTasks, weddings, "/app/employee");

  const weekdayIds = [
    { id: "monday", label: "M" },
    { id: "tuesday", label: "T" },
    { id: "wednesday", label: "W" },
    { id: "thursday", label: "T" },
    { id: "friday", label: "F" },
  ];
  const weeklyCompletion = weekdayIds.map((day) => ({ ...day, value: 0 }));

  return {
    greeting: buildTimeOfDayGreeting(planner.displayName),
    workspaceName: planner.workspaceName,
    userName: planner.displayName,
    userEmail: planner.email,
    stats: [
      {
        id: "tasks-pending",
        title: "Pending Tasks",
        value: String(pendingTasks.length),
        helperText: "Todo tasks",
        progress: scopedTasks.length > 0 ? Math.round((pendingTasks.length / scopedTasks.length) * 100) : 0,
      },
      {
        id: "tasks-in-progress",
        title: "In Progress Tasks",
        value: String(inProgressTasks.length),
        helperText: "Work currently underway",
        progress: scopedTasks.length > 0 ? Math.round((inProgressTasks.length / scopedTasks.length) * 100) : 0,
      },
      {
        id: "active-weddings",
        title: "Active Weddings",
        value: String(weddings.filter((w) => w.status !== "completed").length),
        helperText: `${weddings.length} total`,
        progress: weddings.length > 0 ? 100 : 0,
      },
      {
        id: "tasks-overdue",
        title: "Overdue Tasks",
        value: String(overdueTasks.length),
        helperText: "Across all accessible weddings",
        progress: scopedTasks.length > 0 ? Math.round((overdueTasks.length / scopedTasks.length) * 100) : 0,
      },
    ],
    alerts: [
      ...(overdueTasks.length > 0
        ? [
            {
              id: "overdue",
              message: `${overdueTasks.length} of your tasks are overdue and need attention.`,
              ctaLabel: "Review now",
            },
          ]
        : []),
    ],
    weddings: weddingItems,
    urgentTasks,
    weeklyCompletion,
  };
});

export const getWeddingWorkspaceBySlug = cache(
  async (weddingSlug: string): Promise<WeddingWorkspaceViewModel | null> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const persona = await resolvePersona(supabase, planner.userId);
    const [{ data: tasksData }, { data: eventsData }, { data: vendorsData }, { data: membersData }] =
      await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status, due_date, assignee_user_id, raised_by_user_id")
          .eq("wedding_id", wedding.id),
        supabase
          .from("wedding_events")
          .select("id, title, event_date, culture_label")
          .eq("wedding_id", wedding.id)
          .order("event_date", { ascending: true }),
        supabase
          .from("vendors")
          .select("id, name, category, notes, status")
          .eq("wedding_id", wedding.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wedding_members")
          .select("id, wedding_id, user_id, invited_email, display_name, role, status")
          .eq("wedding_id", wedding.id),
      ]);

    const tasks = (tasksData ?? []) as {
      id: string;
      title: string;
      status: "todo" | "in_progress" | "needs_review" | "done";
      due_date: string | null;
      assignee_user_id: string | null;
      raised_by_user_id: string | null;
    }[];
    const events = (eventsData ?? []) as { id: string; title: string; event_date: string | null; culture_label: string | null }[];
    const vendors = (vendorsData ?? []) as { id: string; name: string; category: string; notes: string | null; status: "pending" | "confirmed" | "declined" }[];
    const members = (membersData ?? []) as WeddingMemberRow[];

    const scopedTasks =
      persona === "employee" ? tasks.filter((task) => taskTouchesWorkspaceUser(task, planner.userId)) : tasks;

    const activeMembers = members.filter((member) => member.status === "active");
    const currentMembership = activeMembers.find((member) => member.user_id === planner.userId);
    const taskDoneCount = scopedTasks.filter((task) => task.status === "done").length;
    const dueSoonCount = scopedTasks.filter(
      (task) => task.status !== "done" && task.due_date && daysUntil(task.due_date) <= 7,
    ).length;
    const pendingVendors = vendors.filter((vendor) => vendor.status !== "confirmed");
    const daysAway = daysUntil(wedding.wedding_date);
    const countdownBadgeLabel = !wedding.wedding_date
      ? "DATE NOT SET"
      : daysAway === 0
        ? "WEDDING DAY"
        : `${daysAway} DAY${daysAway === 1 ? "" : "S"} AWAY`;
    const cultureSummary = (wedding.cultures ?? [])[0] ?? "—";
    const stripTotal = scopedTasks.length;
    const stripProgress = stripTotal > 0 ? Math.round((taskDoneCount / stripTotal) * 100) : 0;

    return {
      id: wedding.slug,
      coupleName: wedding.couple_name,
      plannerName: [wedding.venue_name, wedding.city].filter(Boolean).join(", ") || "Venue not set",
      avatarLabel: getInitials(wedding.couple_name),
      locationLabel: wedding.city ?? "Not set",
      dateLabel: formatDateLabel(wedding.wedding_date),
      daysLeftLabel: `${daysAway} days`,
      daysAway,
      countdownBadgeLabel,
      cultureSummary,
      weddingDetailsStrip: {
        tasksDone: taskDoneCount,
        tasksTotal: stripTotal,
        teamMembers: activeMembers.length,
        progressPercent: stripProgress,
      },
      cultureTags: wedding.cultures ?? [],
      eventCountLabel: `${events.length} events`,
      navItems: [
        { id: "overview", label: "Overview" },
        { id: "team", label: "Team", badge: `${activeMembers.length}/3` },
        { id: "vendors", label: "Vendors", badge: pendingVendors.length },
        { id: "tasks", label: "Tasks", badge: dueSoonCount },
        { id: "budget", label: "Budget" },
        { id: "messages", label: "Messages" },
        { id: "documents", label: "Documents" },
        { id: "ai-report", label: "AI report" },
      ],
      setupTitle: "Workspace setup status",
      setupDescription: "This workspace reflects your real data. Empty modules will stay empty until you add records.",
      setupChips: [
        wedding.wedding_date ? "Wedding date set" : "Set wedding date",
        activeMembers.length > 0 ? "Team member assigned" : "Assign lead planner",
        vendors.length > 0 ? "Vendor added" : "Add first vendor",
        tasks.length > 0 ? "Task added" : "Add first task",
      ],
      leadBannerTitle:
        currentMembership?.role === "owner" || currentMembership?.role === "lead"
          ? "You are the lead for this wedding"
          : "No lead assigned",
      leadBannerDescription:
        currentMembership?.role === "owner" || currentMembership?.role === "lead"
          ? "You receive ownership-level access and reminders for this wedding."
          : "Assign a lead from the team page to activate lead-level reminders.",
      kpis: [
        {
          id: "tasks",
          label: "Tasks",
          value: String(scopedTasks.length),
          helperText: `${taskDoneCount} done, ${dueSoonCount} due soon`,
        },
        { id: "events", label: "Events", value: String(events.length), helperText: "Timeline driven by your DB records" },
        { id: "vendors", label: "Vendors", value: String(vendors.length), helperText: `${pendingVendors.length} pending confirmation` },
        {
          id: "budget",
          label: "Budget",
          value: toInrLakh(wedding.total_budget_paise),
          helperText: `${toInrLakh(wedding.spent_budget_paise)} spent`,
        },
      ],
      aiBriefTitle: "AI brief",
      aiBriefDescription: "No generated brief yet. Add events, tasks, and vendors to power richer insights.",
      timelineTitle: `Event timeline - ${events.length} ceremonies`,
      timelineCultureFilters: (wedding.cultures ?? []).slice(0, 3).map((culture, index) => ({
        id: culture.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: culture,
        tone: index % 3 === 0 ? "punjabi" : index % 3 === 1 ? "tamil" : "shared",
      })),
      timelineEvents: events.map((event) => ({
        id: event.id,
        title: event.title,
        dateLabel: formatDateLabel(event.event_date),
        tags: event.culture_label ? [event.culture_label] : [],
        daysLeftLabel: `${daysUntil(event.event_date)} days`,
      })),
      timelineMoreEventsLabel: undefined,
      vendorsNeeded: pendingVendors.slice(0, 5).map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        role: vendor.category,
        note: vendor.notes ?? "No notes yet",
        statusLabel: vendor.status === "pending" ? "Pending" : vendor.status === "declined" ? "Declined" : "Confirmed",
        urgency: vendor.status === "pending" ? "high" : "low",
      })),
      teamMembers: activeMembers.map((member) => ({
        id: member.id,
        avatarLabel: getInitials(member.display_name ?? member.invited_email ?? "TM"),
        name:
          member.user_id === planner.userId
            ? `${planner.displayName} (you)`
            : member.display_name ?? member.invited_email ?? "Team member",
        subtitle: `${member.role} • ${member.status}`,
        badge: member.role === "owner" ? "Admin" : undefined,
      })),
      teamInvites: [
        { id: "invite-member", label: "Invite team member" },
        { id: "invite-coordinator", label: "Invite coordinator" },
      ],
      teamFooterNote: "Members only see weddings they are explicitly assigned to.",
    };
  },
);

export const getWorkspaceSidebarCounts = cache(
  async (weddingSlug: string): Promise<WorkspaceSidebarBadgeCounts> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) {
      return { teamCount: 0, memberCap: 3, vendorPendingCount: 0, taskOverdueCount: 0, messageCount: 0 };
    }

    const supabase = await createSupabaseServerClient();
    const persona = await resolvePersona(supabase, planner.userId);
    const [{ count: teamCount }, { count: vendorPendingCount }, { data: tasks }, { count: messageCount }] =
      await Promise.all([
        supabase
          .from("wedding_members")
          .select("*", { head: true, count: "exact" })
          .eq("wedding_id", wedding.id)
          .eq("status", "active"),
        supabase
          .from("vendors")
          .select("*", { head: true, count: "exact" })
          .eq("wedding_id", wedding.id)
          .neq("status", "confirmed"),
        supabase
          .from("tasks")
          .select("status, due_date, assignee_user_id, raised_by_user_id")
          .eq("wedding_id", wedding.id),
        supabase
          .from("messages")
          .select("*", { head: true, count: "exact" })
          .eq("wedding_id", wedding.id),
      ]);

    const taskRows = (tasks ?? []) as {
      status: string;
      due_date: string | null;
      assignee_user_id: string | null;
      raised_by_user_id: string | null;
    }[];
    const scopedForOverdue =
      persona === "employee"
        ? taskRows.filter((task) => taskTouchesWorkspaceUser(task, planner.userId))
        : taskRows;

    const today = new Date().toISOString().slice(0, 10);
    const taskOverdueCount = scopedForOverdue.filter(
      (task) => task.status !== "done" && task.due_date && task.due_date < today,
    ).length;

    return {
      teamCount: teamCount ?? 0,
      memberCap: 3,
      vendorPendingCount: vendorPendingCount ?? 0,
      taskOverdueCount,
      messageCount: messageCount ?? 0,
    };
  },
);

export const getTeamListView = cache(async (): Promise<TeamListPageViewModel> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((wedding) => wedding.id);

  const supabase = await createSupabaseServerClient();
  const { data: companyEmployeeRows, error: companyEmployeesError } = await supabase
    .from("company_employees")
    .select("id, owner_user_id, user_id, name, phone, email, role, employment_status, invited_at, created_at")
    .eq("owner_user_id", planner.userId)
    .order("created_at", { ascending: false });

  if (companyEmployeesError && companyEmployeesError.code !== "42P01") {
    throw companyEmployeesError;
  }

  const companyEmployees = (companyEmployeeRows ?? []) as CompanyEmployeeRow[];
  if (companyEmployees.length > 0) {
    const linkedUserIds = [...new Set(companyEmployees.map((row) => row.user_id).filter(Boolean))] as string[];
    const employeeIds = companyEmployees.map((row) => row.id);
    /** Include the workspace owner so their weddings/tasks load even when every invite is still pending (no linked user ids). */
    const weddingAndTaskUserIds = [...new Set([...linkedUserIds, planner.userId])];

    const hasWeddings = weddingIds.length > 0;
    const [{ data: weddingMemberRows }, { data: taskRows }, { data: inviteRows }, { data: ownerProfileRow }] =
      await Promise.all([
        hasWeddings
          ? supabase
              .from("wedding_members")
              .select("wedding_id, user_id")
              .in("wedding_id", weddingIds)
              .in("user_id", weddingAndTaskUserIds)
              .eq("status", "active")
          : Promise.resolve({ data: [] as { wedding_id: string; user_id: string | null }[] | null }),
        hasWeddings
          ? supabase
              .from("tasks")
              .select("id, assignee_user_id, status, due_date")
              .in("wedding_id", weddingIds)
              .in("assignee_user_id", weddingAndTaskUserIds)
          : Promise.resolve({
              data: [] as {
                id: string;
                assignee_user_id: string | null;
                status: "todo" | "in_progress" | "needs_review" | "done";
                due_date: string | null;
              }[] | null,
            }),
        supabase
          .from("company_employee_invites")
          .select("id, employee_id, expires_at, created_at, claimed_at, revoked_at")
          .in("employee_id", employeeIds)
          .is("claimed_at", null)
          .is("revoked_at", null)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("phone").eq("id", planner.userId).maybeSingle(),
      ]);

    const weddingNameById = new Map(weddings.map((wedding) => [wedding.id, wedding.couple_name]));
    const weddingsByUserId = new Map<string, string[]>();
    for (const row of weddingMemberRows ?? []) {
      if (!row.user_id) continue;
      const existing = weddingsByUserId.get(row.user_id) ?? [];
      const weddingLabel = weddingNameById.get(row.wedding_id);
      if (weddingLabel && !existing.includes(weddingLabel)) {
        existing.push(weddingLabel);
      }
      weddingsByUserId.set(row.user_id, existing);
    }

    const tasks = (taskRows ?? []) as { id: string; assignee_user_id: string | null; status: "todo" | "in_progress" | "needs_review" | "done"; due_date: string | null }[];
    const invites = (inviteRows ?? []) as CompanyEmployeeInviteRow[];
    const today = new Date().toISOString().slice(0, 10);
    const nowTimestamp = Date.now();
    const latestInviteByEmployeeId = new Map<string, CompanyEmployeeInviteRow>();
    for (const invite of invites) {
      if (!latestInviteByEmployeeId.has(invite.employee_id)) {
        latestInviteByEmployeeId.set(invite.employee_id, invite);
      }
    }

    const employeeMemberRows: TeamMemberSummary[] = companyEmployees.map((employee) => {
      const latestInvite = latestInviteByEmployeeId.get(employee.id) ?? null;
      const linkedUserTasks = employee.user_id ? tasks.filter((task) => task.assignee_user_id === employee.user_id) : [];
      const doneCount = linkedUserTasks.filter((task) => task.status === "done").length;
      const overdueCount = linkedUserTasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today).length;
      const activeWeddings = employee.user_id ? (weddingsByUserId.get(employee.user_id) ?? []) : [];
      const roleLabel =
        employee.role === "coordinator"
          ? "Coordinator"
          : employee.role === "assistant"
            ? "Assistant"
            : "Viewer";
      const inviteExpired = latestInvite ? new Date(latestInvite.expires_at).getTime() <= nowTimestamp : false;
      const status =
        employee.employment_status === "active"
          ? overdueCount > 0
            ? "away"
            : "online"
          : "offline";
      const lastActive =
        employee.employment_status === "invited"
          ? inviteExpired
            ? "Invite expired"
            : "Invite pending"
          : employee.employment_status === "inactive"
            ? "Inactive"
            : "Recently active";

      return {
        id: employee.id,
        linkedUserId: employee.user_id,
        name: employee.name,
        email: employee.email ?? "No email",
        phone: employee.phone,
        initials: getInitials(employee.name || "TM"),
        roleLabel,
        role: employee.role,
        activeWeddings: activeWeddings.slice(0, 3),
        tasksCompleted: doneCount,
        tasksTotal: linkedUserTasks.length,
        overdueTasks: overdueCount,
        lastActive,
        status,
        employmentStatus: employee.employment_status,
        inviteExpiresAt: latestInvite?.expires_at ?? null,
        deletable: employee.user_id !== planner.userId,
      };
    });

    const ownerHasCompanyRow = companyEmployees.some((row) => row.user_id === planner.userId);
    const ownerPhone =
      ownerProfileRow && typeof ownerProfileRow.phone === "string" && ownerProfileRow.phone.trim()
        ? ownerProfileRow.phone.trim()
        : "No phone";

    const teamMembers: TeamMemberSummary[] = (() => {
      if (ownerHasCompanyRow) {
        return employeeMemberRows;
      }
      const ownerTasks = tasks.filter((task) => task.assignee_user_id === planner.userId);
      const ownerDone = ownerTasks.filter((task) => task.status === "done").length;
      const ownerOverdue = ownerTasks.filter(
        (task) => task.status !== "done" && task.due_date && task.due_date < today,
      ).length;
      const ownerWeddings = weddingsByUserId.get(planner.userId) ?? [];
      const ownerRow: TeamMemberSummary = {
        id: planner.userId,
        linkedUserId: planner.userId,
        name: planner.displayName,
        email: planner.email || "No email",
        phone: ownerPhone,
        initials: getInitials(planner.displayName || "YO"),
        roleLabel: "Owner / admin",
        role: "owner-admin",
        activeWeddings: ownerWeddings.slice(0, 3),
        tasksCompleted: ownerDone,
        tasksTotal: ownerTasks.length,
        overdueTasks: ownerOverdue,
        lastActive: "Recently active",
        status: ownerOverdue > 0 ? "away" : "online",
        employmentStatus: "active",
        inviteExpiresAt: null,
        deletable: false,
      };
      return [ownerRow, ...employeeMemberRows];
    })();

    const totalTasks = teamMembers.reduce((sum, member) => sum + member.tasksTotal, 0);
    const totalDone = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
    const totalOverdue = teamMembers.reduce((sum, member) => sum + member.overdueTasks, 0);
    const completionPercent = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    return {
      workspaceLabel: "All staff across your business",
      kpis: [
        { id: "members", title: "Team members", value: String(teamMembers.length), helperText: "Company employees" },
        { id: "overdue", title: "Overdue tasks (team)", value: String(totalOverdue), helperText: "Across assigned tasks" },
        { id: "weddings", title: "Weddings covered", value: String(weddings.length), helperText: "Accessible to you" },
        { id: "completion", title: "Avg task completion", value: `${completionPercent}%`, helperText: "Across all assigned tasks" },
      ],
      alertText:
        totalOverdue > 0 ? `${totalOverdue} tasks are overdue. Send reminders from member profiles.` : "No overdue team tasks right now.",
      members: teamMembers,
      currentUserId: planner.userId,
    };
  }

  if (!weddingIds.length) {
    return {
      workspaceLabel: "All staff across your business",
      kpis: [
        { id: "members", title: "Team members", value: "0", helperText: "No members added yet" },
        { id: "overdue", title: "Overdue tasks (team)", value: "0", helperText: "No overdue tasks" },
        { id: "weddings", title: "Weddings covered", value: "0", helperText: "Create your first wedding" },
        { id: "completion", title: "Avg task completion", value: "0%", helperText: "No task history yet" },
      ],
      alertText: "No overdue team tasks right now.",
      members: [],
      currentUserId: planner.userId,
    };
  }

  const [{ data: memberRows }, { data: taskRows }] = await Promise.all([
    supabase
      .from("wedding_members")
      .select("id, wedding_id, user_id, invited_email, display_name, role, status")
      .in("wedding_id", weddingIds)
      .neq("status", "removed"),
    supabase
      .from("tasks")
      .select("id, wedding_id, assignee_user_id, status, due_date")
      .in("wedding_id", weddingIds),
  ]);

  const members = (memberRows ?? []) as WeddingMemberRow[];
  const tasks = (taskRows ?? []) as { id: string; wedding_id: string; assignee_user_id: string | null; status: "todo" | "in_progress" | "needs_review" | "done"; due_date: string | null }[];
  const userIds = [...new Set(members.map((row) => row.user_id).filter(Boolean))] as string[];
  const { data: profileRows } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name, phone")
          .in("id", userIds)
      : { data: [] as { id: string; first_name: string | null; last_name: string | null; phone: string | null }[] };

  const profiles = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id,
      {
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Team member",
        phone: profile.phone ?? "No phone",
      },
    ]),
  );
  const weddingNameById = new Map(weddings.map((wedding) => [wedding.id, wedding.couple_name]));
  const today = new Date().toISOString().slice(0, 10);

  const membersByUser = new Map<string, WeddingMemberRow[]>();
  for (const member of members) {
    if (!member.user_id) continue;
    const list = membersByUser.get(member.user_id) ?? [];
    list.push(member);
    membersByUser.set(member.user_id, list);
  }

  const teamMembers: TeamMemberSummary[] = [...membersByUser.entries()].map(([userId, rows]) => {
    const profile = profiles.get(userId);
    const name = profile?.name || rows[0]?.display_name || "Team member";
    const assignedWeddings = [...new Set(rows.map((row) => weddingNameById.get(row.wedding_id)).filter(Boolean))] as string[];
    const userTasks = tasks.filter((task) => task.assignee_user_id === userId);
    const doneCount = userTasks.filter((task) => task.status === "done").length;
    const overdueCount = userTasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today).length;
    const role = rows.some((row) => row.role === "owner")
      ? "owner-admin"
      : rows.some((row) => row.role === "lead")
        ? "lead"
        : rows.some((row) => row.role === "coordinator")
          ? "coordinator"
          : "viewer";

    return {
      id: userId,
      linkedUserId: userId,
      name,
      email: userId === planner.userId ? planner.email : "Member email hidden",
      phone: profile?.phone ?? "No phone",
      initials: getInitials(name),
      roleLabel:
        role === "owner-admin"
          ? "Owner / admin"
          : role === "lead"
            ? "Lead"
            : role === "coordinator"
              ? "Coordinator"
              : "Viewer",
      role,
      activeWeddings: assignedWeddings.slice(0, 3),
      tasksCompleted: doneCount,
      tasksTotal: userTasks.length,
      overdueTasks: overdueCount,
      lastActive: "Recently active",
      status: overdueCount > 0 ? "away" : "online",
      employmentStatus: "active",
      inviteExpiresAt: null,
      deletable: false,
    };
  });

  const totalTasks = tasks.length;
  const totalDone = tasks.filter((task) => task.status === "done").length;
  const totalOverdue = tasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today).length;
  const completionPercent = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return {
    workspaceLabel: "All staff across your business",
    kpis: [
      { id: "members", title: "Team members", value: String(teamMembers.length), helperText: "Unique active members" },
      { id: "overdue", title: "Overdue tasks (team)", value: String(totalOverdue), helperText: "Across assigned tasks" },
      { id: "weddings", title: "Weddings covered", value: String(weddings.length), helperText: "Accessible to you" },
      { id: "completion", title: "Avg task completion", value: `${completionPercent}%`, helperText: "Across all assigned tasks" },
    ],
    alertText:
      totalOverdue > 0 ? `${totalOverdue} tasks are overdue. Send reminders from member profiles.` : "No overdue team tasks right now.",
    members: teamMembers,
    currentUserId: planner.userId,
  };
});

export const getTeamMemberProfileView = cache(
  async (memberId: string): Promise<TeamMemberProfileViewModel | null> => {
    const team = await getTeamListView();
    const member = team.members.find((item) => item.id === memberId);
    if (!member) return null;

    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const weddingIds = weddings.map((wedding) => wedding.id);
    const targetUserId = member.linkedUserId ?? null;
    if (!weddingIds.length || !targetUserId) {
      return { member, completionPercent: 0, tasks: [] };
    }

    const supabase = await createSupabaseServerClient();
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("id, title, status, due_date, wedding_id")
      .eq("assignee_user_id", targetUserId)
      .in("wedding_id", weddingIds)
      .order("created_at", { ascending: false });

    const weddingNameById = new Map(weddings.map((wedding) => [wedding.id, wedding.couple_name]));
    const tasks: TeamTaskItem[] = ((taskRows ?? []) as { id: string; title: string; status: "todo" | "in_progress" | "needs_review" | "done"; due_date: string | null; wedding_id: string }[]).map((task) => ({
      id: task.id,
      title: task.title,
      weddingLabel: weddingNameById.get(task.wedding_id) ?? "Wedding",
      dueLabel: task.due_date ? `Due ${formatDateLabel(task.due_date)}` : "No due date",
      status:
        task.status === "done"
          ? "done"
          : task.due_date && task.due_date < new Date().toISOString().slice(0, 10)
            ? "overdue"
            : "in-progress",
    }));

    const completionPercent = member.tasksTotal > 0 ? Math.round((member.tasksCompleted / member.tasksTotal) * 100) : 0;

    return { member, completionPercent, tasks };
  },
);

export const getWeddingTeamViewBySlug = cache(
  async (weddingSlug: string): Promise<TeamPageViewModel | null> => {
    const workspace = await getWeddingWorkspaceBySlug(weddingSlug);
    if (!workspace) return null;

    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const [{ data: memberRows }, { data: taskRows }] = await Promise.all([
      supabase
        .from("wedding_members")
        .select("id, wedding_id, user_id, invited_email, display_name, role, status")
        .eq("wedding_id", wedding.id)
        .neq("status", "removed"),
      supabase
        .from("tasks")
        .select("id, status, assignee_user_id, due_date")
        .eq("wedding_id", wedding.id),
    ]);

    const members = (memberRows ?? []) as WeddingMemberRow[];
    const tasks = (taskRows ?? []) as { id: string; status: "todo" | "in_progress" | "needs_review" | "done"; assignee_user_id: string | null; due_date: string | null }[];
    const today = new Date().toISOString().slice(0, 10);

    const rows = members.map((member) => {
      const assignedTasks = tasks.filter((task) => task.assignee_user_id === member.user_id);
      const done = assignedTasks.filter((task) => task.status === "done").length;
      const overdue = assignedTasks.filter((task) => task.status !== "done" && task.due_date && task.due_date < today).length;
      const displayName = member.user_id === planner.userId ? `${planner.displayName} (you)` : member.display_name ?? member.invited_email ?? "Team member";
      return {
        id: member.id,
        name: displayName,
        subtitle: `${member.role} • ${member.status}`,
        avatarLabel: getInitials(displayName),
        status: member.status === "active" ? "active" : "invited",
        accessLevel: member.role === "viewer" ? "coordinator" : "full",
        activeTaskCount: assignedTasks.length,
        completedTaskCount: done,
        overdueTaskCount: overdue,
        rightLabel: member.status === "active" ? "Active" : "Invited",
        rightClassName:
          member.status === "active" ? "text-emerald-600 dark:text-emerald-300" : "text-violet-600 dark:text-violet-300",
      } as TeamPageViewModel["members"][number];
    });

    const activeCount = rows.filter((row) => row.status === "active").length;
    const totalOverdue = rows.reduce((sum, row) => sum + row.overdueTaskCount, 0);
    const totalAssigned = rows.reduce((sum, row) => sum + row.activeTaskCount, 0);
    const totalDone = rows.reduce((sum, row) => sum + row.completedTaskCount, 0);

    return {
      weddingId: weddingSlug,
      coupleName: workspace.coupleName,
      avatarLabel: workspace.avatarLabel,
      cultureTags: workspace.cultureTags.slice(0, 2).map((label, index) => ({
        label,
        tone: index % 2 === 0 ? "punjabi" : "tamil",
      })),
      venueLine: `Team - ${workspace.plannerName} • ${workspace.dateLabel}`,
      memberCountLabel: `${activeCount}/3`,
      memberCap: 3,
      summaryDescription: "Members only see this wedding and its related modules.",
      kpis: [
        { id: "members", title: "Members on this wedding", value: String(activeCount), helperText: "Active assignments" },
        {
          id: "completion",
          title: "Task completion",
          value: `${totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 0}%`,
          helperText: "Across assigned tasks",
        },
        { id: "overdue", title: "Overdue tasks", value: String(totalOverdue), helperText: "Needs follow-up" },
      ],
      members: rows,
    };
  },
);

export const getWeddingTasksBoardViewBySlug = cache(
  async (weddingSlug: string): Promise<WeddingTasksBoardViewModel | null> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const persona = await resolvePersona(supabase, planner.userId);
    const [{ data: taskRows }, { data: memberRows }, { data: eventRows }, { data: commentRows }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, linked_event_id, assignee_user_id, raised_by_user_id, visibility, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("wedding_members")
        .select("id, user_id, invited_email, display_name, role, status")
        .eq("wedding_id", wedding.id)
        .eq("status", "active"),
      supabase
        .from("wedding_events")
        .select("id, title, event_date")
        .eq("wedding_id", wedding.id)
        .order("event_date", { ascending: true }),
      supabase
        .from("task_comments")
        .select("task_id")
        .eq("wedding_id", wedding.id),
    ]);

    const activeMembers = (memberRows ?? []) as WeddingMemberRow[];
    type BoardTaskRow = {
      id: string;
      title: string;
      description: string | null;
      status: "todo" | "in_progress" | "needs_review" | "done";
      priority: "high" | "medium" | "low";
      due_date: string | null;
      linked_event_id: string | null;
      assignee_user_id: string | null;
      raised_by_user_id: string | null;
      visibility: ("team_only" | "client_family" | "vendor")[] | null;
      created_at: string;
    };
    const rawTaskRows = (taskRows ?? []) as BoardTaskRow[];
    const taskRowsForBoard =
      persona === "employee"
        ? rawTaskRows.filter((task) => taskTouchesWorkspaceUser(task, planner.userId))
        : rawTaskRows;

    const taskAssigneeIds = [...new Set(taskRowsForBoard.map((task) => task.assignee_user_id).filter(Boolean))] as string[];
    const memberUserIds = [...new Set([...activeMembers.map((member) => member.user_id).filter(Boolean), ...taskAssigneeIds])] as string[];
    const { data: profileRows } =
      memberUserIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", memberUserIds)
        : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };

    const profileNameById = new Map(
      (profileRows ?? []).map((profile) => {
        const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
        return [profile.id, fullName || "Team member"];
      }),
    );

    const memberDisplayById = new Map(
      activeMembers
        .filter((member) => Boolean(member.user_id))
        .map((member) => [member.user_id as string, member.display_name || member.invited_email || "Team member"]),
    );

    const memberOptions: WeddingTasksBoardMemberOption[] = activeMembers
      .filter((member) => Boolean(member.user_id))
      .map((member) => {
        const userId = member.user_id as string;
        const profileName = profileNameById.get(userId);
        const safeLabel = profileName || member.display_name || member.invited_email || "Team member";
        return {
          id: userId,
          label: safeLabel.match(/^[0-9a-f-]{32,}$/i) ? "Team member" : safeLabel,
          role: member.role,
          isCurrentUser: userId === planner.userId,
        };
      });

    for (const assigneeId of taskAssigneeIds) {
      if (memberOptions.some((member) => member.id === assigneeId)) continue;
      memberOptions.push({
        id: assigneeId,
        label: profileNameById.get(assigneeId) || memberDisplayById.get(assigneeId) || "Archived member",
        role: "viewer",
        isCurrentUser: assigneeId === planner.userId,
      });
    }

    memberOptions.sort((a, b) => a.label.localeCompare(b.label));

    const today = new Date().toISOString().slice(0, 10);
    const oneWeekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const eventById = new Map((eventRows ?? []).map((event) => [event.id, event]));
    const commentCountByTaskId = new Map<string, number>();
    for (const row of commentRows ?? []) {
      commentCountByTaskId.set(row.task_id, (commentCountByTaskId.get(row.task_id) ?? 0) + 1);
    }

    const tasks: WeddingTasksBoardTask[] = taskRowsForBoard.map((task) => {
      const assignee = memberOptions.find((member) => member.id === task.assignee_user_id) ?? null;
      const raisedBy = memberOptions.find((member) => member.id === task.raised_by_user_id) ?? null;
      const linkedEvent = task.linked_event_id ? eventById.get(task.linked_event_id) : null;
      const overdue = Boolean(task.status !== "done" && task.due_date && task.due_date < today);
      const dueThisWeek = Boolean(task.status !== "done" && task.due_date && task.due_date >= today && task.due_date <= oneWeekFromNow);
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority ?? "medium",
        dueDate: task.due_date,
        linkedEventId: task.linked_event_id,
        linkedEventLabel: linkedEvent?.title ?? "General (no event)",
        assigneeId: task.assignee_user_id,
        assigneeLabel: assignee?.isCurrentUser ? `${assignee.label} (you)` : assignee?.label ?? "Unassigned",
        raisedByUserId: task.raised_by_user_id,
        raisedByLabel: raisedBy?.isCurrentUser ? `${raisedBy.label} (me)` : raisedBy?.label ?? "Team member",
        visibility: task.visibility ?? ["team_only"],
        commentCount: commentCountByTaskId.get(task.id) ?? 0,
        isAssignedToCurrentUser: task.assignee_user_id === planner.userId,
        isOverdue: overdue,
        isDueThisWeek: dueThisWeek,
        createdAt: task.created_at,
      };
    });

    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "done").length;
    const overdue = tasks.filter((task) => task.isOverdue).length;
    const dueThisWeek = tasks.filter((task) => task.isDueThisWeek).length;
    const flagged = tasks.filter((task) => task.isOverdue || !task.assigneeId).length;
    const myTasks = tasks.filter((task) => task.isAssignedToCurrentUser).length;

    const memberSummaries = memberOptions
      .map((member) => {
        const assignedTasks = tasks.filter((task) => task.assigneeId === member.id);
        const doneCount = assignedTasks.filter((task) => task.status === "done").length;
        const overdueCount = assignedTasks.filter((task) => task.isOverdue).length;
        return {
          id: member.id,
          label: member.isCurrentUser ? `${member.label} (you)` : member.label,
          assignedCount: assignedTasks.length,
          doneCount,
          overdueCount,
          progressPercent: assignedTasks.length > 0 ? Math.round((doneCount / assignedTasks.length) * 100) : 0,
        };
      })
      .sort((a, b) => b.assignedCount - a.assignedCount)
      .slice(0, 4);

    return {
      weddingSlug,
      coupleName: wedding.couple_name,
      cultureTags: wedding.cultures ?? [],
      scopedToEmployeeTasks: persona === "employee",
      currentUserId: planner.userId,
      currentUserLabel: memberOptions.find((member) => member.id === planner.userId)?.label ?? planner.displayName,
      members: memberOptions,
      events: (eventRows ?? []).map((event) => ({
        id: event.id,
        label: event.title,
        dateLabel: formatDateLabel(event.event_date),
      })),
      tasks,
      summary: {
        total,
        myTasks,
        completed,
        overdue,
        dueThisWeek,
        flagged,
      },
      memberSummaries,
    };
  },
);

export const getWeddingVendorsWorkspaceViewBySlug = cache(
  async (weddingSlug: string): Promise<WeddingVendorsWorkspaceViewModel | null> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const { data: vendorRows, error } = await supabase
      .from("vendors")
      .select(
        "id, name, category, phone, email, instagram_handle, quoted_price_paise, advance_paid_paise, status, notes, whatsapp_invite_status, whatsapp_invited_at, created_at",
      )
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const vendors = (vendorRows ?? []).map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      phone: vendor.phone,
      email: vendor.email,
      instagramHandle: vendor.instagram_handle,
      quotedPricePaise: vendor.quoted_price_paise ?? 0,
      advancePaidPaise: vendor.advance_paid_paise ?? 0,
      status: vendor.status,
      notes: vendor.notes,
      inviteStatus: normalizeInviteStatus(vendor.whatsapp_invite_status),
      inviteSentAt: vendor.whatsapp_invited_at,
      createdAt: vendor.created_at,
    }));

    const summary = {
      total: vendors.length,
      confirmed: vendors.filter((vendor) => vendor.status === "confirmed").length,
      shortlisted: vendors.filter((vendor) => vendor.status === "pending").length,
      declined: vendors.filter((vendor) => vendor.status === "declined").length,
      inviteSent: vendors.filter((vendor) => vendor.inviteStatus !== "not_sent").length,
      pendingJoin: vendors.filter((vendor) => vendor.inviteStatus === "sent").length,
      totalQuotedPaise: vendors.reduce((sum, vendor) => sum + vendor.quotedPricePaise, 0),
      totalAdvancePaise: vendors.reduce((sum, vendor) => sum + vendor.advancePaidPaise, 0),
    };

    const categorySet = new Set<string>();
    for (const vendor of vendors) {
      if (vendor.category.trim()) categorySet.add(vendor.category.trim());
    }

    return {
      weddingSlug,
      coupleName: wedding.couple_name,
      summary,
      quickCategories: [...categorySet].sort((a, b) => a.localeCompare(b)).slice(0, 8),
      vendors,
    };
  },
);

export const getWeddingMessagesWorkspaceViewBySlug = cache(
  async (weddingSlug: string): Promise<WeddingMessagesWorkspaceViewModel | null> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const [{ data: messageRows }, { data: memberRows }, { data: threadRows }] = await Promise.all([
      supabase
        .from("messages")
        .select("id, body, created_at, author_user_id, thread_id")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("wedding_members")
        .select("user_id, display_name, invited_email, status")
        .eq("wedding_id", wedding.id)
        .neq("status", "removed"),
      supabase
        .from("message_threads")
        .select("id, title, is_default, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: true }),
    ]);
    const rawThreads = (threadRows ?? []) as { id: string; title: string; is_default: boolean; created_at: string }[];
    const { data: threadMemberRows } =
      rawThreads.length > 0
        ? await supabase
            .from("message_thread_members")
            .select("thread_id, user_id")
            .in("thread_id", rawThreads.map((thread) => thread.id))
        : { data: [] as { thread_id: string; user_id: string }[] };

    const members = (memberRows ?? []) as {
      user_id: string | null;
      display_name: string | null;
      invited_email: string | null;
      status: "active" | "invited" | "removed";
    }[];
    const threadMembers = (threadMemberRows ?? []) as { thread_id: string; user_id: string }[];

    const fallbackThreadIds = rawThreads.map((thread) => thread.id);
    const userIds = [
      ...new Set(
        [
          ...members.map((member) => member.user_id),
          ...((messageRows ?? []).map((message) => message.author_user_id) as Array<string | null>),
          ...threadMembers.map((member) => member.user_id),
        ].filter(Boolean),
      ),
    ] as string[];

    const { data: profileRows } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", userIds)
        : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };

    const memberDisplayByUserId = new Map<string, string>();
    for (const member of members) {
      if (!member.user_id) continue;
      memberDisplayByUserId.set(member.user_id, member.display_name || member.invited_email || "Team member");
    }

    const profileNameByUserId = new Map(
      (profileRows ?? []).map((profile) => [
        profile.id,
        [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Team member",
      ]),
    );

    const displayNameByUserId = new Map<string, string>();
    for (const userId of userIds) {
      displayNameByUserId.set(
        userId,
        profileNameByUserId.get(userId) || memberDisplayByUserId.get(userId) || "Team member",
      );
    }

    const messages = ((messageRows ?? []) as {
      id: string;
      body: string;
      created_at: string;
      author_user_id: string | null;
      thread_id: string;
    }[]).map((message) => {
      const authorLabel = message.author_user_id
        ? displayNameByUserId.get(message.author_user_id) || "Team member"
        : "System";
      return {
        id: message.id,
        threadId: message.thread_id,
        body: message.body,
        createdAt: message.created_at,
        authorUserId: message.author_user_id,
        authorLabel,
        authorInitials: getInitials(authorLabel),
        isCurrentUser: message.author_user_id === planner.userId,
      };
    });

    const participantById = new Map<
      string,
      {
        id: string;
        label: string;
        initials: string;
        isCurrentUser: boolean;
        status: "active" | "invited";
        messageCount: number;
        lastMessageAt: string | null;
      }
    >();

    for (const member of members) {
      if (!member.user_id) continue;
      const label =
        displayNameByUserId.get(member.user_id) || member.display_name || member.invited_email || "Team member";
      participantById.set(member.user_id, {
        id: member.user_id,
        label,
        initials: getInitials(label),
        isCurrentUser: member.user_id === planner.userId,
        status: member.status === "active" ? "active" : "invited",
        messageCount: 0,
        lastMessageAt: null,
      });
    }

    for (const message of messages) {
      if (!message.authorUserId) continue;
      const current = participantById.get(message.authorUserId) ?? {
        id: message.authorUserId,
        label: message.authorLabel,
        initials: message.authorInitials,
        isCurrentUser: message.isCurrentUser,
        status: "active" as const,
        messageCount: 0,
        lastMessageAt: null,
      };
      current.messageCount += 1;
      current.lastMessageAt = message.createdAt;
      participantById.set(message.authorUserId, current);
    }

    const participants = [...participantById.values()].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });

    const participantByUserId = new Map(participants.map((participant) => [participant.id, participant]));
    const threadParticipantIds = new Map<string, string[]>();
    for (const member of threadMembers) {
      const current = threadParticipantIds.get(member.thread_id) ?? [];
      current.push(member.user_id);
      threadParticipantIds.set(member.thread_id, current);
    }

    const threadMessageStats = new Map<string, { count: number; lastMessageAt: string | null }>();
    for (const message of messages) {
      const current = threadMessageStats.get(message.threadId) ?? { count: 0, lastMessageAt: null };
      current.count += 1;
      current.lastMessageAt = message.createdAt;
      threadMessageStats.set(message.threadId, current);
    }

    const threads = rawThreads
      .map((thread) => {
        const participantIds = [...new Set(threadParticipantIds.get(thread.id) ?? [])];
        const participantLabels = participantIds
          .map((participantId) => participantByUserId.get(participantId)?.label ?? displayNameByUserId.get(participantId) ?? "Team member")
          .sort((a, b) => a.localeCompare(b));
        const stats = threadMessageStats.get(thread.id) ?? { count: 0, lastMessageAt: null };
        return {
          id: thread.id,
          title: thread.title,
          isDefault: thread.is_default,
          participantIds,
          participantLabels,
          messageCount: stats.count,
          lastMessageAt: stats.lastMessageAt,
        };
      })
      .sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

    const latestMessage = messages[messages.length - 1];
    const defaultThreadId = threads.find((thread) => thread.isDefault)?.id ?? fallbackThreadIds[0] ?? null;

    return {
      weddingSlug: weddingSlug,
      coupleName: wedding.couple_name,
      currentUserId: planner.userId,
      currentUserLabel: displayNameByUserId.get(planner.userId) || planner.displayName,
      defaultThreadId,
      messages,
      threads,
      participants,
      summary: {
        totalMessages: messages.length,
        participantCount: participants.length,
        threadCount: threads.length,
        lastMessageAt: latestMessage?.createdAt ?? null,
      },
    };
  },
);

export async function createWedding(
  input: CreateWeddingInput,
  options?: { supabase: SupabaseClient<Database> },
) {
  const supabase = options?.supabase ?? (await createSupabaseServerClient());
  await getPlannerContextFromSupabase(supabase);

  const baseSlug = safeSlugPart(`${input.brideName}-${input.groomName}`) || "wedding";
  const slugCandidate = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  const { data, error } = await supabase.rpc("create_wedding_with_events", {
    p_bride_name: input.brideName.trim(),
    p_groom_name: input.groomName.trim(),
    p_city: input.city?.trim() || undefined,
    p_venue_name: input.venueName?.trim() || undefined,
    p_wedding_date: input.weddingDate ?? undefined,
    p_cultures: input.cultures,
    p_total_budget_paise: input.totalBudgetPaise,
    p_slug: slugCandidate,
    p_events: input.events.map((event) => ({
      title: event.title,
      eventDate: event.eventDate ?? null,
      cultureLabel: event.cultureLabel ?? null,
    })),
  });

  if (error) throw error;
  const created = Array.isArray(data) ? data[0] : null;
  if (!created?.slug) {
    throw new Error("Wedding creation returned no slug.");
  }

  return created.slug;
}

export async function getWeddingSectionSummaryBySlug(weddingSlug: string) {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const wedding = weddings.find((row) => row.slug === weddingSlug);
  if (!wedding) return null;

  const supabase = await createSupabaseServerClient();
  const [{ data: tasks }, { data: vendors }, { data: messages }, { data: documents }, { data: budgetItems }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, status, due_date")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vendors")
        .select("id, name, category, status")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("id, body, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, title, file_url, created_at")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("budget_items")
        .select("id, category, allocated_paise, spent_paise")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: false }),
    ]);

  return {
    wedding,
    tasks: (tasks ?? []) as { id: string; title: string; status: "todo" | "in_progress" | "needs_review" | "done"; due_date: string | null }[],
    vendors: (vendors ?? []) as { id: string; name: string; category: string; status: "pending" | "confirmed" | "declined" }[],
    messages: (messages ?? []) as { id: string; body: string; created_at: string }[],
    documents: (documents ?? []) as { id: string; title: string; file_url: string | null; created_at: string }[],
    budgetItems: (budgetItems ?? []) as { id: string; category: string; allocated_paise: number; spent_paise: number }[],
  };
}

export const getWeddingBudgetWorkspaceViewBySlug = cache(
  async (weddingSlug: string): Promise<WeddingBudgetWorkspaceViewModel | null> => {
    const planner = await getPlannerContext();
    const weddings = await getAccessibleWeddings(planner.userId);
    const wedding = weddings.find((row) => row.slug === weddingSlug);
    if (!wedding) return null;

    const supabase = await createSupabaseServerClient();
    const { data: budgetRows, error } = await supabase
      .from("budget_items")
      .select("id, category, allocated_paise, spent_paise")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const recommendation = buildRecommendedBudgetSplit(wedding.cultures ?? []);
    const bucketMeta = new Map(BUDGET_BUCKETS.map((bucket) => [bucket.id, bucket]));
    const allocationByBucket = new Map<BudgetBucketId, { allocated: number; spent: number }>();

    for (const bucket of BUDGET_BUCKETS) {
      allocationByBucket.set(bucket.id, { allocated: 0, spent: 0 });
    }

    for (const item of budgetRows ?? []) {
      const bucketId = mapBudgetCategoryToBucket(item.category);
      const current = allocationByBucket.get(bucketId) ?? { allocated: 0, spent: 0 };
      current.allocated += item.allocated_paise;
      current.spent += item.spent_paise;
      allocationByBucket.set(bucketId, current);
    }

    const buckets = BUDGET_BUCKETS.map((bucket) => {
      const aggregate = allocationByBucket.get(bucket.id) ?? { allocated: 0, spent: 0 };
      const recommendedPercent = recommendation.split[bucket.id];
      return {
        id: bucket.id,
        label: bucket.label,
        recommendedPercent,
        recommendedPaise: Math.round((wedding.total_budget_paise * recommendedPercent) / 100),
        allocatedPaise: aggregate.allocated,
        spentPaise: aggregate.spent,
      };
    });

    const budgetItems = (budgetRows ?? []).map((item) => {
      const bucketId = mapBudgetCategoryToBucket(item.category);
      return {
        id: item.id,
        category: item.category,
        allocatedPaise: item.allocated_paise,
        spentPaise: item.spent_paise,
        bucketId,
        bucketLabel: bucketMeta.get(bucketId)?.label ?? "Other",
      };
    });

    const allocatedBudgetPaise = budgetItems.reduce((sum, item) => sum + item.allocatedPaise, 0);
    const spentBudgetPaise = budgetItems.reduce((sum, item) => sum + item.spentPaise, 0);

    return {
      weddingSlug,
      coupleName: wedding.couple_name,
      cultures: wedding.cultures ?? [],
      totalBudgetPaise: wedding.total_budget_paise,
      spentBudgetPaise,
      allocatedBudgetPaise,
      recommendationProfile: recommendation.profileLabel,
      recommendationNotes: recommendation.reasoning,
      buckets,
      budgetItems,
    };
  },
);

export const getBudgetPortfolioView = cache(async (): Promise<BudgetPortfolioViewModel> => {
  const planner = await getPlannerContext();
  const weddings = await getAccessibleWeddings(planner.userId);
  const weddingIds = weddings.map((wedding) => wedding.id);
  if (!weddingIds.length) {
    return {
      totalBudgetPaise: 0,
      totalAllocatedPaise: 0,
      totalSpentPaise: 0,
      weddingsAtRisk: 0,
      portfolioUtilizationPercent: 0,
      topBuckets: BUDGET_BUCKETS.slice(0, 4).map((bucket) => ({
        id: bucket.id,
        label: bucket.label,
        spentPaise: 0,
        allocatedPaise: 0,
      })),
      weddingRows: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: budgetRows } = await supabase
    .from("budget_items")
    .select("wedding_id, category, allocated_paise, spent_paise")
    .in("wedding_id", weddingIds);

  const totalsByWedding = new Map<string, { allocated: number; spent: number }>();
  const bucketTotals = new Map<BudgetBucketId, { spent: number; allocated: number }>();

  for (const bucket of BUDGET_BUCKETS) {
    bucketTotals.set(bucket.id, { spent: 0, allocated: 0 });
  }

  for (const row of budgetRows ?? []) {
    const weddingTotals = totalsByWedding.get(row.wedding_id) ?? { allocated: 0, spent: 0 };
    weddingTotals.allocated += row.allocated_paise;
    weddingTotals.spent += row.spent_paise;
    totalsByWedding.set(row.wedding_id, weddingTotals);

    const bucketId = mapBudgetCategoryToBucket(row.category);
    const bucket = bucketTotals.get(bucketId) ?? { spent: 0, allocated: 0 };
    bucket.spent += row.spent_paise;
    bucket.allocated += row.allocated_paise;
    bucketTotals.set(bucketId, bucket);
  }

  const weddingRows = weddings.map((wedding) => {
    const totals = totalsByWedding.get(wedding.id) ?? { allocated: 0, spent: 0 };
    const overrunByAllocated = totals.allocated > 0 ? totals.spent > totals.allocated : false;
    const overrunByTotalBudget = wedding.total_budget_paise > 0 ? totals.spent > wedding.total_budget_paise : false;
    const status: "healthy" | "watch" | "overrun" = overrunByTotalBudget
      ? "overrun"
      : overrunByAllocated
        ? "watch"
        : "healthy";

    return {
      id: wedding.id,
      weddingSlug: wedding.slug,
      coupleName: wedding.couple_name,
      totalBudgetPaise: wedding.total_budget_paise,
      allocatedPaise: totals.allocated,
      spentPaise: totals.spent,
      status,
      cultures: wedding.cultures ?? [],
    };
  });

  const totalBudgetPaise = weddingRows.reduce((sum, row) => sum + row.totalBudgetPaise, 0);
  const totalAllocatedPaise = weddingRows.reduce((sum, row) => sum + row.allocatedPaise, 0);
  const totalSpentPaise = weddingRows.reduce((sum, row) => sum + row.spentPaise, 0);
  const weddingsAtRisk = weddingRows.filter((row) => row.status !== "healthy").length;

  const topBuckets = BUDGET_BUCKETS.map((bucket) => {
    const totals = bucketTotals.get(bucket.id) ?? { spent: 0, allocated: 0 };
    return { id: bucket.id, label: bucket.label, spentPaise: totals.spent, allocatedPaise: totals.allocated };
  })
    .sort((a, b) => b.spentPaise - a.spentPaise)
    .slice(0, 4);

  return {
    totalBudgetPaise,
    totalAllocatedPaise,
    totalSpentPaise,
    weddingsAtRisk,
    portfolioUtilizationPercent: totalBudgetPaise > 0 ? Math.round((totalSpentPaise / totalBudgetPaise) * 100) : 0,
    topBuckets,
    weddingRows: weddingRows.sort((a, b) => b.spentPaise - a.spentPaise),
  };
});
