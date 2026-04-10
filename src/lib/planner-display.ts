import type { User } from "@supabase/supabase-js";

type ProfileNames = {
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
} | null;

function nameFromProfile(profile: ProfileNames): string | null {
  if (!profile) return null;
  const first = profile.first_name?.trim() ?? "";
  const last = profile.last_name?.trim() ?? "";
  const combined = [first, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  const business = profile.business_name?.trim();
  if (business) return business;
  return null;
}

function nameFromUserMetadata(user: User | null): string | null {
  if (!user?.user_metadata) return null;
  const meta = user.user_metadata as Record<string, unknown>;
  const first = typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const last = typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || null;
}

function nameFromEmail(email: string | undefined): string | null {
  if (!email) return null;
  const local = email.split("@")[0]?.trim();
  return local || null;
}

export function resolvePlannerDisplayName(
  profile: ProfileNames,
  user: User | null,
): string {
  return (
    nameFromProfile(profile) ??
    nameFromUserMetadata(user) ??
    nameFromEmail(user?.email) ??
    "there"
  );
}

export function buildTimeOfDayGreeting(displayName: string): string {
  const hour = new Date().getHours();
  let prefix: string;
  if (hour < 12) prefix = "Good morning";
  else if (hour < 17) prefix = "Good afternoon";
  else prefix = "Good evening";

  return `${prefix}, ${displayName}`;
}
