"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { DonutChart } from "@/components/dashboard/donut-chart";
import { SectionCard } from "@/components/dashboard/section-card";
import { WeddingItem, WeddingStatus } from "@/components/dashboard/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WeddingListWidgetProps = {
  items: WeddingItem[];
};

type FilterTab = "all" | WeddingStatus;

const tabs: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
];

function getInitials(name: string) {
  return name
    .split("&")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function WeddingCard({ item }: { item: WeddingItem }) {
  const percent = item.tasksTotal > 0 ? Math.round((item.tasksDone / item.tasksTotal) * 100) : 0;

  return (
    <article className="flex flex-col rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3 p-5">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {getInitials(item.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{item.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{item.city}</span>
          </div>
        </div>
        {item.status === "completed" ? (
          <Badge variant="secondary" className="rounded-full text-[10px]">
            Done
          </Badge>
        ) : item.daysLeft <= 7 ? (
          <Badge variant="destructive" className="rounded-full text-[10px]">
            {item.daysLeft}d left
          </Badge>
        ) : (
          <Badge variant="outline" className="rounded-full text-[10px]">
            {item.daysLeft}d left
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-5 border-t border-border/70 px-5 py-4">
        <DonutChart value={item.tasksDone} total={item.tasksTotal} size={56} strokeWidth={5} />
        <div className="flex-1 space-y-1.5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{item.tasksDone}</span>/{item.tasksTotal} tasks done
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3 shrink-0" />
            {item.firstEventDate}
          </div>
        </div>
        {percent < 100 && (
          <span className="text-2xl font-semibold tracking-tight text-foreground">{percent}%</span>
        )}
      </div>
    </article>
  );
}

export function WeddingListWidget({ items }: WeddingListWidgetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all" ? items : items.filter((w) => w.status === activeTab);

  const filterBar = (
    <div className="flex w-fit gap-0.5 rounded-lg bg-muted/60 p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => setActiveTab(tab.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            activeTab === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard
      title="My weddings"
      middle={filterBar}
      action={
        <Button variant="ghost" size="sm" className="rounded-xl">
          View all
          <ArrowRight />
        </Button>
      }
      contentClassName="px-3 py-3 sm:px-4 sm:py-3"
    >
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground w-full">
            No weddings in this category.
          </p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="w-[320px] shrink-0">
              <WeddingCard item={item} />
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
