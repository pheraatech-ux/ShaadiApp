import { type FeedItem } from "@knocklabs/client";
import { AtSign, Bell, ListTodo, MessageSquare, MessageSquareText, type LucideIcon } from "lucide-react";

import {
  getNotificationKind,
  NOTIFICATION_KIND_LABELS,
  type NotificationKind,
} from "@/lib/notifications/notification-kind";
import { cn } from "@/lib/utils";

const NOTIFICATION_KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  "task-assigned": ListTodo,
  comment: MessageSquare,
  mention: AtSign,
  reminder: Bell,
  message: MessageSquareText,
  generic: Bell,
};

const NOTIFICATION_KIND_COLORS: Record<NotificationKind, string> = {
  "task-assigned": "text-emerald-600 dark:text-emerald-400",
  comment: "text-sky-600 dark:text-sky-400",
  mention: "text-violet-600 dark:text-violet-400",
  reminder: "text-amber-600 dark:text-amber-400",
  message: "text-rose-600 dark:text-rose-400",
  generic: "text-muted-foreground",
};

type NotificationTypeIconProps = {
  item: FeedItem;
  className?: string;
};

export function NotificationTypeIcon({ item, className }: NotificationTypeIconProps) {
  const kind = getNotificationKind(item);
  const Icon = NOTIFICATION_KIND_ICONS[kind];
  const label = NOTIFICATION_KIND_LABELS[kind];

  return (
    <Icon
      className={cn("size-4 shrink-0 stroke-[2.25]", NOTIFICATION_KIND_COLORS[kind], className)}
      aria-label={label}
      role="img"
    />
  );
}
