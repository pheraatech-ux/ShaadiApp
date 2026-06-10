import { AlertCircle, CalendarClock, CheckCircle2, ClipboardList } from "lucide-react";

import { SummaryKpiCard } from "@/components/app-dashboard/dashboard/summary-kpi-card";

type TaskKpiCardsProps = {
  total: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  allWeddings?: boolean;
};

export function TaskKpiCards({ total, completed, overdue, dueThisWeek, allWeddings }: TaskKpiCardsProps) {
  const cards = [
    {
      id: "total",
      icon: ClipboardList,
      iconClassName: "text-indigo-400",
      iconBoxClassName: "border-indigo-500/20 bg-indigo-500/10",
      label: "Total tasks",
      value: total,
      sub: allWeddings ? "Across all weddings" : "Across this wedding",
    },
    {
      id: "completed",
      icon: CheckCircle2,
      iconClassName: "text-emerald-400",
      iconBoxClassName: "border-emerald-500/20 bg-emerald-500/10",
      label: "Completed",
      value: completed,
      sub: total > 0 ? `${Math.round((completed / total) * 100)}% done` : "No tasks yet",
    },
    {
      id: "overdue",
      icon: AlertCircle,
      iconClassName: "text-rose-400",
      iconBoxClassName: "border-rose-500/20 bg-rose-500/10",
      label: "Overdue",
      value: overdue,
      sub: "Needs immediate action",
    },
    {
      id: "due-week",
      icon: CalendarClock,
      iconClassName: "text-amber-400",
      iconBoxClassName: "border-amber-500/20 bg-amber-500/10",
      label: "Due this week",
      value: dueThisWeek,
      sub: "Upcoming commitments",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryKpiCard key={card.id} {...card} />
      ))}
    </section>
  );
}
