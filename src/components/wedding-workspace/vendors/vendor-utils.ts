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

/** `tel:` href for clickable phone links (strips spaces for broader client support). */
export function toTelHref(phone: string) {
  const t = phone.trim();
  if (!t) return "";
  return `tel:${t.replace(/\s/g, "")}`;
}

/** `mailto:` href for clickable email links. */
export function toMailtoHref(email: string) {
  const e = email.trim();
  if (!e) return "";
  return `mailto:${e}`;
}

export function vendorStatusLabel(status: VendorStatus) {
  if (status === "confirmed") return "Confirmed";
  if (status === "declined") return "Declined";
  return "Shortlisted";
}

export function inviteStatusLabel(status: VendorInviteStatus) {
  if (status === "active") return "Portal joined";
  if (status === "invited") return "Invite pending";
  return "Not invited";
}
