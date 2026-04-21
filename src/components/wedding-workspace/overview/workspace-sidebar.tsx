"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookHeart,
  CheckSquare,
  File,
  FileText,
  Globe,
  LayoutGrid,
  Mail,
  Sparkles,
  Square,
  Users,
} from "lucide-react";

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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { WorkspaceSidebarBadgeCounts } from "@/lib/data/app-data";

type WorkspaceSidebarProps = {
  weddingId: string;
  userName: string;
  userEmail: string;
  badgeCounts: WorkspaceSidebarBadgeCounts;
  /** `/app` or `/app/employee` — drives dashboard / all-weddings links and wedding base path. */
  appRoot?: "/app" | "/app/employee";
  hideBudgetTab?: boolean;
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
  userName,
  userEmail,
  badgeCounts,
  appRoot = "/app",
  hideBudgetTab = false,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `${appRoot}/weddings/${weddingId}`;

  const items: NavItem[] = [
    { id: "overview", label: "Overview", hrefSuffix: "", icon: Square },
    {
      id: "team",
      label: "Team",
      hrefSuffix: "/team",
      icon: Users,
      badge: { text: `${badgeCounts.teamCount}/${badgeCounts.memberCap}`, tone: "emerald" },
    },
    {
      id: "vendors",
      label: "Vendors",
      hrefSuffix: "/vendors",
      icon: Globe,
      badge: { text: String(badgeCounts.vendorPendingCount), tone: "amber" },
    },
    {
      id: "tasks",
      label: "Tasks",
      hrefSuffix: "/tasks",
      icon: CheckSquare,
      badge: { text: String(badgeCounts.taskOverdueCount), tone: "red" },
    },
    {
      id: "messages",
      label: "Messages",
      hrefSuffix: "/messages",
      icon: Mail,
      badge: { text: String(badgeCounts.messageCount), tone: "red" },
    },
    ...(!hideBudgetTab ? [{ id: "budget", label: "Budget", hrefSuffix: "/budget", icon: FileText } as NavItem] : []),
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
          <SidebarGroupLabel>App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`${appRoot}/dashboard`} />}
                  isActive={
                    pathname === `${appRoot}/dashboard` || pathname.startsWith(`${appRoot}/dashboard/`)
                  }
                  size="lg"
                  tooltip="Dashboard"
                >
                  <LayoutGrid className="size-5 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`${appRoot}/weddings`} />}
                  isActive={pathname === `${appRoot}/weddings` || pathname.startsWith(`${appRoot}/weddings/`)}
                  size="lg"
                  tooltip="All weddings"
                >
                  <BookHeart className="size-5 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">All weddings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      <Icon className="size-5 shrink-0" />
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
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`${base}/ai-report`} />}
                  isActive={pathname.startsWith(`${base}/ai-report`)}
                  size="lg"
                  tooltip="AI report"
                >
                  <Sparkles className="size-5 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">AI report</span>
                  <span className="ml-auto rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 group-data-[collapsible=icon]:hidden dark:text-violet-200">
                    AI
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
