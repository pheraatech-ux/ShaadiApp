"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, CalendarDays, ClipboardList, DollarSign, LayoutGrid, MessageSquare, Users } from "lucide-react";
import { ComponentType } from "react";

import { SidebarProfileMenu } from "@/components/app-dashboard/dashboard/sidebar-profile-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { AppSidebarCounts } from "@/lib/data/app-data";

type SidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
};

type AppSidebarProps = {
  userName: string;
  userEmail: string;
  counts: AppSidebarCounts;
  /** Planner `/app` or staff `/app/employee`. */
  basePath?: string;
  hideBudgetTab?: boolean;
  hideTeamTab?: boolean;
};

export function AppSidebar({
  userName,
  userEmail,
  counts,
  basePath = "/app",
  hideBudgetTab = false,
  hideTeamTab = false,
}: AppSidebarProps) {
  const pathname = usePathname() ?? `${basePath}/dashboard`;
  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: LayoutGrid },
    { label: "All Weddings", href: `${basePath}/weddings`, icon: BookHeart, badgeCount: counts.weddings },
    { label: "Calendar", href: `${basePath}/calendar`, icon: CalendarDays },
    ...(!hideTeamTab ? [{ label: "Teams", href: `${basePath}/team`, icon: Users, badgeCount: counts.team } as SidebarItem] : []),
    { label: "Tasks", href: `${basePath}/tasks`, icon: ClipboardList },
    { label: "Messages", href: `${basePath}/messages`, icon: MessageSquare },
  ];
  if (!hideBudgetTab) {
    sidebarItems.splice(5, 0, { label: "Financials", href: `${basePath}/budget`, icon: DollarSign });
  }

  function isPathActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader id="onborda-sidebar-header" className="min-h-[63px] shrink-0 justify-center gap-0 border-b border-sidebar-border/60 p-0 px-2 py-3 sm:px-3">
        <div className="flex h-[39px] w-full min-w-0 items-center justify-center rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-0 group-data-[collapsible=icon]:px-1">
          <p className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            ShaadiOS
          </p>
          <p className="hidden text-sm font-semibold group-data-[collapsible=icon]:block">S</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {sidebarItems.map((item) => {
                const active = isPathActive(item.href);
                const Icon = item.icon;
                const tourId = item.label === "Dashboard"
                  ? "onborda-nav-dashboard"
                  : item.label === "All Weddings"
                  ? "onborda-nav-weddings"
                  : item.label === "Tasks"
                  ? "onborda-nav-tasks"
                  : item.label === "Messages"
                  ? "onborda-nav-messages"
                  : item.label === "Financials"
                  ? "onborda-nav-financials"
                  : item.label === "Teams"
                  ? "onborda-nav-teams"
                  : item.label === "Calendar"
                  ? "onborda-nav-calendar"
                  : undefined;

                return (
                  <SidebarMenuItem key={item.href} id={tourId}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      size="default"
                      tooltip={item.label}
                      className="pl-2.5 h-9 before:-inset-y-2"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                    {item.badgeCount ? <SidebarMenuBadge>{item.badgeCount}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfileMenu userName={userName} userEmail={userEmail} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
