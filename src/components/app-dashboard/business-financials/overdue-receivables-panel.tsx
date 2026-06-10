"use client";

import type { ReactNode } from "react";
import { Check, Trash2Icon } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { cn } from "@/lib/utils";

import { type OverdueReceivable } from "./types";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type Props = {
  items: OverdueReceivable[];
  onDelete: (id: string) => void;
  headerAction?: ReactNode;
};

export function OverdueReceivablesPanel({ items, onDelete, headerAction }: Props) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

      <div className="flex min-h-10 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-destructive/15">
            <span className="size-2 rounded-full bg-destructive" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Overdue Receivables</p>
          {items.length > 0 && (
            <span className="rounded-full bg-destructive/12 px-2 py-0.5 text-[10px] font-bold tabular-nums text-destructive">
              {items.length}
            </span>
          )}
        </div>
        {headerAction}
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-emerald-400/40 bg-emerald-500/10">
              <Check className="size-4 text-emerald-500" aria-hidden />
            </span>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">No overdue receivables right now.</p>
          </div>
        </div>
      ) : (
        <OverlayScrollbarsComponent
          element="div"
          className="min-h-0 flex-1"
          options={{
            overflow: { x: "hidden", y: "scroll" },
            scrollbars: { theme: "os-theme-dark", autoHide: "scroll", autoHideSuspend: true, clickScroll: true },
          }}
          defer
        >
          <div className="flex flex-col gap-1.5 px-3 py-3">
            {items.map((r) => {
              const daysDue = Math.floor((Date.now() - new Date(r.dueSince).getTime()) / 86400000);
              return (
                <div
                  key={r.id}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card px-4 py-3",
                    "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                  )}
                >
                  <div className="absolute left-0 top-1/2 h-[60%] w-0.5 -translate-y-1/2 rounded-r-full bg-destructive/70" />

                  <div className="min-w-0 flex-1 pl-1">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">{r.clientName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                      {daysDue}d overdue since {r.dueSince}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <p className="text-sm font-semibold tabular-nums text-destructive">{INR(r.amountRupees)}</p>
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${r.clientName}`}
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </OverlayScrollbarsComponent>
      )}
    </div>
  );
}
