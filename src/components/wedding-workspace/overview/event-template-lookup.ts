import {
  CULTURES,
  CULTURE_MAP,
  EVENT_LIBRARY,
  type CultureId,
  type WeddingEvent,
} from "../../../../weddingCultures";

function resolveCultureId(label: string | null): CultureId | null {
  if (!label) return null;
  if (label in CULTURE_MAP) return label as CultureId;
  const normalized = label.trim().toLowerCase();
  const match = CULTURES.find(
    (culture) =>
      culture.shortName.toLowerCase() === normalized ||
      culture.name.toLowerCase() === normalized,
  );
  return match?.id ?? null;
}

function matchesEventTitle(template: WeddingEvent, title: string): boolean {
  const normalized = title.trim().toLowerCase();
  const names = [template.name, ...(template.alternateNames ?? [])].map((name) =>
    name.toLowerCase(),
  );
  return names.some((name) => name === normalized);
}

export function findEventTemplate(
  title: string,
  cultureLabel: string | null,
): WeddingEvent | null {
  const cultureId = resolveCultureId(cultureLabel);
  const candidates = Object.values(EVENT_LIBRARY).filter((template) =>
    matchesEventTitle(template, title),
  );

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  if (cultureId) {
    const cultureMatch = candidates.find((template) => template.cultures.includes(cultureId));
    if (cultureMatch) return cultureMatch;
  }

  return candidates[0];
}
