import type { VendorInviteStatus, VendorStatus } from "@/components/wedding-workspace/vendors/types";

export const VENDOR_CATEGORY_OPTIONS = [
  { value: "Photo", label: "Photo", icon: "📸" },
  { value: "Caterer", label: "Caterer", icon: "🍽️" },
  { value: "Decor", label: "Decor", icon: "🌸" },
  { value: "Music", label: "Music", icon: "🎵" },
  { value: "Mehendi", label: "Mehendi", icon: "🌿" },
  { value: "Priest", label: "Priest", icon: "🙏" },
  { value: "Makeup", label: "Makeup", icon: "💄" },
  { value: "Other", label: "Other", icon: "…" },
] as const;

export function formatInrFromPaise(value: number) {
  const rupees = Math.max(0, value) / 100;
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

export function normalizeInstagram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function vendorStatusLabel(status: VendorStatus) {
  if (status === "confirmed") return "Confirmed";
  if (status === "declined") return "Declined";
  return "Shortlisted";
}

export function inviteStatusLabel(status: VendorInviteStatus) {
  if (status === "joined") return "Invite sent · joined";
  if (status === "sent") return "Invite sent · pending join";
  return "Not invited";
}
