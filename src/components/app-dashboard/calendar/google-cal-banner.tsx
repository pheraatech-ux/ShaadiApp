"use client";

import { useCallback } from "react";
import { RefreshCw, Unlink, ExternalLink } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useGoogleCalStatus } from "@/components/app-dashboard/calendar/use-calendar-query";
import type { GoogleCalStatus } from "@/components/app-dashboard/calendar/types";

type SyncResult = {
  pulled: number;
  pushed: number;
  removed: number;
  syncedAt: string;
};

type Props = {
  initialStatus: GoogleCalStatus;
  sync: UseMutationResult<SyncResult, Error, void, unknown>;
  disconnect: UseMutationResult<void, Error, void, unknown>;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function GoogleCalBanner({ initialStatus, sync, disconnect }: Props) {
  const { data: status } = useGoogleCalStatus(initialStatus);

  const handleConnect = useCallback(() => {
    window.location.href = `/api/auth/google-calendar?returnTo=${encodeURIComponent(window.location.pathname)}`;
  }, []);

  const handleSync = useCallback(() => {
    sync.mutate();
  }, [sync]);

  const handleDisconnect = useCallback(() => {
    disconnect.mutate();
  }, [disconnect]);

  if (!status?.connected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <GoogleIcon className="size-4 shrink-0" />
          <span>Connect Google Calendar to sync your events two-ways</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 rounded-lg px-3 text-xs font-semibold shrink-0"
          onClick={handleConnect}
        >
          <GoogleIcon className="size-3.5" />
          Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <GoogleIcon className="size-4 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
            Google Calendar connected
            {status.email && (
              <span className="ml-1 font-normal text-muted-foreground">· {status.email}</span>
            )}
          </p>
          {sync.data && (
            <p className="text-xs text-muted-foreground">
              Last sync: {new Date(sync.data.syncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" · "}
              {sync.data.pulled} pulled, {sync.data.pushed} pushed
              {sync.data.removed > 0 && `, ${sync.data.removed} removed`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={handleSync}
          disabled={sync.isPending}
        >
          <RefreshCw className={`size-3 ${sync.isPending ? "animate-spin" : ""}`} />
          {sync.isPending ? "Syncing…" : "Sync now"}
        </Button>

        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ExternalLink className="size-3" />
          Open
        </a>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-destructive"
          onClick={handleDisconnect}
          disabled={disconnect.isPending}
        >
          <Unlink className="size-3" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}
