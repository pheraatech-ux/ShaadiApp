import { getUpcomingEventsPanelData } from "@/lib/data/app-data";
import { UpcomingEventsPanel } from "./upcoming-events-panel";

export async function UpcomingEventsPanelLive({ basePath = "/app" }: { basePath?: string }) {
  const items = await getUpcomingEventsPanelData();
  const todayStr = new Date().toISOString().slice(0, 10);

  return <UpcomingEventsPanel items={items} todayStr={todayStr} basePath={basePath} />;
}
