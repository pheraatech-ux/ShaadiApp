"use client";

import { BarChart2, CalendarClock, IndianRupee, ListChecks, Plus, MessageSquare, Sparkles, UserPlus, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AddWeddingFlowDialog } from "@/components/app-dashboard/dashboard/add-wedding-flow-dialog";
import { AiInsight } from "@/components/app-dashboard/dashboard/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const variantStyles: Record<
  AiInsight["variant"],
  { Icon: React.ElementType; iconClass: string; bgClass: string; borderClass: string }
> = {
  risk:   { Icon: BarChart2,   iconClass: "text-rose-500",    bgClass: "bg-rose-500/12 dark:bg-rose-500/18",   borderClass: "border-rose-500/20" },
  budget: { Icon: IndianRupee, iconClass: "text-emerald-500", bgClass: "bg-emerald-500/12 dark:bg-emerald-500/18", borderClass: "border-emerald-500/20" },
  vendor: { Icon: ShieldAlert,  iconClass: "text-blue-500",    bgClass: "bg-blue-500/12 dark:bg-blue-500/18",   borderClass: "border-blue-500/20" },
  task:   { Icon: ListChecks,  iconClass: "text-amber-500",   bgClass: "bg-amber-500/12 dark:bg-amber-500/18",  borderClass: "border-amber-500/20" },
};

const EXTRA_INSIGHTS = [
  {
    id: "upcoming-events",
    Icon: CalendarClock,
    iconClass: "text-violet-500",
    bgClass: "bg-violet-500/12 dark:bg-violet-500/18",
    borderClass: "border-violet-500/20",
    title: "2 events in the next 7 days",
    description: "Ensure all vendors and tasks are confirmed",
    ctaLabel: "View calendar",
    ctaHref: "/app/tasks",
  },
];

type AiInsightsWidgetProps = {
  insights: AiInsight[];
  tasksHref?: string;
  messagesHref?: string;
  vendorsHref?: string;
};

export function AiInsightsWidget({
  insights,
  tasksHref = "/app/tasks",
  messagesHref = "/app/messages",
  vendorsHref = "/app/vendors",
}: AiInsightsWidgetProps) {
  const [addWeddingOpen, setAddWeddingOpen] = useState(false);

  const quickActions = [
    { icon: Plus,          label: "Add Wedding",   type: "dialog" as const,  href: undefined },
    { icon: ListChecks,    label: "Add Task",      type: "link" as const,    href: tasksHref },
    { icon: MessageSquare, label: "Message Team",  type: "link" as const,    href: messagesHref },
    { icon: UserPlus,      label: "Add Vendor",    type: "link" as const,    href: vendorsHref },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* AI Insights Panel */}
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
        )}
      >
        {/* Top-edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-md bg-primary/10">
              <Sparkles className="size-3 text-primary" aria-hidden />
            </div>
            <p className="text-sm font-semibold tracking-tight text-foreground">AI Insights</p>
            <span className="hidden text-[10.5px] text-muted-foreground/50 italic sm:inline">
              — <span className="text-foreground/60 not-italic font-medium">Hitched AI™</span>
            </span>
          </div>
          <Link
            href="/app/tasks"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full text-xs text-muted-foreground hover:text-foreground")}
          >
            View all
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {insights.map((insight) => {
            const { Icon, iconClass, bgClass, borderClass } = variantStyles[insight.variant];
            return (
              <div
                key={insight.id}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-xl border bg-card px-4 py-2.5",
                  "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                  borderClass,
                )}
              >
                <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/8", bgClass)}>
                  <Icon className={cn("size-4", iconClass)} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">{insight.description}</p>
                </div>
                {insight.ctaHref ? (
                  <Link
                    href={insight.ctaHref}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 rounded-xl text-[11px] h-7 px-2.5")}
                  >
                    {insight.ctaLabel}
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="shrink-0 rounded-xl text-[11px] h-7 px-2.5">
                    {insight.ctaLabel}
                  </Button>
                )}
              </div>
            );
          })}

          {EXTRA_INSIGHTS.map((insight) => (
            <div
              key={insight.id}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl border bg-card px-4 py-2.5",
                "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                insight.borderClass,
              )}
            >
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/8", insight.bgClass)}>
                <insight.Icon className={cn("size-4", insight.iconClass)} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-foreground">{insight.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">{insight.description}</p>
              </div>
              <Link
                href={insight.ctaHref}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 rounded-xl text-[11px] h-7 px-2.5")}
              >
                {insight.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-card",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04),_0_4px_16px_rgba(0,0,0,0.06)]",
        )}
      >
        {/* Top-edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />

        <div className="flex items-center gap-2 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent px-4 py-2 sm:px-5">
          <div className="flex size-5 items-center justify-center rounded-md bg-amber-500/15">
            <Zap className="size-3 text-amber-500" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Quick Actions</p>
        </div>

        <div className="px-3 py-3">
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const baseClass = cn(
                "group relative flex h-auto flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 py-3 text-[11px] font-semibold text-foreground/70",
                "transition-all duration-150 hover:border-border hover:bg-muted/60 hover:text-foreground hover:shadow-[0_1px_4px_rgba(0,0,0,0.07)]",
              );

              if (action.type === "dialog") {
                return (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className={baseClass}
                    onClick={() => setAddWeddingOpen(true)}
                  >
                    <Icon className="size-3.5 transition-transform duration-150 group-hover:scale-110" aria-hidden />
                    {action.label}
                  </Button>
                );
              }
              return (
                <Link
                  key={action.label}
                  href={action.href!}
                  className={cn(buttonVariants({ variant: "ghost" }), baseClass)}
                >
                  <Icon className="size-3.5 transition-transform duration-150 group-hover:scale-110" aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <AddWeddingFlowDialog open={addWeddingOpen} onOpenChange={setAddWeddingOpen} />
    </div>
  );
}
