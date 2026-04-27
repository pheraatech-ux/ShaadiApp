"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ClipboardList, Home, MessageSquare, Store } from "lucide-react";
import type { ComponentType } from "react";

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

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badgeCount?: number;
};

type VendorSidebarProps = {
  userName: string;
  userEmail: string;
  vendorName: string;
  unreadMessages?: number;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/vendor/home", icon: Home },
  { label: "Tasks", href: "/vendor/tasks", icon: ClipboardList },
  { label: "Events", href: "/vendor/events", icon: Calendar },
  { label: "Messages", href: "/vendor/messages", icon: MessageSquare },
];

export function VendorSidebar({ userName, userEmail, vendorName, unreadMessages }: VendorSidebarProps) {
  const pathname = usePathname() ?? "/vendor/home";

  const items: NavItem[] = NAV_ITEMS.map((item) =>
    item.label === "Messages" && unreadMessages ? { ...item, badgeCount: unreadMessages } : item,
  );

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="min-h-[63px] shrink-0 justify-center gap-0 border-b border-sidebar-border/60 p-0 px-2 py-3 sm:px-3">
        <div className="flex h-[39px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-0 group-data-[collapsible=icon]:px-1">
          <Store className="size-4 shrink-0 text-sidebar-foreground/70 group-data-[collapsible=icon]:size-5" />
          <p className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            {vendorName}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Vendor Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      size="lg"
                      tooltip={item.label}
                    >
                      <Icon className="size-5 shrink-0" />
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
