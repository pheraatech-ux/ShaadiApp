export type WeddingMessageItem = {
  id: string;
  threadId: string;
  body: string;
  createdAt: string;
  authorUserId: string | null;
  authorLabel: string;
  authorInitials: string;
  isCurrentUser: boolean;
  isPending?: boolean;
};

export type WeddingMessageParticipant = {
  id: string;
  label: string;
  initials: string;
  isCurrentUser: boolean;
  status: "active" | "invited";
  messageCount: number;
  lastMessageAt: string | null;
  email: string | null;
};

export type WeddingMessagesWorkspaceViewModel = {
  weddingId: string;
  weddingSlug: string;
  coupleName: string;
  currentUserId: string;
  currentUserLabel: string;
  defaultThreadId: string | null;
  messages: WeddingMessageItem[];
  threads: {
    id: string;
    title: string;
    isDefault: boolean;
    participantIds: string[];
    participantLabels: string[];
    messageCount: number;
    lastMessageAt: string | null;
  }[];
  participants: WeddingMessageParticipant[];
  summary: {
    totalMessages: number;
    participantCount: number;
    threadCount: number;
    lastMessageAt: string | null;
  };
};
