import { Badge } from "@/components/ui/badge";
import type { WeddingTasksBoardStatus } from "@/components/wedding-workspace/tasks/types";

const STATUS_MAP: Record<WeddingTasksBoardStatus, { label: string; className: string }> = {
  todo: { label: "To do", className: "border-rose-500/40 bg-rose-500/10 text-rose-300" },
  in_progress: { label: "In progress", className: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  done: { label: "Done", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
};

type TaskStatusBadgeProps = {
  status: WeddingTasksBoardStatus;
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const mapped = STATUS_MAP[status];
  return (
    <Badge variant="outline" className={mapped.className}>
      {mapped.label}
    </Badge>
  );
}
