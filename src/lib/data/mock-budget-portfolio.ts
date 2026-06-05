import { USE_MOCK_FINANCIALS } from "@/components/app-dashboard/business-financials/mock-financial-data";

export type MockWeddingRow = {
  id: string;
  weddingSlug: string;
  coupleName: string;
  totalBudgetPaise: number;
  allocatedPaise: number;
  spentPaise: number;
  status: "healthy" | "watch" | "overrun";
  cultures: string[];
};

export type MockBudgetPortfolioView = {
  totalBudgetPaise: number;
  totalAllocatedPaise: number;
  totalSpentPaise: number;
  weddingsAtRisk: number;
  portfolioUtilizationPercent: number;
  weddingRows: MockWeddingRow[];
};

const MOCK_WEDDING_ROWS: MockWeddingRow[] = [
  {
    id: "w-001",
    weddingSlug: "kapoor-banerjee",
    coupleName: "Kapoor & Banerjee",
    totalBudgetPaise: 85_00_000_00,
    allocatedPaise: 72_50_000_00,
    spentPaise: 58_20_000_00,
    status: "healthy",
    cultures: ["Punjabi", "Bengali"],
  },
  {
    id: "w-002",
    weddingSlug: "mehta-shah",
    coupleName: "Mehta & Shah",
    totalBudgetPaise: 1_20_00_000_00,
    allocatedPaise: 98_00_000_00,
    spentPaise: 91_50_000_00,
    status: "watch",
    cultures: ["Gujarati", "Marwari"],
  },
  {
    id: "w-003",
    weddingSlug: "chopra-malhotra",
    coupleName: "Chopra & Malhotra",
    totalBudgetPaise: 65_00_000_00,
    allocatedPaise: 61_00_000_00,
    spentPaise: 42_80_000_00,
    status: "healthy",
    cultures: ["Punjabi"],
  },
  {
    id: "w-004",
    weddingSlug: "reddy-nair",
    coupleName: "Reddy & Nair",
    totalBudgetPaise: 55_00_000_00,
    allocatedPaise: 52_00_000_00,
    spentPaise: 54_50_000_00,
    status: "overrun",
    cultures: ["Telugu", "Malayali"],
  },
  {
    id: "w-005",
    weddingSlug: "iyer-krishnan",
    coupleName: "Iyer & Krishnan",
    totalBudgetPaise: 42_00_000_00,
    allocatedPaise: 38_50_000_00,
    spentPaise: 22_10_000_00,
    status: "healthy",
    cultures: ["Tamil"],
  },
  {
    id: "w-006",
    weddingSlug: "desai-patel",
    coupleName: "Desai & Patel",
    totalBudgetPaise: 48_00_000_00,
    allocatedPaise: 35_00_000_00,
    spentPaise: 12_40_000_00,
    status: "healthy",
    cultures: ["Gujarati"],
  },
  {
    id: "w-007",
    weddingSlug: "verma-singh",
    coupleName: "Verma & Singh",
    totalBudgetPaise: 38_00_000_00,
    allocatedPaise: 36_00_000_00,
    spentPaise: 28_90_000_00,
    status: "watch",
    cultures: ["Punjabi", "UP"],
  },
  {
    id: "w-008",
    weddingSlug: "joshi-family",
    coupleName: "Joshi Family",
    totalBudgetPaise: 72_00_000_00,
    allocatedPaise: 68_00_000_00,
    spentPaise: 45_60_000_00,
    status: "healthy",
    cultures: ["Marathi"],
  },
];

export function getMockBudgetPortfolioView(): MockBudgetPortfolioView {
  const totalBudgetPaise = MOCK_WEDDING_ROWS.reduce((s, w) => s + w.totalBudgetPaise, 0);
  const totalAllocatedPaise = MOCK_WEDDING_ROWS.reduce((s, w) => s + w.allocatedPaise, 0);
  const totalSpentPaise = MOCK_WEDDING_ROWS.reduce((s, w) => s + w.spentPaise, 0);
  const weddingsAtRisk = MOCK_WEDDING_ROWS.filter((w) => w.status !== "healthy").length;
  const portfolioUtilizationPercent =
    totalBudgetPaise > 0 ? Math.round((totalSpentPaise / totalBudgetPaise) * 100) : 0;

  return {
    totalBudgetPaise,
    totalAllocatedPaise,
    totalSpentPaise,
    weddingsAtRisk,
    portfolioUtilizationPercent,
    weddingRows: MOCK_WEDDING_ROWS,
  };
}

export { USE_MOCK_FINANCIALS };
