import { type FeedItem } from "@knocklabs/client";

export type NotificationKind =
  | "task-assigned"
  | "comment"
  | "mention"
  | "reminder"
  | "message"
  | "generic";

const SOURCE_KIND: Record<string, NotificationKind> = {
  "task-assigned": "task-assigned",
  "comment-added": "comment",
  mention: "mention",
  reminder: "reminder",
  "new-message": "message",
};

export function getNotificationKind(item: FeedItem): NotificationKind {
  const sourceKey = item.source?.key;
  if (sourceKey && SOURCE_KIND[sourceKey]) {
    return SOURCE_KIND[sourceKey];
  }

  const data = item.data as Record<string, unknown> | null | undefined;
  if (data) {
    if (typeof data.messageBody === "string") return "message";
    if (typeof data.reminderBody === "string") return "reminder";
    if (typeof data.commentBody === "string") return "comment";
    if (typeof data.taskId === "string") return "task-assigned";
  }

  return "generic";
}

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  "task-assigned": "Task assignment",
  comment: "Task comment",
  mention: "Mention",
  reminder: "Task reminder",
  message: "Message",
  generic: "Notification",
};
