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

import { topbarIconButtonClassName } from "@/components/app-dashboard/dashboard/topbar-control-styles";
import { NotificationFeedItem } from "@/components/notifications/notification-feed-item";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      size="icon-lg"
      aria-label="Notifications"
      onClick={onClick}
      className={cn(topbarIconButtonClassName, "relative rounded-xl")}
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

function NotificationFeedEmptyState() {
  return (
    <div className="flex h-full flex-col px-3 py-3">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
        <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-sky-400/40 bg-sky-500/10">
          <Bell className="size-4 text-sky-500" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">No notifications yet</p>
        <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          We&apos;ll let you know when we&apos;ve got something new for you.
        </p>
      </div>
    </div>
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
      EmptyComponent={<NotificationFeedEmptyState />}
      renderItem={(props) => <NotificationFeedItem {...props} />}
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
