"use client";

import {
  BookHeart,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  MapPin,
  MessageSquare,
  PanelLeft,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback } from "react";

import { HeroAppChromeFrame } from "@/components/landing/hero-app-chrome-frame";
import {
  HeroAppPreviewSidebar,
  HeroAppPreviewUserFooter,
} from "@/components/landing/hero-app-preview-sidebar";
import { AlertsBanner } from "@/components/app-dashboard/dashboard/alerts-banner";
import { DonutChart } from "@/components/app-dashboard/dashboard/donut-chart";
import { SectionCard } from "@/components/app-dashboard/dashboard/section-card";
import { StatsGrid } from "@/components/app-dashboard/dashboard/stats-grid";
import { WeeklyCompletionWidget } from "@/components/app-dashboard/tasks/weekly-completion-widget";
import { UrgentTasksWidget } from "@/components/app-dashboard/tasks/urgent-tasks-widget";
import type {
  DashboardStat,
  UrgentTaskItem,
  WeddingItem,
  WeeklyCompletionDay,
} from "@/components/app-dashboard/dashboard/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HERO_STATS: DashboardStat[] = [
  { id: "1", title: "Active Weddings", value: "4", helperText: "6 total", progress: 72 },
  { id: "2", title: "Tasks Overdue", value: "7", helperText: "Across all weddings", progress: 32 },
  { id: "3", title: "Total Budget Managed", value: "₹68L", helperText: "4 weddings", progress: 61 },
  { id: "4", title: "Vendors Unconfirmed", value: "3", helperText: "Needs follow-up", progress: 20 },
];

const HERO_URGENT: UrgentTaskItem[] = [
  {
    id: "u1",
    title: "Book pandit and finalize ceremony time",
    owner: "x",
    coupleName: "Sharma × Kapoor",
    contextLabel: "Ceremony",
    dueDateLabel: "8 Apr",
    daysOverdue: 2,
    commentCount: 2,
  },
];

const HERO_WEEKLY: WeeklyCompletionDay[] = [
  { id: "m", label: "M", value: 40 },
  { id: "t1", label: "T", value: 55 },
  { id: "w", label: "W", value: 72 },
  { id: "t2", label: "T", value: 48 },
  { id: "f", label: "F", value: 64 },
];

const HERO_WEDDINGS: WeddingItem[] = [
  {
    id: "w1",
    name: "Sharma & Kapoor",
    city: "Taj Palace, Delhi",
    firstEventDate: "28 Apr 2025",
    daysLeft: 6,
    tasksDone: 28,
    tasksTotal: 38,
    status: "upcoming",
  },
  {
    id: "w2",
    name: "Gupta & Sharma",
    city: "ITC Grand, Mumbai",
    firstEventDate: "18 May 2025",
    daysLeft: 25,
    tasksDone: 14,
    tasksTotal: 36,
    status: "upcoming",
  },
];

const HERO_ALERTS = [
  {
    id: "a1",
    message: "2 vendor contracts are still pending signature for Sharma × Kapoor.",
    ctaLabel: "Review",
  },
];

const NAV = [
  { label: "Dashboard", icon: LayoutGrid, active: true, badge: undefined as number | undefined },
  { label: "All Weddings", icon: BookHeart, active: false, badge: 4 },
  { label: "Teams", icon: Users, active: false, badge: 2 },
  { label: "Tasks", icon: ClipboardList, active: false, badge: 7 },
  { label: "Budget", icon: Wallet, active: false, badge: undefined },
  { label: "Messages", icon: MessageSquare, active: false, badge: 1 },
] as const;

function getInitials(name: string) {
  return name
    .split(/&|×/)
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Non-interactive marketing snapshot: real dashboard widgets,
 * but layout is a flex “inset” (no shadcn Sidebar) so it stays inside the frame.
 */
export function HeroDashboardPreview() {
  const swallow = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="dark pointer-events-auto w-full min-w-0 select-none"
      onClickCapture={swallow}
    >
      <HeroAppChromeFrame>
        <div className="grid w-full min-h-0 grid-cols-[auto_1fr] items-stretch">
          <HeroAppPreviewSidebar
            className="relative z-[1] rounded-bl-2xl shadow-none"
            items={NAV}
            onItemClick={swallow}
            footer={<HeroAppPreviewUserFooter />}
          />
          <div className="relative z-0 flex min-h-0 min-w-0 flex-col overflow-hidden rounded-br-2xl bg-background text-foreground shadow-none">
            <header className="flex shrink-0 items-center gap-1.5 border-b border-border/70 bg-background/95 px-2 py-2 backdrop-blur sm:gap-2 sm:px-3 sm:py-2.5">
              <div
                className="text-muted-foreground/80 -ml-0.5 flex size-7 items-center justify-center sm:size-8"
                aria-hidden
              >
                <PanelLeft className="size-3.5 sm:size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <HeroTopbar onInteraction={swallow} />
              </div>
            </header>
            <main className="w-full overflow-hidden px-2.5 py-2.5 sm:px-4 sm:py-3">
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/90 sm:text-xs sm:tracking-[0.2em]">
                    Good morning
                  </p>
                  <p className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">Priya</p>
                </div>
                <div className="[&_article]:shadow-none [&_article]:transition-shadow [&_article]:hover:shadow-none">
                  <StatsGrid items={HERO_STATS} />
                </div>
                <AlertsBanner alerts={HERO_ALERTS} />
                <HeroWeddingsRow />
                <div className="grid gap-2.5 md:gap-3 lg:grid-cols-2">
                  <UrgentTasksWidget items={HERO_URGENT} disableNavigation />
                  <WeeklyCompletionWidget items={HERO_WEEKLY} />
                </div>
              </div>
            </main>
          </div>
        </div>
      </HeroAppChromeFrame>
    </div>
  );
}

