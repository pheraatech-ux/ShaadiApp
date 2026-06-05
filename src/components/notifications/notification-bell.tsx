"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import {
  KnockFeedProvider,
  NotificationFeedPopover,
  useKnockFeed,
  useNotificationStore,
} from "@knocklabs/react";

import { Button } from "@/components/ui/button";

function NotificationButton({
  onClick,
  buttonRef,
}: {
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { feedClient } = useKnockFeed();
  const { metadata } = useNotificationStore(feedClient);
  const unread = metadata?.unread_count ?? 0;

  useEffect(() => {
    feedClient.listenForUpdates();
    return () => feedClient.teardown();
  }, [feedClient]);

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      size="icon"
      aria-label="Notifications"
      onClick={onClick}
      className="relative"
    >
      <Bell />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  );
}

function PopoverPortal({
  buttonRef,
  isOpen,
  onClose,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <NotificationFeedPopover
      buttonRef={buttonRef}
      isVisible={isOpen}
      onClose={onClose}
    />,
    document.body
  );
}

type NotificationBellProps = {
  feedChannelId: string;
};

export function NotificationBell({ feedChannelId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <KnockFeedProvider feedId={feedChannelId}>
      <NotificationButton
        buttonRef={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
      />
      <PopoverPortal
        buttonRef={buttonRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </KnockFeedProvider>
  );
}
