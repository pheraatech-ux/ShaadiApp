import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isYesterday,
  parseISO,
} from "date-fns";

/** Relative labels for notifications under 7 days old; exact date otherwise. */
export function formatNotificationTimestamp(iso: string, now = new Date()): string {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const calendarDays = differenceInCalendarDays(now, date);
  if (calendarDays >= 7) {
    return format(date, "MMM d, yyyy");
  }

  if (isYesterday(date)) return "Yesterday";

  if (calendarDays >= 2) {
    return `${calendarDays} days ago`;
  }

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  return "Yesterday";
}

/** Exact date/time for tooltips and detail views. */
export function formatNotificationTimestampDetail(iso: string): string {
  const date = parseISO(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return format(date, "MMM d, yyyy 'at' h:mm a");
}
