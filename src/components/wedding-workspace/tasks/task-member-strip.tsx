type TaskMemberSummary = {
  id: string;
  label: string;
  assignedCount: number;
  doneCount: number;
  overdueCount: number;
  progressPercent: number;
};

type TaskMemberStripProps = {
  members: TaskMemberSummary[];
};

export function TaskMemberStrip({ members }: TaskMemberStripProps) {
  if (members.length === 0) return null;

  return (
    <section className="grid gap-3 xl:grid-cols-4">
      {members.map((member) => (
        <article key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{member.label}</p>
            <p className="text-xs text-muted-foreground">
              {member.assignedCount} assigned • {member.overdueCount} overdue
            </p>
          </div>
          <div className="relative size-10 shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${member.progressPercent * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
            />
            <div className="absolute inset-[3px] grid place-items-center rounded-full bg-card text-[10px] font-semibold text-foreground">
              {member.progressPercent}%
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
