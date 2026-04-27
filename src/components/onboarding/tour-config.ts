import type { Step } from "onborda";

interface Tour {
  tour: string;
  steps: Step[];
}

export const MAIN_TOUR_NAME = "main";

export const appTours: Tour[] = [
  {
    tour: MAIN_TOUR_NAME,
    steps: [
      {
        icon: "👋",
        title: "Welcome to ShaadiOS",
        content: "Let's take a quick tour of your workspace. You can skip at any time.",
        selector: "#onborda-sidebar-header",
        side: "right",
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: "📊",
        title: "Dashboard",
        content:
          "Your command center — see active weddings, overdue tasks, and important alerts at a glance.",
        selector: "#onborda-nav-dashboard",
        side: "right",
        showControls: true,
        pointerPadding: 6,
        pointerRadius: 10,
      },
      {
        icon: "💍",
        title: "All Weddings",
        content:
          "Manage every wedding you're planning. Each wedding has its own budget, vendors, tasks, and team.",
        selector: "#onborda-nav-weddings",
        side: "right",
        showControls: true,
        pointerPadding: 6,
        pointerRadius: 10,
      },
      {
        icon: "✅",
        title: "Tasks",
        content:
          "Track tasks across all weddings in one place. Filter by due date, assignee, or status.",
        selector: "#onborda-nav-tasks",
        side: "right",
        showControls: true,
        pointerPadding: 6,
        pointerRadius: 10,
      },
      {
        icon: "💬",
        title: "Messages",
        content:
          "All your client and team conversations live here. Stay coordinated without leaving the app.",
        selector: "#onborda-nav-messages",
        side: "right",
        showControls: true,
        pointerPadding: 6,
        pointerRadius: 10,
      },
    ],
  },
];
