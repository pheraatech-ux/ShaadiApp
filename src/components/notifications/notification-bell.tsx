"use client";

import { useRef, useState } from "react";
import { KnockFeedProvider, NotificationIconButton, NotificationFeedPopover } from "@knocklabs/react";

type NotificationBellProps = {
  feedChannelId: string;
};

export function NotificationBell({ feedChannelId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <KnockFeedProvider feedId={feedChannelId}>
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
