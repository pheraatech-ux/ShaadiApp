export type BudgetBucketId =
  | "venue"
  | "catering"
  | "decor"
  | "outfits"
  | "photo"
  | "entertainment"
  | "rituals"
  | "logistics";

export type BudgetSplit = Record<BudgetBucketId, number>;

type CultureBudgetProfile = {
  id: string;
  label: string;
  keywords: string[];
  split: BudgetSplit;
};

export const BUDGET_BUCKETS: Array<{ id: BudgetBucketId; label: string; shortLabel: string }> = [
  { id: "venue", label: "Venue", shortLabel: "Venue" },
  { id: "catering", label: "Catering", shortLabel: "Food" },
  { id: "decor", label: "Decor", shortLabel: "Decor" },
  { id: "outfits", label: "Outfits & Jewellery", shortLabel: "Outfits" },
  { id: "photo", label: "Photo & Video", shortLabel: "Photo" },
  { id: "entertainment", label: "Music & Entertainment", shortLabel: "Music" },
  { id: "rituals", label: "Rituals & Specialists", shortLabel: "Rituals" },
  { id: "logistics", label: "Logistics & Buffer", shortLabel: "Other" },
];

const DEFAULT_SPLIT: BudgetSplit = {
  venue: 23,
  catering: 23,
  decor: 13,
  outfits: 13,
  photo: 10,
  entertainment: 8,
  rituals: 5,
  logistics: 5,
};

const CULTURE_PROFILES: CultureBudgetProfile[] = [
  {
    id: "tamil-south",
    label: "Tamil / South-focused",
    keywords: ["tamil", "telugu", "kannada", "malayalam", "brahmin"],
    split: { venue: 25, catering: 28, decor: 10, outfits: 12, photo: 8, entertainment: 6, rituals: 7, logistics: 4 },
  },
  {
    id: "north-opulent",
    label: "North Indian scale-heavy",
    keywords: ["punjabi", "hindu", "hindi", "rajasthani", "marwari", "up", "bihari", "sindhi", "kashmiri"],
    split: { venue: 22, catering: 20, decor: 16, outfits: 17, photo: 9, entertainment: 9, rituals: 4, logistics: 3 },
  },
  {
    id: "west-festive",
    label: "West Indian festive",
    keywords: ["gujarati", "marathi", "maharashtrian", "jain", "parsi"],
    split: { venue: 21, catering: 22, decor: 14, outfits: 16, photo: 9, entertainment: 10, rituals: 4, logistics: 4 },
  },
  {
    id: "east-ritual",
    label: "East / ritual-detail focused",
    keywords: ["bengali", "odia", "assamese", "manipuri"],
    split: { venue: 21, catering: 23, decor: 12, outfits: 14, photo: 12, entertainment: 7, rituals: 6, logistics: 5 },
  },
];

function getProfileForCultureLabel(label: string) {
  const value = label.trim().toLowerCase();
  return CULTURE_PROFILES.find((profile) => profile.keywords.some((keyword) => value.includes(keyword))) ?? null;
}

export function buildRecommendedBudgetSplit(cultures: string[]) {
  const matchedProfiles = cultures
    .map((culture) => getProfileForCultureLabel(culture))
    .filter((profile): profile is CultureBudgetProfile => Boolean(profile));

  if (matchedProfiles.length === 0) {
    return {
      split: DEFAULT_SPLIT,
      profileLabel: "Balanced baseline split",
      reasoning: ["No culture-specific profile matched, so a balanced split is applied."],
    };
  }

  const blended = BUDGET_BUCKETS.reduce(
    (acc, bucket) => {
      const total = matchedProfiles.reduce((sum, profile) => sum + profile.split[bucket.id], 0);
      acc[bucket.id] = Math.round(total / matchedProfiles.length);
      return acc;
    },
    {} as BudgetSplit,
  );

  const totalPercent = Object.values(blended).reduce((sum, value) => sum + value, 0);
  blended.logistics += 100 - totalPercent;

  return {
    split: blended,
    profileLabel:
      matchedProfiles.length === 1
        ? matchedProfiles[0].label
        : `${matchedProfiles[0].label} + ${matchedProfiles.length - 1} blended profile${matchedProfiles.length > 2 ? "s" : ""}`,
    reasoning: [
      `Recommendation auto-adjusted from wedding culture tags (${cultures.join(", ")}).`,
      "Tamil/South weddings allocate relatively more toward food, venue, and ritual specialists.",
      "North-heavy weddings allocate relatively more toward outfits, decor, and entertainment.",
    ],
  };
}

export function mapBudgetCategoryToBucket(category: string): BudgetBucketId {
  const normalized = category.trim().toLowerCase();
  if (/(venue|hall|mandap)/.test(normalized)) return "venue";
  if (/(food|cater|meal)/.test(normalized)) return "catering";
  if (/(decor|flower|design|styling)/.test(normalized)) return "decor";
  if (/(outfit|wear|attire|jewel|jewellery|saree|lehenga|dress)/.test(normalized)) return "outfits";
  if (/(photo|video|cinema|camera|shoot)/.test(normalized)) return "photo";
  if (/(music|dj|entertain|sangeet|band|dance)/.test(normalized)) return "entertainment";
  if (/(priest|pandit|vadhyar|ritual|pooja)/.test(normalized)) return "rituals";
  return "logistics";
}
