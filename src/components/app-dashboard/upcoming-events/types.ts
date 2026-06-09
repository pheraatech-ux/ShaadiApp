export type UpcomingEventItem = {
  id: string;
  kind: "calendar" | "ceremony" | "wedding";
  title: string;
  /** YYYY-MM-DD for sorting / grouping */
  dateStr: string;
  /** Raw ISO timestamp; null for all-day/date-only events */
  startAt: string | null;
  allDay: boolean;
  color: string | null;
  weddingName: string | null;
  weddingSlug: string | null;
  cultureLabel: string | null;
};
