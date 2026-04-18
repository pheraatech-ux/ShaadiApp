import { hashCompanyEmployeeInviteToken } from "@/lib/company-employee-invites";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type TeamInviteSplashContext = {
  businessName: string;
  inviterName: string;
  inviterInitials: string;
  roleLabel: string;
  expiresAtIso: string;
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

function labelForCompanyRole(role: string | null | undefined): string {
  switch (role) {
    case "coordinator":
      return "Coordinator";
    case "assistant":
      return "Assistant";
    case "viewer":
      return "Viewer";
    default:
      return "Team member";
  }
}

export async function getTeamInviteSplashContext(rawToken: string): Promise<TeamInviteSplashContext | null> {
  const safeToken = rawToken?.trim();
  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const tokenHash = hashCompanyEmployeeInviteToken(safeToken);

  const { data: inviteRow } = await admin
    .from("company_employee_invites")
    .select("employee_id, owner_user_id, expires_at, claimed_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!inviteRow || inviteRow.claimed_at || inviteRow.revoked_at) {
    return null;
  }

  if (new Date(inviteRow.expires_at).getTime() <= Date.now()) {
    return null;
  }

  const [{ data: employee }, { data: owner }] = await Promise.all([
    admin.from("company_employees").select("role").eq("id", inviteRow.employee_id).maybeSingle(),
    admin
      .from("profiles")
      .select("first_name, last_name, business_name")
      .eq("id", inviteRow.owner_user_id)
      .maybeSingle(),
  ]);

  const inviterName = displayName(owner?.first_name, owner?.last_name);
  const businessName = owner?.business_name?.trim() || "Planner workspace";

  return {
    businessName,
    inviterName,
    inviterInitials: initialsFromName(inviterName),
    roleLabel: labelForCompanyRole(employee?.role),
    expiresAtIso: inviteRow.expires_at,
  };
}
