import { hashVendorInviteToken } from "@/lib/vendor-invites";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type VendorInviteSplashContext = {
  vendorName: string;
  vendorCategory: string;
  weddingCoupleName: string;
  inviterName: string;
  inviterInitials: string;
  expiresAtIso: string;
};

export type VendorInviteWelcomeContext = {
  firstName: string;
  vendorName: string;
  weddingCoupleName: string;
};

function displayName(firstName?: string | null, lastName?: string | null) {
  const full = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
  return full || "Your planner";
}

function initialsFromName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  const single = parts[0] ?? "?";
  return single.slice(0, 2).toUpperCase();
}

function displayFirstName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
) {
  const f = firstName?.trim();
  if (f) return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
  const local = email?.split("@")[0]?.trim();
  if (local) return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  if (lastName?.trim()) return lastName.trim();
  return "Friend";
}

export async function getVendorInviteSplashContext(rawToken: string): Promise<VendorInviteSplashContext | null> {
  const safeToken = rawToken?.trim();
  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) return null;

  const admin = getSupabaseAdminClient();
  const tokenHash = hashVendorInviteToken(safeToken);

  const { data: inviteRow } = await admin
    .from("vendor_invites")
    .select("vendor_id, owner_user_id, expires_at, claimed_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!inviteRow || inviteRow.claimed_at || inviteRow.revoked_at) return null;
  if (new Date(inviteRow.expires_at).getTime() <= Date.now()) return null;

  const [{ data: vendor }, { data: owner }] = await Promise.all([
    admin
      .from("vendors")
      .select("name, category, wedding_id")
      .eq("id", inviteRow.vendor_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", inviteRow.owner_user_id)
      .maybeSingle(),
  ]);

  if (!vendor) return null;

  const { data: wedding } = await admin
    .from("weddings")
    .select("couple_name")
    .eq("id", vendor.wedding_id)
    .maybeSingle();

  const inviterName = displayName(owner?.first_name, owner?.last_name);

  return {
    vendorName: vendor.name,
    vendorCategory: vendor.category,
    weddingCoupleName: wedding?.couple_name ?? "the wedding",
    inviterName,
    inviterInitials: initialsFromName(inviterName),
    expiresAtIso: inviteRow.expires_at,
  };
}

export async function getVendorInviteWelcomeContext(
  rawToken: string,
  userId: string,
  userEmail: string | null | undefined,
): Promise<VendorInviteWelcomeContext | null> {
  const safeToken = rawToken?.trim();
  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) return null;

  const admin = getSupabaseAdminClient();
  const tokenHash = hashVendorInviteToken(safeToken);

  const { data: inviteRow } = await admin
    .from("vendor_invites")
    .select("vendor_id, claimed_by_user_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!inviteRow) return null;

  const { data: vendor } = await admin
    .from("vendors")
    .select("name, category, wedding_id, user_id")
    .eq("id", inviteRow.vendor_id)
    .maybeSingle();

  if (!vendor || vendor.user_id !== userId) return null;

  const { data: wedding } = await admin
    .from("weddings")
    .select("couple_name")
    .eq("id", vendor.wedding_id)
    .maybeSingle();

  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  return {
    firstName: displayFirstName(profile?.first_name, profile?.last_name, userEmail),
    vendorName: vendor.name,
    weddingCoupleName: wedding?.couple_name ?? "the wedding",
  };
}
