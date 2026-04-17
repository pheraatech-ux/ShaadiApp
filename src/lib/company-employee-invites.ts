import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getAppBaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

export const COMPANY_EMPLOYEE_INVITE_TTL_HOURS = 48;

type RotateCompanyEmployeeInviteArgs = {
  supabase: SupabaseClient<Database>;
  employeeId: string;
  ownerUserId: string;
  deliveryChannel?: "link" | "whatsapp" | "email";
  fallbackOrigin?: string;
};

function toBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createCompanyEmployeeInviteToken() {
  return toBase64Url(randomBytes(32));
}

export function hashCompanyEmployeeInviteToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function getCompanyEmployeeInviteExpiry(now = new Date()) {
  return new Date(now.getTime() + COMPANY_EMPLOYEE_INVITE_TTL_HOURS * 60 * 60 * 1000);
}

export function buildCompanyEmployeeInviteUrl(rawToken: string, fallbackOrigin?: string) {
  const appBaseUrl = getAppBaseUrl(fallbackOrigin);
  return `${appBaseUrl}/invite/${rawToken}`;
}

export async function rotateCompanyEmployeeInvite({
  supabase,
  employeeId,
  ownerUserId,
  deliveryChannel = "link",
  fallbackOrigin,
}: RotateCompanyEmployeeInviteArgs) {
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAtIso = getCompanyEmployeeInviteExpiry(now).toISOString();
  const rawToken = createCompanyEmployeeInviteToken();
  const tokenHash = hashCompanyEmployeeInviteToken(rawToken);

  const { error: revokeError } = await supabase
    .from("company_employee_invites")
    .update({ revoked_at: nowIso })
    .eq("employee_id", employeeId)
    .eq("owner_user_id", ownerUserId)
    .is("claimed_at", null)
    .is("revoked_at", null);
  if (revokeError) {
    throw revokeError;
  }

  const { error: inviteInsertError } = await supabase.from("company_employee_invites").insert({
    employee_id: employeeId,
    owner_user_id: ownerUserId,
    token_hash: tokenHash,
    expires_at: expiresAtIso,
    delivery_channel: deliveryChannel,
    last_sent_at: nowIso,
  });
  if (inviteInsertError) {
    throw inviteInsertError;
  }

  return {
    inviteUrl: buildCompanyEmployeeInviteUrl(rawToken, fallbackOrigin),
    expiresAt: expiresAtIso,
  };
}
