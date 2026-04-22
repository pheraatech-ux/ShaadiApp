"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  /**
   * next-themes injects a small inline boot script to avoid theme flash. React 19
   * warns when that `<script>` is reconciled on the client. Marking it as
   * `application/json` on the client removes the warning; first paint still uses
   * the server-rendered executable script (see pacocoursey/next-themes#387).
   */
  const scriptProps: ComponentProps<typeof NextThemesProvider>["scriptProps"] =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
