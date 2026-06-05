import type {
  BusinessFinancialsData,
  CustomExpenseCategory,
  ExpenseEntry,
  OverdueReceivable,
  RevenueCategoryId,
  RevenueEntry,
} from "./types";

/** Enable mock financials in local dev. Set NEXT_PUBLIC_USE_MOCK_FINANCIALS=false to hit the API instead. */
export const USE_MOCK_FINANCIALS =
  process.env.NEXT_PUBLIC_USE_MOCK_FINANCIALS !== "false" &&
  (process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_USE_MOCK_FINANCIALS === "true");

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthsAgo(n: number, day = 15): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n, day);
  return d.toISOString().slice(0, 10);
}

function rev(
  id: string,
  category: RevenueCategoryId,
  amountRupees: number,
  date: string,
  description: string,
): RevenueEntry {
  return { id, category, amountRupees, date, description };
}

function exp(
  id: string,
  categoryId: string,
  categoryLabel: string,
  amountRupees: number,
  date: string,
  description: string,
): ExpenseEntry {
  return { id, categoryId, categoryLabel, amountRupees, date, description };
}

export const MOCK_CUSTOM_EXPENSE_CATEGORIES: CustomExpenseCategory[] = [
  { id: "cat-venue-scouting", label: "Venue Scouting" },
  { id: "cat-contractors", label: "Freelance Contractors" },
];

export const MOCK_REVENUE_ENTRIES: RevenueEntry[] = [
  // Full service packages — anchor revenue
  rev("rev-001", "full_service_packages", 1_850_000, monthsAgo(4, 8), "Mehta & Shah — destination Udaipur package"),
  rev("rev-002", "full_service_packages", 2_400_000, monthsAgo(3, 12), "Kapoor & Banerjee — 3-day Delhi celebration"),
  rev("rev-003", "full_service_packages", 1_650_000, monthsAgo(2, 5), "Reddy & Nair — Hyderabad reception"),
  rev("rev-004", "full_service_packages", 980_000, monthsAgo(1, 20), "Iyer & Krishnan — Chennai temple + reception"),
  rev("rev-005", "full_service_packages", 1_200_000, daysAgo(18), "Chopra & Malhotra — Jaipur palace wedding"),
  rev("rev-006", "full_service_packages", 750_000, daysAgo(4), "Desai & Patel — partial package deposit"),

  // Planning fees
  rev("rev-010", "planning_fees", 275_000, monthsAgo(5, 10), "Q1 retainer — Sharma & Gupta"),
  rev("rev-011", "planning_fees", 180_000, monthsAgo(3, 1), "Monthly planning — Kapoor & Banerjee"),
  rev("rev-012", "planning_fees", 220_000, monthsAgo(2, 14), "Planning retainer — Reddy & Nair"),
  rev("rev-013", "planning_fees", 150_000, monthsAgo(1, 8), "Mehta & Shah — coordination phase"),
  rev("rev-014", "planning_fees", 95_000, daysAgo(22), "Chopra & Malhotra — final month planning"),
  rev("rev-015", "planning_fees", 125_000, daysAgo(2), "Desai & Patel — onboarding & timeline setup"),

  // Vendor commissions
  rev("rev-020", "vendor_commissions", 145_000, monthsAgo(4, 22), "Photography referral — Mehta & Shah"),
  rev("rev-021", "vendor_commissions", 88_000, monthsAgo(3, 18), "Decor partner commission — Kapoor wedding"),
  rev("rev-022", "vendor_commissions", 62_000, monthsAgo(2, 25), "Catering referral — Reddy & Nair"),
  rev("rev-023", "vendor_commissions", 54_000, monthsAgo(1, 15), "Mehendi artist commission"),
  rev("rev-024", "vendor_commissions", 71_000, daysAgo(12), "DJ + lighting vendor kickback"),
  rev("rev-025", "vendor_commissions", 38_000, daysAgo(1), "Florist commission — Chopra sangeet"),

  // Add-on services
  rev("rev-030", "add_on_services", 45_000, monthsAgo(3, 6), "Guest welcome kits — Kapoor wedding"),
  rev("rev-031", "add_on_services", 32_000, monthsAgo(2, 9), "RSVP concierge add-on"),
  rev("rev-032", "add_on_services", 58_000, monthsAgo(1, 3), "Mehta — late-night snack station"),
  rev("rev-033", "add_on_services", 28_000, daysAgo(8), "Chopra — custom monogram stationery"),
  rev("rev-034", "add_on_services", 19_500, daysAgo(3), "Desai — haldi décor upgrade"),

  // Consultation fees
  rev("rev-040", "consultation_fees", 15_000, monthsAgo(5, 2), "Initial consult — Joshi family"),
  rev("rev-041", "consultation_fees", 12_000, monthsAgo(4, 1), "Budget review session — Mehta"),
  rev("rev-042", "consultation_fees", 18_000, monthsAgo(2, 20), "Venue shortlist consult — Reddy"),
  rev("rev-043", "consultation_fees", 10_000, monthsAgo(1, 28), "New lead — Verma & Singh"),
  rev("rev-044", "consultation_fees", 15_000, daysAgo(6), "Desai — vendor selection consult"),
];

