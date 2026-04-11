export type TeamMemberStatus = "active" | "invited" | "placeholder";

export type TeamMemberRow = {
  id: string;
  name: string;
  subtitle: string;
  avatarLabel: string;
  avatarClassName?: string;
  status: TeamMemberStatus;
  rightLabel: string;
  rightClassName?: string;
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
  members: TeamMemberRow[];
};
