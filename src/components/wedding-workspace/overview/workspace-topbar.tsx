"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Plus, Sparkles, UserPlus } from "lucide-react";

import { ThemeToggle } from "@/components/app-dashboard/dashboard/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getWorkspaceBasePath, getWorkspaceSection } from "@/lib/workspace-routes";
import { cn } from "@/lib/utils";

/**
 * Shared wedding workspace header: same on overview, team, vendors, and all workspace routes.
 * Primary control shows the current section (Overview, Team, …) from the URL.
 */
export function WorkspaceTopbar() {
  const pathname = usePathname() ?? "";
  const params = useParams();
  const weddingId = params.weddingId as string;
  const appRoot: "/app" | "/app/employee" = pathname.startsWith("/app/employee") ? "/app/employee" : "/app";
  const base = getWorkspaceBasePath(weddingId, appRoot);
  const section = getWorkspaceSection(pathname, weddingId, appRoot);

  const onTeam = pathname.startsWith(`${base}/team`);
  const onVendors = pathname.startsWith(`${base}/vendors`);
  const onAiReport = pathname.startsWith(`${base}/ai-report`);

  return (
    <div className="flex min-h-9 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={section.href}
        className={cn(
          buttonVariants({
            variant: "secondary",
            size: "sm",
            className: "h-9 w-fit rounded-xl",
          }),
        )}
      >
        {section.label}
      </Link>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link
          href={`${base}/vendors`}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
              className: cn("h-9 rounded-xl", onVendors && "border-foreground/30 bg-muted/50"),
            }),
          )}
        >
          <Plus />
          Add vendor
        </Link>
        <Link
          href={onTeam ? `${base}/team?invite=1` : `${base}/team`}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
              className: cn(
                "h-9 rounded-xl",
                onTeam && "border-foreground/40 bg-muted/60 ring-1 ring-foreground/20",
              ),
            }),
          )}
        >
          <UserPlus />
          Invite team
        </Link>
        <Link
          href={`${base}/ai-report`}
          className={cn(
            buttonVariants({
              size: "sm",
              className: cn(
                "h-9 rounded-xl bg-violet-600 text-white hover:bg-violet-500",
                onAiReport && "ring-2 ring-violet-300/50",
              ),
            }),
          )}
        >
          <Sparkles />
          AI report
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}
