export type AllWeddingsStage = "planning" | "active" | "completed";

export type AllWeddingsFilter = "all" | AllWeddingsStage;

export type AllWeddingsSort = "date-latest" | "date-earliest" | "name-a-z";

export type AllWeddingsViewMode = "cards" | "list";

export type AllWeddingRow = {
  id: string;
  coupleName: string;
  city: string;
  venueName: string;
  dateLabel: string;
  weddingDateRaw: string | null;
  daysAway: number;
  stage: AllWeddingsStage;
  stageLabel: string;
  overdueCount: number;
  tasksDone: number;
  tasksTotal: number;
  taskSubtitle: string;
  cultures: string[];
  budgetLabel: string;
  proposalStatus: "Draft" | "Signed" | "Pending";
  invoiceStatus: "None" | "Sent" | "Pending" | "Closed";
  documentsCount: number;
};

export type AllWeddingsCounts = {
  all: number;
  planning: number;
  active: number;
  completed: number;
};

export type AllWeddingsPageView = {
  items: AllWeddingRow[];
  counts: AllWeddingsCounts;
  planCap: number;
  usedSlots: number;
};
