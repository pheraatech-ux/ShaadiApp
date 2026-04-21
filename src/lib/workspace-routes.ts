/**
 * Wedding workspace app routes under `/app/weddings/[weddingId]`.
 * Order: longest path prefixes first so `/team` does not shadow longer paths.
 */
const WORKSPACE_SECTIONS: { pathSuffix: string; label: string }[] = [
  { pathSuffix: "/ai-report", label: "AI report" },
  { pathSuffix: "/documents", label: "Documents" },
  { pathSuffix: "/budget", label: "Budget" },
  { pathSuffix: "/messages", label: "Messages" },
  { pathSuffix: "/tasks", label: "Tasks" },
  { pathSuffix: "/vendors", label: "Vendors" },
  { pathSuffix: "/team", label: "Team" },
];

export type WorkspaceSection = {
  /** Short title for the top bar (e.g. Overview, Team) */
  label: string;
  /** Canonical path for this section */
  href: string;
  /** True when URL is exactly the wedding root (overview) */
  isOverview: boolean;
};

/** App root segment: `/app` (planner) or `/app/employee` (staff portal). */
export function getWorkspaceBasePath(weddingId: string, appRoot: "/app" | "/app/employee" = "/app") {
  return `${appRoot}/weddings/${weddingId}`;
}

/**
 * Resolves which workspace section the user is in from the pathname.
 */
export function getWorkspaceSection(
  pathname: string,
  weddingId: string,
  appRoot: "/app" | "/app/employee" = "/app",
): WorkspaceSection {
  const base = getWorkspaceBasePath(weddingId, appRoot);
  const normalized = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (normalized === base) {
    return { label: "Overview", href: base, isOverview: true };
  }

  for (const { pathSuffix, label } of WORKSPACE_SECTIONS) {
    const prefix = `${base}${pathSuffix}`;
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return { label, href: prefix, isOverview: false };
    }
  }

  return { label: "Overview", href: base, isOverview: true };
}
