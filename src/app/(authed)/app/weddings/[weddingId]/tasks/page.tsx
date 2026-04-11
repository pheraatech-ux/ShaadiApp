import { notFound } from "next/navigation";

import { WorkspaceQuickAddForm } from "@/components/wedding-workspace/workspace-quick-add-form";
import { WorkspaceSectionDataView } from "@/components/wedding-workspace/workspace-section-data-view";
import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceTasksPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceTasksPage({ params }: WeddingWorkspaceTasksPageProps) {
  const { weddingId } = await params;
  const summary = await getWeddingSectionSummaryBySlug(weddingId);
  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <WorkspaceQuickAddForm
        weddingSlug={weddingId}
        kind="task"
        primaryLabel="Task title"
        secondaryLabel="Due date (YYYY-MM-DD)"
        primaryPlaceholder="Finalize vendor contract"
        secondaryPlaceholder="2026-12-10"
      />
      <WorkspaceSectionDataView
        title="Tasks"
        subtitle={`Task tracking for ${summary.wedding.couple_name}`}
        totalLabel={`${summary.tasks.length} tasks`}
        emptyState="No tasks yet. Add tasks from your workflow to start tracking."
        items={summary.tasks.map((task) => ({
          id: task.id,
          primary: task.title,
          secondary: `${task.status}${task.due_date ? ` • due ${task.due_date}` : ""}`,
        }))}
      />
    </div>
  );
}
