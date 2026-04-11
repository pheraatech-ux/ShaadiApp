"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  ChevronLeft,
  File,
  FileText,
  Globe,
  Mail,
  Square,
  Users,
} from "lucide-react";

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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type WorkspaceSidebarProps = {
  weddingId: string;
  workspaceName: string;
  userName: string;
  userEmail: string;
};

type NavItem = {
  id: string;
  label: string;
  hrefSuffix: string;
  icon: typeof Square;
  badge?: { text: string; tone: "emerald" | "amber" | "red" | "muted" };
};

const badgeTone: Record<NonNullable<NavItem["badge"]>["tone"], string> = {
  emerald:
    "bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-100",
  amber: "bg-amber-500/20 text-amber-900 dark:bg-amber-500/25 dark:text-amber-100",
  red: "bg-red-500/20 text-red-800 dark:bg-red-500/25 dark:text-red-100",
  muted: "bg-muted text-muted-foreground",
};

export function WorkspaceSidebar({
  weddingId,
  workspaceName,
  userName,
  userEmail,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `/app/weddings/${weddingId}`;

  const items: NavItem[] = [
    { id: "overview", label: "Overview", hrefSuffix: "", icon: Square },
    { id: "team", label: "Team", hrefSuffix: "/team", icon: Users, badge: { text: "1/3", tone: "emerald" } },
    {
      id: "vendors",
      label: "Vendors",
      hrefSuffix: "/vendors",
      icon: Globe,
      badge: { text: "0", tone: "amber" },
    },
    {
      id: "tasks",
      label: "Tasks",
      hrefSuffix: "/tasks",
      icon: CheckSquare,
      badge: { text: "5", tone: "red" },
    },
    {
      id: "messages",
      label: "Messages",
      hrefSuffix: "/messages",
      icon: Mail,
      badge: { text: "0", tone: "red" },
    },
    { id: "budget", label: "Budget", hrefSuffix: "/budget", icon: FileText },
    { id: "documents", label: "Documents", hrefSuffix: "/documents", icon: File },
  ];

  function isActive(hrefSuffix: string) {
    const href = hrefSuffix === "" ? base : `${base}${hrefSuffix}`;
    if (hrefSuffix === "") {
      return pathname === base;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/60 pb-3">
        <div className="flex min-h-14 items-center rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-3 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <p className="truncate text-base font-semibold group-data-[collapsible=icon]:hidden">
            {workspaceName}
          </p>
          <p className="hidden text-sm font-semibold group-data-[collapsible=icon]:block">
            {workspaceName.slice(0, 1).toUpperCase()}
          </p>
          <p className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">Workspace</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/app/weddings" />}
              size="sm"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              tooltip="All weddings"
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">All weddings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>This wedding</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const href = item.hrefSuffix === "" ? base : `${base}${item.hrefSuffix}`;
                const active = isActive(item.hrefSuffix);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={active}
                      size="lg"
                      tooltip={item.label}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums group-data-[collapsible=icon]:hidden",
                            badgeTone[item.badge.tone],
                          )}
                        >
                          {item.badge.text}
                        </span>
                      ) : null}
                    </SidebarMenuButton>
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
