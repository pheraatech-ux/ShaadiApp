"use client";

import { useEffect, useRef, useState } from "react";
import {
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
  useKnockFeed,
} from "@knocklabs/react";

function FeedListener() {
  const { feedClient } = useKnockFeed();
  useEffect(() => {
    feedClient.listenForUpdates();
    return () => feedClient.teardown();
  }, [feedClient]);
  return null;
}

type NotificationBellProps = {
  feedChannelId: string;
};

export function NotificationBell({ feedChannelId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <KnockFeedProvider feedId={feedChannelId}>
      <FeedListener />
      <NotificationIconButton
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
      />
      <NotificationFeedPopover
        buttonRef={buttonRef}
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </KnockFeedProvider>
  );
}
