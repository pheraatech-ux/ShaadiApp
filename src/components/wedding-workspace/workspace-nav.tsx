"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { WeddingWorkspaceViewModel } from "@/components/wedding-workspace/types";
import { cn } from "@/lib/utils";

type WorkspaceNavProps = {
  workspace: WeddingWorkspaceViewModel;
};

const hrefSuffixByNavId: Record<string, string | null> = {
  overview: "",
  team: "/team",
  vendors: "/vendors",
  tasks: "/tasks",
  messages: "/messages",
  budget: "/budget",
  documents: "/documents",
  "ai-report": null,
  ai: null,
};

export function WorkspaceNav({ workspace }: WorkspaceNavProps) {
  const pathname = usePathname();
  const base = `/app/weddings/${workspace.id}`;

  function isActive(suffix: string | null) {
    if (suffix === null) return false;
    const href = suffix === "" ? base : `${base}${suffix}`;
    if (suffix === "") return pathname === base;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-2 rounded-xl border border-border/70 bg-card px-2 py-1.5">
        {workspace.navItems.map((item) => {
          const suffix = hrefSuffixByNavId[item.id];
          const active = isActive(suffix);

          const className = cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            suffix === null && "pointer-events-none opacity-60",
          );

          const inner = (
            <>
              {item.label}
              {item.badge !== undefined ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 rounded-sm border px-1 text-[10px]",
                    active
                      ? "border-border/80 bg-background text-foreground/80"
                      : "border-border/70 bg-muted/60 text-muted-foreground",
                  )}
                >
                  {item.badge}
                </Badge>
              ) : null}
            </>
          );

          if (suffix === null) {
            return (
              <span key={item.id} className={className}>
                {inner}
              </span>
            );
          }

          const href = suffix === "" ? base : `${base}${suffix}`;

          return (
            <Link key={item.id} href={href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
