import { BusinessFinancialsDashboard } from "@/components/app-dashboard/business-financials/business-financials-dashboard";
import { getBudgetPortfolioView } from "@/lib/data/app-data";

export default async function BudgetPage() {
  const view = await getBudgetPortfolioView();

  return (
    <BusinessFinancialsDashboard
      totalWeddings={view.weddingRows.length}
      weddingsAtRisk={view.weddingsAtRisk}
      weddingRows={view.weddingRows}
      totalBudgetPaise={view.totalBudgetPaise}
      totalAllocatedPaise={view.totalAllocatedPaise}
      totalSpentPaise={view.totalSpentPaise}
      portfolioUtilizationPercent={view.portfolioUtilizationPercent}
    />
  );
}
