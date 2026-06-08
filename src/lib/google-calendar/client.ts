import { google } from "googleapis";

export type GCalTokenSet = {
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  scope?: string | null;
  token_type?: string | null;
};

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

/** Build an OAuth2 client for Google Calendar, setting the redirect URI from the
 *  incoming request origin so it always matches what was registered in GCP. */
export function buildOAuthClient(redirectUri: string): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri,
  );
}

/** Generate the Google consent-screen URL. */
export function getAuthUrl(redirectUri: string, state?: string): string {
  const client = buildOAuthClient(redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    prompt: "consent",
    state,
  });
}

/** Exchange an auth code for tokens. */
export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<GCalTokenSet> {
  const client = buildOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);
  return tokens as GCalTokenSet;
}

/** Build an authenticated OAuth2 client from stored tokens.
 *  The `onRefresh` callback is called with any new tokens so callers can
 *  persist them back to the database. */
export function buildAuthedClient(
  tokens: GCalTokenSet,
  redirectUri: string,
  onRefresh?: (newTokens: GCalTokenSet) => void,
): OAuth2Client {
  const client = buildOAuthClient(redirectUri);
  client.setCredentials({
    ...tokens,
    scope: tokens.scope ?? undefined,
    refresh_token: tokens.refresh_token ?? undefined,
  });
  if (onRefresh) {
    client.on("tokens", (newTokens) => {
      onRefresh(newTokens as GCalTokenSet);
    });
  }
  return client;
}

/** Derive the canonical redirect URI from a Next.js request URL. */
export function getRedirectUri(requestUrl: string): string {
  const { origin } = new URL(requestUrl);
  return `${origin}/api/auth/google-calendar/callback`;
}

// Re-export the type so other modules can use it without importing google-auth-library
export type { OAuth2Client };
