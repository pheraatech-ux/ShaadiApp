import type { Database } from "@/types/database";

export type VendorStatus = Database["public"]["Enums"]["vendor_status"];
export type VendorInviteStatus = "not_invited" | "invited" | "active";

export type WeddingVendorRecord = {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  email: string | null;
  instagramHandle: string | null;
  quotedPricePaise: number;
  advancePaidPaise: number;
  status: VendorStatus;
  notes: string | null;
  inviteStatus: VendorInviteStatus;
  inviteSentAt: string | null;
  createdAt: string;
  userId: string | null;
};

export type VendorsViewMode = "cards" | "list";

export type WeddingVendorsWorkspaceViewModel = {
  weddingId: string;
  weddingSlug: string;
  coupleName: string;
  summary: {
    total: number;
    confirmed: number;
    shortlisted: number;
    declined: number;
    inviteSent: number;
    pendingJoin: number;
    totalQuotedPaise: number;
    totalAdvancePaise: number;
  };
  quickCategories: string[];
  vendors: WeddingVendorRecord[];
};
