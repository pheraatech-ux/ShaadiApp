"use client";

type MemberSummary = {
  id: string;
  label: string;
  assignedCount: number;
  doneCount: number;
  overdueCount: number;
  progressPercent: number;
};

type TaskMemberStatsCardsProps = {
  members: MemberSummary[];
  currentUserId: string;
};

type CardState = "warning" | "healthy" | "done";

function getCardState(summary: MemberSummary): CardState {
  if (summary.overdueCount > 0 && summary.progressPercent < 30) return "warning";
  if (summary.progressPercent >= 60) return "done";
  return "healthy";
}

const ringColor: Record<CardState, string> = {
  warning: "#f87171",  // red-400
  healthy: "#34d399",  // emerald-400
  done: "#a78bfa",     // violet-400
};

const percentColor: Record<CardState, string> = {
  warning: "text-red-400",
  healthy: "text-emerald-400",
  done: "text-violet-400",
};

function ProgressRing({ percent, state }: { percent: number; state: CardState }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(percent, 100) / 100) * circ;
  const color = ringColor[state];

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0 -rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border/40" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
      />
    </svg>
  );
}

function MemberStatCard({ summary, isCurrentUser }: { summary: MemberSummary; isCurrentUser: boolean }) {
  const state = getCardState(summary);
  const active = summary.assignedCount - summary.doneCount;
  const left = active - summary.overdueCount;

  const subtitle =
    state === "warning" ? (
      <span className="text-red-400">
        {summary.overdueCount} overdue · needs nudge
      </span>
    ) : summary.overdueCount > 0 ? (
      <span>
        {summary.doneCount} done ·{" "}
        <span className="text-red-400 font-semibold">{summary.overdueCount} overdue</span>
      </span>
    ) : (
      <span>
        {summary.doneCount} done · {Math.max(0, left)} left
      </span>
    );

  return (
    <article className="flex min-w-[220px] max-w-[280px] flex-1 items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
      <div className="relative shrink-0">
        <ProgressRing percent={summary.progressPercent} state={state} />
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${percentColor[state]}`}>
          {summary.progressPercent}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {summary.label}
          {isCurrentUser && <span className="ml-1 text-muted-foreground font-normal">(you)</span>}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="text-2xl font-bold tabular-nums text-foreground">{summary.doneCount}</span>
        <span className="text-sm font-medium text-muted-foreground">/{summary.assignedCount}</span>
      </div>
    </article>
  );
}

export function TaskMemberStatsCards({ members, currentUserId }: TaskMemberStatsCardsProps) {
  const sorted = [...members].sort((a, b) => {
    const ai = a.id === currentUserId ? -1 : 0;
    const bi = b.id === currentUserId ? -1 : 0;
    return ai - bi;
  });

  if (sorted.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-0.5">
      {sorted.map((summary) => (
        <MemberStatCard key={summary.id} summary={summary} isCurrentUser={summary.id === currentUserId} />
      ))}
    </div>
  );
}
