"use client";

import { KnockProvider } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";

type KnockClientProviderProps = {
  userId: string | null | undefined;
  userToken?: string | null;
  apiKey: string | null | undefined;
  children: React.ReactNode;
};

export function KnockClientProvider({ userId, userToken, apiKey, children }: KnockClientProviderProps) {
  if (!userId || !apiKey) return <>{children}</>;

  return (
    <KnockProvider
      apiKey={apiKey}
      userId={userId}
      {...(userToken ? { userToken } : {})}
    >
      {children}
    </KnockProvider>
  );
}
