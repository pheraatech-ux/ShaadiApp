type TaskKpiCardsProps = {
  total: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  flagged: number;
};

export function TaskKpiCards({ total, completed, overdue, dueThisWeek, flagged }: TaskKpiCardsProps) {
  const cards = [
    { id: "total", title: "Total tasks", value: total, helper: "Across this wedding" },
    { id: "completed", title: "Completed", value: completed, helper: total > 0 ? `${Math.round((completed / total) * 100)}% done` : "No tasks yet" },
    { id: "overdue", title: "Overdue", value: overdue, helper: "Needs immediate action" },
    { id: "due-week", title: "Due this week", value: dueThisWeek, helper: "Upcoming commitments" },
    { id: "flagged", title: "Flagged / blocked", value: flagged, helper: "Overdue or unassigned" },
  ];

  return (
    <section className="grid gap-3 lg:grid-cols-5">
      {cards.map((card) => (
        <article key={card.id} className="rounded-xl border border-border/70 bg-card px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{card.title}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