function HeroTopbar({ onInteraction }: { onInteraction: (e: React.SyntheticEvent) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2 md:gap-3">
      <h2 className="shrink-0 text-sm font-semibold tracking-tight sm:text-base md:text-lg">Dashboard</h2>
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        <div className="relative hidden w-full min-w-0 max-w-[11rem] items-center md:max-w-sm sm:flex">
          <Search className="pointer-events-none absolute left-2.5 z-[1] size-3.5 text-muted-foreground sm:left-3 sm:size-4" />
          <Input
            readOnly
            tabIndex={-1}
            onMouseDown={onInteraction}
            className="h-7 cursor-default rounded-lg border-border/70 bg-muted/40 py-0 pl-8 pr-2 text-xs sm:h-8 sm:rounded-xl sm:pl-9"
            placeholder="Search weddings, tasks, vendors..."
            aria-label="Search (preview)"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 shrink-0 cursor-default gap-1 rounded-md px-2 text-[10px] sm:h-8 sm:gap-1.5 sm:rounded-xl sm:text-xs"
          onClick={onInteraction}
        >
          <Sparkles className="size-3 sm:size-3.5" />
          <span className="sm:hidden">AI</span>
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
        <div
          className="text-muted-foreground h-7 w-7 shrink-0 rounded border border-border/60 sm:h-8 sm:w-8 sm:rounded-md"
          aria-hidden
        />
      </div>
    </div>
  );
}

function HeroWeddingsRow() {
  return (
    <SectionCard
      title="My weddings"
      contentClassName="px-2 pt-0 pb-2 sm:px-3 sm:pb-2"
      headerClassName="py-2 sm:py-2.5"
      middle={
        <div className="flex w-fit gap-0.5 rounded-lg bg-muted/60 p-0.5">
          {(["all", "upcoming", "completed"] as const).map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors sm:px-2.5 sm:py-1 sm:text-[11px]",
                t === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-state={t === "all" ? "on" : "off"}
            >
              {t === "all" ? "All" : t === "upcoming" ? "Upcoming" : "Completed"}
            </span>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        {HERO_WEDDINGS.map((item) => (
          <div key={item.id} className="min-w-0">
            <HeroWeddingCard item={item} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function HeroWeddingCard({ item }: { item: WeddingItem }) {
  const percent = item.tasksTotal > 0 ? Math.round((item.tasksDone / item.tasksTotal) * 100) : 0;
  return (
    <div className="h-full" tabIndex={-1}>
      <article className="flex h-full flex-col rounded-xl border border-border/70 bg-card shadow-none transition-colors hover:border-border sm:rounded-2xl">
        <div className="flex items-start gap-2 p-3 sm:gap-2.5 sm:p-4 md:gap-3 md:p-5">
          <Avatar size="lg" className="!size-9 sm:!size-10 md:!size-11">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary sm:text-sm">
              {getInitials(item.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold sm:text-sm md:text-base">{item.name}</p>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground sm:gap-1.5 sm:text-[10px] sm:text-xs">
              <MapPin className="size-2.5 shrink-0 sm:size-3" />
              <span className="truncate">{item.city}</span>
            </div>
          </div>
          {item.daysLeft <= 7 ? (
            <Badge variant="destructive" className="rounded-full px-1.5 text-[7px] sm:px-2 sm:text-[9px] md:text-[10px]">
              {item.daysLeft}d left
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full px-1.5 text-[7px] sm:px-2 sm:text-[9px] md:text-[10px]">
              {item.daysLeft}d left
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border/70 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:gap-5 md:px-5 md:py-4">
          <DonutChart
            value={item.tasksDone}
            total={item.tasksTotal}
            size={48}
            strokeWidth={3.5}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            <p className="text-[11px] sm:text-xs md:text-sm">
              <span className="font-semibold text-foreground">{item.tasksDone}</span>/
              {item.tasksTotal} <span className="text-muted-foreground">done</span>
            </p>
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground sm:gap-1.5 sm:text-[10px] sm:text-xs">
              <CalendarDays className="size-2.5 shrink-0 sm:size-3" />
              {item.firstEventDate}
            </div>
          </div>
          {percent < 100 && (
            <span className="shrink-0 text-base font-semibold tabular-nums sm:text-lg md:text-2xl">
              {percent}%
            </span>
          )}
        </div>
      </article>
    </div>
  );
}
