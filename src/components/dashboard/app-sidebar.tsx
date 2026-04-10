import Link from "next/link";
import { CalendarCheck2, ClipboardList, LayoutGrid, MessageSquare, Wallet } from "lucide-react";
import { ComponentType } from "react";

import { SidebarProfileMenu } from "@/components/dashboard/sidebar-profile-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
};

type AppSidebarProps = {
  workspaceName: string;
  userName: string;
  userEmail: string;
  currentPath?: string;
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/app", icon: LayoutGrid },
  { label: "All Weddings", href: "/app/weddings", icon: CalendarCheck2, badgeCount: 4 },
  { label: "Tasks", href: "/app/tasks", icon: ClipboardList, badgeCount: 7 },
  { label: "Budget", href: "/app/budget", icon: Wallet },
  { label: "Messages", href: "/app/messages", icon: MessageSquare, badgeCount: 3 },
];

type AppSidebarCompactProps = {
  currentPath?: string;
};

export function AppSidebar({
  workspaceName,
  userName,
  userEmail,
  currentPath = "/app",
}: AppSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col px-3 py-4">
      <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-3">
        <p className="text-base font-semibold">{workspaceName}</p>
        <p className="text-xs text-sidebar-foreground/70">Workspace</p>
      </div>

      <nav className="mt-5 flex-1 space-y-1.5">
        {sidebarItems.map((item) => {
          const active = currentPath === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate text-base font-semibold">{item.label}</span>
              {item.badgeCount ? (
                <Badge
                  variant={active ? "secondary" : "outline"}
                  className="ml-auto rounded-full border-sidebar-border bg-sidebar px-2 text-[10px] text-sidebar-foreground"
                >
                  {item.badgeCount}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <SidebarProfileMenu userName={userName} userEmail={userEmail} />
    </div>
  );
}

export function AppSidebarCompact({ currentPath = "/app" }: AppSidebarCompactProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {sidebarItems.map((item) => {
        const active = currentPath === item.href;
        const Icon = item.icon;

        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
          >
            <Link href={item.href}>
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
