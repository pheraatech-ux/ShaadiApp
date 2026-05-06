import { DashboardTopbar } from "@/components/app-dashboard/dashboard/dashboard-topbar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getWorkspaceShellInfo } from "@/lib/data/app-data";
import { buildTimeOfDayGreeting } from "@/lib/planner-display";

export async function DashboardTopbarLive() {
  const planner = await getWorkspaceShellInfo();
  const greeting = buildTimeOfDayGreeting(planner.userName);
  const feedChannelId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID ?? "";

  return (
    <DashboardTopbar
      greeting={greeting}
      actions={feedChannelId ? <NotificationBell feedChannelId={feedChannelId} /> : null}
    />
  );
}
