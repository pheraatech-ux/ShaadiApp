import Knock from "@knocklabs/node";
import { signUserToken } from "@knocklabs/node";

import { getKnockServerEnv } from "@/lib/env";

let knockClient: Knock | undefined;

export function getKnockClient(): Knock {
  if (!knockClient) {
    const { knockApiKeySecret } = getKnockServerEnv();
    knockClient = new Knock(knockApiKeySecret);
  }
  return knockClient;
}

export async function generateKnockUserToken(userId: string): Promise<string | undefined> {
  const { knockSigningKey } = getKnockServerEnv();
  if (!knockSigningKey) return undefined;
  return signUserToken(userId, { signingKey: knockSigningKey, expiresInSeconds: 3600 });
}
