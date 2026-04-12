"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, ClipboardList, LayoutGrid, MessageSquare, Users, Wallet } from "lucide-react";
import { ComponentType } from "react";

import { SidebarProfileMenu } from "@/components/dashboard/sidebar-profile-menu";
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
};

export function AppSidebar({ userName, userEmail, counts }: AppSidebarProps) {
  const pathname = usePathname() ?? "/app/dashboard";
  const sidebarItems: SidebarItem[] = [
    { label: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
    { label: "All Weddings", href: "/app/weddings", icon: BookHeart, badgeCount: counts.weddings },
    { label: "Teams", href: "/app/team", icon: Users, badgeCount: counts.team },
    { label: "Tasks", href: "/app/tasks", icon: ClipboardList, badgeCount: counts.tasksOverdue },
    { label: "Budget", href: "/app/budget", icon: Wallet },
    { label: "Messages", href: "/app/messages", icon: MessageSquare, badgeCount: counts.messages },
  ];

  function isPathActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="min-h-[63px] shrink-0 justify-center gap-0 border-b border-sidebar-border/60 p-0 px-2 py-3 sm:px-3">
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
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const active = isPathActive(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      size="lg"
                      tooltip={item.label}
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
