import { CalendarWorkspace } from "@/components/app-dashboard/calendar/calendar-workspace";
import { getCalendarView } from "@/lib/data/calendar-data";

export const metadata = { title: "Calendar" };

export default async function WeddingWorkspaceCalendarPage() {
  const view = await getCalendarView();
  return <CalendarWorkspace view={view} showAiInput={false} />;
}