export const MOCK_EXPENSE_ENTRIES: ExpenseEntry[] = [
  // Staff salaries (largest line item)
  exp("exp-001", "staff_salaries", "Staff Salaries", 85_000, monthsAgo(5, 1), "Priya — lead planner salary"),
  exp("exp-002", "staff_salaries", "Staff Salaries", 72_000, monthsAgo(5, 1), "Ananya — coordinator salary"),
  exp("exp-003", "staff_salaries", "Staff Salaries", 85_000, monthsAgo(4, 1), "Priya — May salary"),
  exp("exp-004", "staff_salaries", "Staff Salaries", 72_000, monthsAgo(4, 1), "Ananya — May salary"),
  exp("exp-005", "staff_salaries", "Staff Salaries", 58_000, monthsAgo(4, 1), "Rahul — ops assistant"),
  exp("exp-006", "staff_salaries", "Staff Salaries", 85_000, monthsAgo(3, 1), "Priya — April salary"),
  exp("exp-007", "staff_salaries", "Staff Salaries", 72_000, monthsAgo(3, 1), "Ananya — April salary"),
  exp("exp-008", "staff_salaries", "Staff Salaries", 58_000, monthsAgo(3, 1), "Rahul — April salary"),
  exp("exp-009", "staff_salaries", "Staff Salaries", 85_000, monthsAgo(2, 1), "Priya — March salary"),
  exp("exp-010", "staff_salaries", "Staff Salaries", 72_000, monthsAgo(2, 1), "Ananya — March salary"),
  exp("exp-011", "staff_salaries", "Staff Salaries", 58_000, monthsAgo(2, 1), "Rahul — March salary"),
  exp("exp-012", "staff_salaries", "Staff Salaries", 85_000, monthsAgo(1, 1), "Priya — February salary"),
  exp("exp-013", "staff_salaries", "Staff Salaries", 72_000, monthsAgo(1, 1), "Ananya — February salary"),
  exp("exp-014", "staff_salaries", "Staff Salaries", 58_000, monthsAgo(1, 1), "Rahul — February salary"),
  exp("exp-015", "staff_salaries", "Staff Salaries", 85_000, daysAgo(5), "Priya — current month salary"),
  exp("exp-016", "staff_salaries", "Staff Salaries", 72_000, daysAgo(5), "Ananya — current month salary"),

  // Travel
  exp("exp-020", "travel", "Travel Expenses", 18_500, monthsAgo(4, 12), "Udaipur site recce — Mehta wedding"),
  exp("exp-021", "travel", "Travel Expenses", 12_400, monthsAgo(3, 8), "Jaipur vendor meetings"),
  exp("exp-022", "travel", "Travel Expenses", 9_800, monthsAgo(2, 16), "Hyderabad venue walkthrough"),
  exp("exp-023", "travel", "Travel Expenses", 6_200, monthsAgo(1, 11), "Delhi client check-in trip"),
  exp("exp-024", "travel", "Travel Expenses", 4_500, daysAgo(9), "Chopra wedding — on-site week travel"),

  // Marketing
  exp("exp-030", "marketing", "Marketing", 45_000, monthsAgo(5, 15), "Instagram ads — wedding season push"),
  exp("exp-031", "marketing", "Marketing", 28_000, monthsAgo(3, 22), "Wedding Expo stall — Mumbai"),
  exp("exp-032", "marketing", "Marketing", 15_000, monthsAgo(2, 5), "Portfolio shoot — real wedding feature"),
  exp("exp-033", "marketing", "Marketing", 22_000, monthsAgo(1, 18), "Google Ads — planner keywords"),
  exp("exp-034", "marketing", "Marketing", 12_000, daysAgo(7), "Influencer collaboration — reels package"),

  // Office & logistics
  exp("exp-040", "office_logistics", "Office & Logistics", 32_000, monthsAgo(4, 5), "Co-working + storage rent"),
  exp("exp-041", "office_logistics", "Office & Logistics", 32_000, monthsAgo(3, 5), "Office rent — April"),
  exp("exp-042", "office_logistics", "Office & Logistics", 32_000, monthsAgo(2, 5), "Office rent — March"),
  exp("exp-043", "office_logistics", "Office & Logistics", 32_000, monthsAgo(1, 5), "Office rent — February"),
  exp("exp-044", "office_logistics", "Office & Logistics", 8_500, monthsAgo(2, 28), "Sample décor inventory restock"),
  exp("exp-045", "office_logistics", "Office & Logistics", 32_000, daysAgo(3), "Office rent — current month"),

  // Software & tools
  exp("exp-050", "software_tools", "Software & Tools", 4_200, monthsAgo(5, 10), "Notion + Slack annual (monthly)"),
  exp("exp-051", "software_tools", "Software & Tools", 3_800, monthsAgo(4, 10), "CRM + email tools"),
  exp("exp-052", "software_tools", "Software & Tools", 3_800, monthsAgo(3, 10), "CRM + email tools"),
  exp("exp-053", "software_tools", "Software & Tools", 3_800, monthsAgo(2, 10), "CRM + email tools"),
  exp("exp-054", "software_tools", "Software & Tools", 3_800, monthsAgo(1, 10), "CRM + email tools"),
  exp("exp-055", "software_tools", "Software & Tools", 3_800, daysAgo(2), "CRM + email tools"),

  // Custom — venue scouting
  exp("exp-060", "cat-venue-scouting", "Venue Scouting", 25_000, monthsAgo(3, 14), "Udaipur palace site fees (3 venues)"),
  exp("exp-061", "cat-venue-scouting", "Venue Scouting", 18_000, monthsAgo(2, 7), "Jaipur heritage property tours"),
  exp("exp-062", "cat-venue-scouting", "Venue Scouting", 12_000, daysAgo(15), "Chopra — final venue hold deposit"),

  // Custom — freelance contractors
  exp("exp-070", "cat-contractors", "Freelance Contractors", 35_000, monthsAgo(2, 18), "Freelance designer — Mehta mood boards"),
  exp("exp-071", "cat-contractors", "Freelance Contractors", 28_000, monthsAgo(1, 9), "Day-of coordinator — Kapoor wedding"),
  exp("exp-072", "cat-contractors", "Freelance Contractors", 42_000, daysAgo(11), "Chopra — freelance production manager"),

  // Miscellaneous
  exp("exp-080", "miscellaneous", "Miscellaneous", 6_500, monthsAgo(4, 20), "Client gifting — engagement hampers"),
  exp("exp-081", "miscellaneous", "Miscellaneous", 4_200, monthsAgo(2, 22), "Team lunch — post-event debrief"),
  exp("exp-082", "miscellaneous", "Miscellaneous", 3_800, monthsAgo(1, 6), "Bank charges & payment gateway fees"),
  exp("exp-083", "miscellaneous", "Miscellaneous", 5_500, daysAgo(5), "Emergency printing — Chopra welcome boards"),
];

