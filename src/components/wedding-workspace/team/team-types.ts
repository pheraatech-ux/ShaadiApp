export type TeamMemberStatus = "active" | "invited" | "placeholder";
export type WeddingAccessLevel = "full" | "coordinator" | "removed";

export type TeamMemberRow = {
  id: string;
  name: string;
  subtitle: string;
  avatarLabel: string;
  avatarClassName?: string;
  status: TeamMemberStatus;
  accessLevel: WeddingAccessLevel;
  activeTaskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  rightLabel?: string;
  rightClassName?: string;
};

export type WeddingTeamKpi = {
  id: string;
  title: string;
  value: string;
  helperText: string;
};

export type TeamPageViewModel = {
  weddingId: string;
  coupleName: string;
  avatarLabel: string;
  cultureTags: { label: string; tone: "punjabi" | "tamil" }[];
  venueLine: string;
  memberCountLabel: string;
  memberCap: number;
  summaryDescription: string;
  kpis: WeddingTeamKpi[];
  members: TeamMemberRow[];
};
