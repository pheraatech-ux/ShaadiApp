import { notFound } from "next/navigation";

import { SuperAdminBudgetDashboard } from "@/components/wedding-workspace/budget/super-admin-budget-dashboard";
import { getWeddingBudgetWorkspaceViewBySlug } from "@/lib/data/app-data";

type WeddingWorkspaceBudgetPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceBudgetPage({ params }: WeddingWorkspaceBudgetPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingBudgetWorkspaceViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return (
    <SuperAdminBudgetDashboard view={view} />
  );
}
