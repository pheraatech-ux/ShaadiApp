const NS = "sdi-workspace";

export function leadSelfAssignedKey(weddingId: string) {
  return `${NS}:${weddingId}:lead-self-assigned`;
}

export function leadBannerConsumedKey(weddingId: string) {
  return `${NS}:${weddingId}:lead-banner-consumed`;
}

export function readLeadSelfAssigned(weddingId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(leadSelfAssignedKey(weddingId)) === "1";
}

export function writeLeadSelfAssigned(weddingId: string) {
  window.localStorage.setItem(leadSelfAssignedKey(weddingId), "1");
}

export function readLeadBannerConsumed(weddingId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(leadBannerConsumedKey(weddingId)) === "1";
}

export function writeLeadBannerConsumed(weddingId: string) {
  window.localStorage.setItem(leadBannerConsumedKey(weddingId), "1");
}
