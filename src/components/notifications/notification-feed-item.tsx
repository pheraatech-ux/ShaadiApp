"use client";

import { type FeedItem } from "@knocklabs/client";
import { NotificationCell, type RenderItemProps } from "@knocklabs/react";
import { useLayoutEffect, useMemo, useRef } from "react";

import { NotificationActorStack } from "@/components/notifications/notification-actor-stack";
import {
  formatNotificationTimestamp,
  formatNotificationTimestampDetail,
} from "@/lib/notifications/format-notification-timestamp";
import {
  getNotificationHeadlineHtml,
  getNotificationQuoteText,
  stripMentionMarkup,
} from "@/lib/notifications/notification-content";

function patchNotificationItem(item: FeedItem, headlineHtml: string | undefined): FeedItem {
  if (!headlineHtml) return item;

  return {
    ...item,
    blocks: item.blocks.map((block) =>
      block.name === "body" ? { ...block, rendered: headlineHtml } : block,
    ),
  };
}

export function NotificationFeedItem({
  item,
  onItemClick,
  onButtonClick,
}: RenderItemProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const quoteRaw = getNotificationQuoteText(item.data);
  const quoteDisplay = quoteRaw ? stripMentionMarkup(quoteRaw) : null;

  const bodyBlock = item.blocks.find((block) => block.name === "body");
  const bodyHtml =
    bodyBlock && "rendered" in bodyBlock ? bodyBlock.rendered : undefined;
  const headlineHtml = getNotificationHeadlineHtml(bodyHtml, quoteRaw);
  const displayItem = useMemo(
    () => patchNotificationItem(item, headlineHtml),
    [item, headlineHtml],
  );

  const relativeTime = formatNotificationTimestamp(item.inserted_at);
  const exactTime = formatNotificationTimestampDetail(item.inserted_at);
  const actor = item.actors[0];
  const actorName = actor && "name" in actor ? actor.name : undefined;
  const actorAvatar = actor && "avatar" in actor ? actor.avatar : undefined;

  useLayoutEffect(() => {
    const timestampEl = rootRef.current?.querySelector(".rnf-notification-cell__timestamp");
    if (!timestampEl) return;

    timestampEl.textContent = relativeTime;
    timestampEl.setAttribute("title", exactTime);
  }, [relativeTime, exactTime]);

  return (
    <div ref={rootRef} className="shaadi-notification-item">
      <NotificationCell
        item={displayItem}
        onItemClick={onItemClick}
        onButtonClick={onButtonClick}
        avatar={
          <NotificationActorStack
            item={item}
            name={actorName}
            src={actorAvatar ?? null}
          />
        }
      >
        {quoteDisplay ? (
          <div className="mt-2 rounded-lg bg-muted/35 px-3 py-2 text-sm leading-relaxed text-foreground/90">
            {quoteDisplay}
          </div>
        ) : null}
      </NotificationCell>
    </div>
  );
}
