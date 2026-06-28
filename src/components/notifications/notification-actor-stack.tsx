import { type FeedItem } from "@knocklabs/client";

import { NotificationActorAvatar } from "@/components/notifications/notification-actor-avatar";
import { NotificationTypeIcon } from "@/components/notifications/notification-type-icon";

type NotificationActorStackProps = {
  item: FeedItem;
  name?: string | null;
  src?: string | null;
};

export function NotificationActorStack({ item, name, src }: NotificationActorStackProps) {
  return (
    <div className="flex shrink-0 flex-col items-center self-start pt-0.5">
      <NotificationActorAvatar name={name} src={src} />
      <div className="mt-2.5">
        <NotificationTypeIcon item={item} />
      </div>
    </div>
  );
}
