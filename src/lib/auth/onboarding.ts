import type { User } from "@supabase/supabase-js";

type MetadataRecord = Record<string, unknown>;

function readMetadataBoolean(meta: MetadataRecord, key: string): boolean {
  return meta[key] === true;
}

function readPersona(user: User): string {
  const persona = user.app_metadata?.persona;
  return typeof persona === "string" ? persona : "";
}

export function isPlannerUser(user: User): boolean {
  const persona = readPersona(user);
  return persona !== "vendor" && persona !== "employee";
}

export function needsPlannerOnboarding(user: User): boolean {
  if (!isPlannerUser(user)) {
    return false;
  }

  const meta = (user.user_metadata ?? {}) as MetadataRecord;
  return !readMetadataBoolean(meta, "onboarding_completed");
}

export function hasPendingWelcome(user: User): boolean {
  if (!isPlannerUser(user)) {
    return false;
  }

  const meta = (user.user_metadata ?? {}) as MetadataRecord;
  return readMetadataBoolean(meta, "onboarding_welcome_pending");
}
