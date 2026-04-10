import Link from "next/link";
import { CalendarCheck2, ClipboardList, LayoutGrid, MessageSquare, Wallet } from "lucide-react";
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

export function AppSidebar({
  workspaceName,
  userName,
  userEmail,
  currentPath = "/app",
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex min-h-14 items-center rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-3 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <p className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
            {workspaceName}
          </p>
          <p className="hidden text-sm font-semibold group-data-[collapsible=icon]:block">
            {workspaceName.slice(0, 1).toUpperCase()}
          </p>
          <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Workspace</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const active = currentPath === item.href;
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
