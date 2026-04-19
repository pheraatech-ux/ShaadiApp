export type WorkspaceNavItem = {
  id: string;
  label: string;
  badge?: number | string;
};

export type WorkspaceKpi = {
  id: string;
  label: string;
  value: string;
  helperText: string;
};

export type WorkspaceTimelineEvent = {
  id: string;
  title: string;
  dateLabel: string;
  tags: string[];
  daysLeftLabel: string;
  /** e.g. "0/4 tasks" */
  taskProgressLabel?: string;
  /** Small grey chips under the row */
  subtags?: string[];
  /** Emoji or single char for row icon */
  icon?: string;
};

export type TimelineCultureFilter = {
  id: string;
  label: string;
  tone: "punjabi" | "tamil" | "shared";
};

export type WorkspaceVendorNeed = {
  id: string;
  name: string;
  role: string;
  note: string;
  statusLabel: string;
  /** Row title like "Granthi (Sikh priest)" — overrides name+role when set */
  displayTitle?: string;
  /** e.g. "Anand Karaj — book 8 wks out" */
  contextLine?: string;
  urgency: "high" | "medium" | "low";
};

export type WorkspaceTeamMember = {
  id: string;
  avatarLabel: string;
  name: string;
  subtitle: string;
  badge?: string;
};

export type WorkspaceTeamInviteSlot = {
  id: string;
  label: string;
};

export type WeddingWorkspaceViewModel = {
  id: string;
  coupleName: string;
  plannerName: string;
  avatarLabel: string;
  locationLabel: string;
  dateLabel: string;
  daysLeftLabel: string;
  cultureTags: string[];
  eventCountLabel: string;
  navItems: WorkspaceNavItem[];
  setupTitle: string;
  setupDescription: string;
  setupChips: string[];
  leadBannerTitle: string;
  leadBannerDescription: string;
  kpis: WorkspaceKpi[];
  aiBriefTitle: string;
  aiBriefDescription: string;
  timelineTitle: string;
  timelineCultureFilters: TimelineCultureFilter[];
  timelineEvents: WorkspaceTimelineEvent[];
  /** e.g. "+ 4 more events" */
  timelineMoreEventsLabel?: string;
  vendorsNeeded: WorkspaceVendorNeed[];
  teamMembers: WorkspaceTeamMember[];
  teamInvites: WorkspaceTeamInviteSlot[];
  teamFooterNote: string;
};