export const MOCK_OVERDUE_RECEIVABLES: OverdueReceivable[] = [
  {
    id: "recv-001",
    clientName: "Verma & Singh",
    amountRupees: 185_000,
    dueSince: daysAgo(47),
  },
  {
    id: "recv-002",
    clientName: "Joshi Family",
    amountRupees: 95_000,
    dueSince: daysAgo(32),
  },
  {
    id: "recv-003",
    clientName: "Mehta & Shah",
    amountRupees: 320_000,
    dueSince: daysAgo(21),
  },
  {
    id: "recv-004",
    clientName: "Reddy & Nair",
    amountRupees: 75_000,
    dueSince: daysAgo(14),
  },
];

export const MOCK_BUSINESS_FINANCIALS: BusinessFinancialsData = {
  revenueEntries: MOCK_REVENUE_ENTRIES,
  expenseEntries: MOCK_EXPENSE_ENTRIES,
  customExpenseCategories: MOCK_CUSTOM_EXPENSE_CATEGORIES,
  overdueReceivables: MOCK_OVERDUE_RECEIVABLES,
};

export function cloneMockFinancials(): BusinessFinancialsData {
  return {
    revenueEntries: [...MOCK_REVENUE_ENTRIES],
    expenseEntries: [...MOCK_EXPENSE_ENTRIES],
    customExpenseCategories: [...MOCK_CUSTOM_EXPENSE_CATEGORIES],
    overdueReceivables: [...MOCK_OVERDUE_RECEIVABLES],
  };
}
