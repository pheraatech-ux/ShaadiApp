// import { SuperAdminBudgetDashboard } from "@/components/wedding-workspace/budget/super-admin-budget-dashboard";

import { notFound } from "next/navigation";

import { getWeddingBudgetWorkspaceViewBySlug } from "@/lib/data/app-data";
import { BudgetPageClient } from "@/components/wedding-workspace/budget/budget-page-client";

type WeddingWorkspaceBudgetPageProps = {
  params: Promise<{ weddingId: string }>;
};

export default async function WeddingWorkspaceBudgetPage({ params }: WeddingWorkspaceBudgetPageProps) {
  const { weddingId } = await params;
  const view = await getWeddingBudgetWorkspaceViewBySlug(weddingId);
  if (!view) {
    notFound();
  }

  return <BudgetPageClient view={view} />;

  // return <SuperAdminBudgetDashboard view={view} />;
}
