import type { User } from "@supabase/supabase-js";

type MetadataRecord = Record<string, unknown>;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getIdentityData(user: User | null): MetadataRecord {
  if (!user) return {};

  const maybeIdentities = (user as User & { identities?: unknown }).identities;
  if (!Array.isArray(maybeIdentities)) return {};

  for (const identity of maybeIdentities) {
    if (!identity || typeof identity !== "object") continue;
    const identityData = (identity as { identity_data?: unknown }).identity_data;
    if (identityData && typeof identityData === "object") {
      return identityData as MetadataRecord;
    }
  }

  return {};
}

function readNamesFromMetadata(meta: MetadataRecord) {
  const firstName = readString(meta.first_name) || readString(meta.given_name);
  const lastName = readString(meta.last_name) || readString(meta.family_name);
  const fullName = readString(meta.full_name) || readString(meta.name);
  return { firstName, lastName, fullName };
}

export function deriveProfileNameFieldsFromUser(user: User | null): {
  firstName: string | null;
  lastName: string | null;
} {
  const userMeta = ((user?.user_metadata ?? {}) as MetadataRecord) || {};
  const identityMeta = getIdentityData(user);

  const userNames = readNamesFromMetadata(userMeta);
  const identityNames = readNamesFromMetadata(identityMeta);

  const fullName = userNames.fullName || identityNames.fullName;
  const [firstFromFullName, ...lastFromFullNameParts] = fullName ? fullName.split(/\s+/) : [];

  return {
    firstName: userNames.firstName || identityNames.firstName || firstFromFullName || null,
    lastName:
      userNames.lastName || identityNames.lastName || lastFromFullNameParts.join(" ").trim() || null,
  };
}
