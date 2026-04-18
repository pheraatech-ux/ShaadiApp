import { hashCompanyEmployeeInviteToken } from "@/lib/company-employee-invites";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type TeamInviteSplashContext = {
  /** First name from `company_employees.name` when the owner created the invite; null if missing or generic placeholder. */
  inviteeFirstName: string | null;
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

function inviteeDisplayFirstName(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  if (!trimmed || /^team\s+member$/i.test(trimmed)) {
    return null;
  }
  const first = trimmed.split(/\s+/)[0] ?? "";
  if (!first) {
    return null;
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
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

export type TeamInviteWelcomeContext = {
  firstName: string;
  businessName: string;
  roleLabel: string;
};

function displayFirstNameForWelcome(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string | null | undefined,
) {
  const f = firstName?.trim();
  if (f) {
    return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
  }
  const local = email?.split("@")[0]?.trim();
  if (local && local.length > 0) {
    return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  }
  if (lastName?.trim()) {
    return lastName.trim();
  }
  return "Friend";
}

/** After a successful claim, load copy for the welcome screen (verifies this user owns the invite). */
export async function getTeamInviteWelcomeContext(
  rawToken: string,
  userId: string,
  userEmail: string | null | undefined,
): Promise<TeamInviteWelcomeContext | null> {
  const safeToken = rawToken?.trim();
  if (!safeToken || safeToken.length < 20 || safeToken.length > 256) {
    return null;
  }

  const admin = getSupabaseAdminClient();
  const tokenHash = hashCompanyEmployeeInviteToken(safeToken);

  const { data: invite } = await admin
    .from("company_employee_invites")
    .select("employee_id, owner_user_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!invite) {
    return null;
  }

  const { data: employee } = await admin
    .from("company_employees")
    .select("user_id, role")
    .eq("id", invite.employee_id)
    .maybeSingle();

  if (!employee || employee.user_id !== userId) {
    return null;
  }

  const [{ data: owner }, { data: profile }] = await Promise.all([
    admin.from("profiles").select("business_name").eq("id", invite.owner_user_id).maybeSingle(),
    admin.from("profiles").select("first_name, last_name").eq("id", userId).maybeSingle(),
  ]);

  return {
    firstName: displayFirstNameForWelcome(profile?.first_name, profile?.last_name, userEmail),
    businessName: owner?.business_name?.trim() || "your team workspace",
    roleLabel: labelForCompanyRole(employee.role),
  };
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
    admin.from("company_employees").select("name, role").eq("id", inviteRow.employee_id).maybeSingle(),
    admin
      .from("profiles")
      .select("first_name, last_name, business_name")
      .eq("id", inviteRow.owner_user_id)
      .maybeSingle(),
  ]);

  const inviterName = displayName(owner?.first_name, owner?.last_name);
  const businessName = owner?.business_name?.trim() || "Planner workspace";

  return {
    inviteeFirstName: inviteeDisplayFirstName(employee?.name),
    businessName,
    inviterName,
    inviterInitials: initialsFromName(inviterName),
    roleLabel: labelForCompanyRole(employee?.role),
    expiresAtIso: inviteRow.expires_at,
  };
}
