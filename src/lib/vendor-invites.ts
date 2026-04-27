import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getAppBaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

export const VENDOR_INVITE_TTL_HOURS = 48;

type RotateVendorInviteArgs = {
  supabase: SupabaseClient<Database>;
  vendorId: string;
  ownerUserId: string;
  deliveryChannel?: "link" | "email";
  fallbackOrigin?: string;
  forceRotate?: boolean;
};

function toBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createVendorInviteToken() {
  return toBase64Url(randomBytes(32));
}

export function hashVendorInviteToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function getVendorInviteExpiry(now = new Date()) {
  return new Date(now.getTime() + VENDOR_INVITE_TTL_HOURS * 60 * 60 * 1000);
}

export function buildVendorInviteUrl(rawToken: string, fallbackOrigin?: string) {
  const appBaseUrl = getAppBaseUrl(fallbackOrigin);
  return `${appBaseUrl}/vendor-invite/${rawToken}`;
}

export async function rotateVendorInvite({
  supabase,
  vendorId,
  ownerUserId,
  deliveryChannel = "link",
  fallbackOrigin,
  forceRotate = true,
}: RotateVendorInviteArgs) {
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAtIso = getVendorInviteExpiry(now).toISOString();

  const { data: existingInvites, error: existingInvitesError } = await supabase
    .from("vendor_invites")
    .select("id, token, expires_at")
    .eq("vendor_id", vendorId)
    .eq("owner_user_id", ownerUserId)
    .is("claimed_at", null)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingInvitesError) throw existingInvitesError;

  const activeInvite = existingInvites?.[0];

  if (!forceRotate && activeInvite?.token) {
    const { error: updateSentAtError } = await supabase
      .from("vendor_invites")
      .update({ last_sent_at: nowIso })
      .eq("id", activeInvite.id);
    if (updateSentAtError) throw updateSentAtError;
    return {
      inviteUrl: buildVendorInviteUrl(activeInvite.token, fallbackOrigin),
      expiresAt: activeInvite.expires_at,
      isReused: true,
    };
  }

  if (forceRotate) {
    const { error: revokeError } = await supabase
      .from("vendor_invites")
      .update({ revoked_at: nowIso })
      .eq("vendor_id", vendorId)
      .eq("owner_user_id", ownerUserId)
      .is("claimed_at", null)
      .is("revoked_at", null);
    if (revokeError) throw revokeError;
  }

  const rawToken = createVendorInviteToken();
  const tokenHash = hashVendorInviteToken(rawToken);

  const { error: insertError } = await supabase.from("vendor_invites").insert({
    vendor_id: vendorId,
    owner_user_id: ownerUserId,
    token: rawToken,
    token_hash: tokenHash,
    expires_at: expiresAtIso,
    delivery_channel: deliveryChannel,
    last_sent_at: nowIso,
  });
  if (insertError) throw insertError;

  return {
    inviteUrl: buildVendorInviteUrl(rawToken, fallbackOrigin),
    expiresAt: expiresAtIso,
    isReused: false,
  };
}
