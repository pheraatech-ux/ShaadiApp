type TaskKpiCardsProps = {
  total: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  flagged: number;
};

export function TaskKpiCards({ total, completed, overdue, dueThisWeek, flagged }: TaskKpiCardsProps) {
  const cards = [
    { id: "total", title: "Total tasks", value: total, helper: "Across this wedding", color: "text-foreground" },
    { id: "completed", title: "Completed", value: completed, helper: total > 0 ? `${Math.round((completed / total) * 100)}% done` : "No tasks yet", color: "text-emerald-400" },
    { id: "overdue", title: "Overdue", value: overdue, helper: "Needs immediate action", color: "text-rose-400" },
    { id: "due-week", title: "Due this week", value: dueThisWeek, helper: "Upcoming commitments", color: "text-foreground" },
    { id: "flagged", title: "Flagged / blocked", value: flagged, helper: "Overdue or unassigned", color: "text-foreground" },
  ];

  return (
    <section className="-mx-4 grid grid-cols-2 border-b border-border/60 sm:-mx-6 lg:grid-cols-5">
      {cards.map((card, i) => (
        <article
          key={card.id}
          className={[
            "flex flex-col items-center justify-center px-4 py-4 text-center",
            i < cards.length - 1 ? "border-r border-border/60" : "",
            i >= 2 ? "border-t border-border/60 lg:border-t-0" : "",
          ].join(" ")}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{card.title}</p>
          <p className={`text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{card.helper}</p>
        </article>
      ))}
    </section>
  );
}
