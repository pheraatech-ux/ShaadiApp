import { ReactNode } from "react";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type HeroAppChromeFrameProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

/**
 * Faux browser window: traffic lights + URL so the in-app layout reads as a
 * contained “screen in the page”, not the real app shell.
 */
export function HeroAppChromeFrame({
  children,
  className,
  title = "app.shaadi.in/dashboard",
}: HeroAppChromeFrameProps) {
  return (
    <div
      className={cn(
        "flex h-auto w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] ring-1 ring-white/5 [box-shadow:0_14px_36px_-6px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div
        className="flex flex-shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0a0a0c] px-3 py-2.5"
        aria-hidden
      >
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="mx-auto flex h-7 min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.04] px-2 text-[10px] text-zinc-500"
          title={title}
        >
          <Lock className="size-2.5 shrink-0 text-emerald-500/90" />
          <span className="truncate text-zinc-500">{title}</span>
        </div>
        <div className="w-[52px] shrink-0" />
      </div>
      <div className="flex w-full min-w-0 flex-col">
        {children}
      </div>
    </div>
  );
}
