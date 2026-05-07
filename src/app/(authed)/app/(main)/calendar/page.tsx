import { Suspense } from "react";

import { CalendarWorkspace } from "@/components/app-dashboard/calendar/calendar-workspace";
import { getCalendarView } from "@/lib/data/calendar-data";

export const metadata = { title: "Calendar" };

async function CalendarContent() {
  const view = await getCalendarView();
  return <CalendarWorkspace view={view} />;
}

function CalendarSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[600px] rounded-xl bg-muted" />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarContent />
    </Suspense>
  );
}
