export type RevenueCategoryId =
  | "planning_fees"
  | "vendor_commissions"
  | "full_service_packages"
  | "add_on_services"
  | "consultation_fees";

export const REVENUE_CATEGORIES: { id: RevenueCategoryId; label: string }[] = [
  { id: "planning_fees", label: "Planning Fees" },
  { id: "vendor_commissions", label: "Vendor Commissions" },
  { id: "full_service_packages", label: "Full Service Packages" },
  { id: "add_on_services", label: "Add-on Services" },
  { id: "consultation_fees", label: "Consultation Fees" },
];

export const DEFAULT_EXPENSE_CATEGORIES: { id: string; label: string }[] = [
  { id: "staff_salaries", label: "Staff Salaries" },
  { id: "travel", label: "Travel Expenses" },
  { id: "marketing", label: "Marketing" },
  { id: "office_logistics", label: "Office & Logistics" },
  { id: "software_tools", label: "Software & Tools" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

export type RevenueEntry = {
  id: string;
  category: RevenueCategoryId;
  amountRupees: number;
  date: string;
  description: string;
};

export type ExpenseEntry = {
  id: string;
  categoryId: string;
  categoryLabel: string;
  amountRupees: number;
  date: string;
  description: string;
};

export type CustomExpenseCategory = {
  id: string;
  label: string;
};

export type OverdueReceivable = {
  id: string;
  clientName: string;
  amountRupees: number;
  dueSince: string;
};

export type BusinessFinancialsData = {
  revenueEntries: RevenueEntry[];
  expenseEntries: ExpenseEntry[];
  customExpenseCategories: CustomExpenseCategory[];
  overdueReceivables: OverdueReceivable[];
};

export type PeriodFilter = "ytd" | "quarter" | "month";
