"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGoogleCalStatus } from "@/components/app-dashboard/calendar/use-calendar-query";
import type { GoogleCalStatus } from "@/components/app-dashboard/calendar/types";
import { cn } from "@/lib/utils";

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
  gcalVisible: boolean;
  onGcalVisibleChange: (visible: boolean) => void;
};

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function CalendarAccountIcon() {
  const now = new Date();
  const month = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = now.getDate();

  return (
    <div className="flex size-10 shrink-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <div className="bg-red-500 px-1 py-0.5 text-center text-[8px] font-bold leading-none text-white">
        {month}
      </div>
      <div className="flex flex-1 items-center justify-center text-sm font-semibold text-foreground">
        {day}
      </div>
    </div>
  );
}

function MenuTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function GoogleCalMenu({
  initialStatus,
  sync,
  disconnect,
  gcalVisible,
  onGcalVisibleChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const { data: status } = useGoogleCalStatus(initialStatus);

  const handleConnect = useCallback(() => {
    window.location.href = `/api/auth/google-calendar?returnTo=${encodeURIComponent(window.location.pathname)}`;
  }, []);

  const handleSync = useCallback(() => {
    sync.mutate();
  }, [sync]);

  const handleDisconnect = useCallback(() => {
    disconnect.mutate();
    onGcalVisibleChange(false);
  }, [disconnect, onGcalVisibleChange]);

  const connected = status?.connected ?? false;

  return (
    <TooltipProvider delay={300}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label="Google Calendar"
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card shadow-sm transition-colors hover:bg-accent/50 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            connected && "border-emerald-500/30",
          )}
        >
          <GoogleIcon className="size-4" />
          {connected && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-card bg-emerald-500" />
          )}
        </PopoverTrigger>

        <PopoverContent align="end" className="w-[400px] gap-0 p-0">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground">
              CALENDARS
            </p>
            {connected && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Connected
                <CheckCircle2 className="size-3.5 shrink-0" />
              </span>
            )}
          </div>

          {connected && status?.email ? (
            <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-sm">
              <CalendarAccountIcon />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {status.email}
                </p>
                {sync.data && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                    Synced{" "}
                    {new Date(sync.data.syncedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <MenuTooltip label={gcalVisible ? "Hide on calendar" : "Show on calendar"}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gcalVisible}
                    onClick={() => onGcalVisibleChange(!gcalVisible)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      gcalVisible ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block size-4 rounded-full bg-background shadow transition-transform",
                        gcalVisible ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </MenuTooltip>

                <MenuTooltip label="Sync now">
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={sync.isPending}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn("size-3.5", sync.isPending && "animate-spin")}
                    />
                  </button>
                </MenuTooltip>

                <MenuTooltip label="Disconnect account">
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={disconnect.isPending}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </MenuTooltip>
              </div>
            </div>
          ) : (
            <div className="mx-3 mb-4">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
                <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-[#4285F4]/40 bg-[#4285F4]/10">
                  <GoogleIcon className="size-4" aria-hidden />
                </span>
                <p className="max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                  Connect your Google Calendar to sync events.
                </p>
                <MenuTooltip label="Connect Google Calendar">
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent/50"
                  >
                    <GoogleIcon className="size-3.5" />
                    Connect
                  </button>
                </MenuTooltip>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
