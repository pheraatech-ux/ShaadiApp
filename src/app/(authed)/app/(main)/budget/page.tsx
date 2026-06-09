import { BusinessFinancialsDashboard } from "@/components/app-dashboard/business-financials/business-financials-dashboard";
import { getBudgetPortfolioView } from "@/lib/data/app-data";
import { USE_MOCK_FINANCIALS, getMockBudgetPortfolioView } from "@/lib/data/mock-budget-portfolio";

export const metadata = { title: "Financials" };

export default async function BudgetPage() {
  const view = USE_MOCK_FINANCIALS ? getMockBudgetPortfolioView() : await getBudgetPortfolioView();

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
