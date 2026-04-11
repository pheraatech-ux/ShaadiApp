import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";

const workspaceByWeddingId: Record<string, WeddingWorkspaceViewModel> = {
  "priya-rahul": {
    id: "priya-rahul",
    coupleName: "Priya & Rahul",
    plannerName: "Grand Palace, Mumbai",
    avatarLabel: "PR",
    locationLabel: "Mumbai",
    dateLabel: "15 Dec 2026",
    daysLeftLabel: "52 days",
    cultureTags: ["Punjabi", "Tamil"],
    eventCountLabel: "11 events",
    navItems: [
      { id: "overview", label: "Overview" },
      { id: "team", label: "Team", badge: "1/3" },
      { id: "vendors", label: "Vendors", badge: 0 },
      { id: "tasks", label: "Tasks", badge: 5 },
      { id: "budget", label: "Budget" },
      { id: "messages", label: "Messages" },
      { id: "documents", label: "Documents" },
      { id: "ai-report", label: "AI report" },
      { id: "ai", label: "AI" },
    ],
    setupTitle: "Workspace created - 3 things to do first",
    setupDescription:
      "Shaadios loaded 11 events and 47 tasks. Complete these steps to activate this workspace.",
    setupChips: [
      "Events & budget set",
      "Self-assigned as lead",
      "Add first vendor",
      "Invite team member",
      "Send proposal to family",
    ],
    leadBannerTitle: "You're assigned as lead planner",
    leadBannerDescription:
      "You'll receive overdue alerts and be the primary contact for Priya & Rahul's wedding.",
    kpis: [
      { id: "tasks", label: "Tasks", value: "47", helperText: "0 done, 5 due soon" },
      { id: "events", label: "Events", value: "11", helperText: "Next Roka in 18 days" },
      { id: "vendors", label: "Vendors", value: "0", helperText: "Add vendors for events" },
      { id: "budget", label: "Budget", value: "₹25L", helperText: "₹0 spent • ₹25L left" },
    ],
    aiBriefTitle: "Cross-cultural setup note — action needed this week",
    aiBriefDescription:
      "Punjabi + Tamil wedding needs 2 priests (Granthi + Vadhyar) and specialist Oonjal decorator. Book these 8 weeks out — that's now. Tap to view full AI brief.",
    timelineTitle: "Event timeline — 11 ceremonies",
    timelineCultureFilters: [
      { id: "punjabi", label: "Punjabi", tone: "punjabi" },
      { id: "tamil", label: "Tamil", tone: "tamil" },
      { id: "shared", label: "Shared", tone: "shared" },
    ],
    timelineEvents: [
      {
        id: "roka",
        title: "Roka",
        dateLabel: "27 Oct 2025",
        tags: ["Punjabi"],
        daysLeftLabel: "18 days",
        taskProgressLabel: "0/4 tasks",
        icon: "🪔",
        subtags: ["Book venue", "Gifts", "Pandit"],
      },
      {
        id: "haldi",
        title: "Haldi",
        dateLabel: "10 Dec 2025",
        tags: ["Shared"],
        daysLeftLabel: "42 days",
        taskProgressLabel: "1/3 tasks",
        icon: "☀️",
        subtags: ["Decor", "Artist"],
      },
      {
        id: "wedding",
        title: "Wedding + Reception",
        dateLabel: "15 Dec 2025",
        tags: ["Punjabi", "Tamil"],
        daysLeftLabel: "52 days",
        taskProgressLabel: "2/8 tasks",
        icon: "💐",
        subtags: ["Venue", "Catering", "Photography"],
      },
    ],
    timelineMoreEventsLabel: "+ 4 more events",
    vendorsNeeded: [
      {
        id: "granth",
        name: "Granthi",
        role: "Sikh priest",
        note: "Anand Karaj",
        displayTitle: "Granthi (Sikh priest)",
        contextLine: "Anand Karaj — book 8 wks out",
        statusLabel: "Not added",
        urgency: "high",
      },
      {
        id: "vadhyar",
        name: "Vadhyar",
        role: "Tamil priest",
        note: "Saptapadi",
        displayTitle: "Vadhyar (Tamil priest)",
        contextLine: "Saptapadi — book 8 wks out",
        statusLabel: "Not added",
        urgency: "high",
      },
      {
        id: "oonjal",
        name: "Traditional oonjal decorator",
        role: "Decor specialist",
        note: "Ceremony setup",
        contextLine: "Ceremony setup — confirm 6 wks out",
        statusLabel: "Need quote",
        urgency: "medium",
      },
    ],
    teamMembers: [
      {
        id: "lead",
        avatarLabel: "VR",
        name: "Vik Ram (you)",
        subtitle: "Lead planner • owner",
        badge: "Admin",
      },
    ],
    teamInvites: [
      { id: "coord", label: "Invite coordinator or assistant" },
      { id: "member", label: "Invite team member" },
    ],
    teamFooterNote: "Free plan: 3 members max including you. Upgrade for larger teams.",
  },
};

function fallbackWorkspace(weddingId: string): WeddingWorkspaceViewModel {
  const titleCaseId = weddingId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" & ");

  return {
    ...workspaceByWeddingId["priya-rahul"],
    id: weddingId,
    coupleName: titleCaseId || "Wedding Workspace",
    avatarLabel: (titleCaseId || "WW")
      .split("&")
      .map((part) => part.trim().charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export function getWeddingWorkspaceMock(weddingId: string): WeddingWorkspaceViewModel {
  return workspaceByWeddingId[weddingId] ?? fallbackWorkspace(weddingId);
}
