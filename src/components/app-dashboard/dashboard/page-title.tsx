"use client";

import { usePathname } from "next/navigation";

import { parseGreetingDisplay } from "@/lib/planner-display";

const PATH_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/app/weddings", label: "Weddings" },
  { prefix: "/app/tasks", label: "Tasks" },
  { prefix: "/app/employee/budget", label: "Financials" },
  { prefix: "/app/budget", label: "Financials" },
  { prefix: "/app/team", label: "Team" },
  { prefix: "/app/employee/notes", label: "Notes" },
  { prefix: "/app/notes", label: "Notes" },
  { prefix: "/app/calendar", label: "Calendar" },
  { prefix: "/app/dashboard", label: "Dashboard" },
];

const DASHBOARD_PATHS = new Set(["/app/dashboard", "/app/employee/dashboard"]);

type PageTitleProps = {
  greeting?: string;
};

export function PageTitle({ greeting }: PageTitleProps) {
  const pathname = usePathname() ?? "/app/dashboard";

  if (DASHBOARD_PATHS.has(pathname) && greeting) {
    const { salutation, greetedName, fullGreeting } = parseGreetingDisplay(greeting);

    return (
      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight sm:text-xl">
        {greetedName ? (
          <>
            {salutation}, {greetedName}
            <span className="topbar-wave ml-3.5 inline-block origin-[70%_70%] sm:ml-2" aria-hidden>
              👋
            </span>
          </>
        ) : (
          <>
            {fullGreeting}
            <span className="topbar-wave ml-3.5 inline-block origin-[70%_70%] sm:ml-2" aria-hidden>
              👋
            </span>
          </>
        )}
      </h1>
    );
  }

  const match = PATH_LABELS.find(({ prefix }) => pathname.startsWith(prefix));
  const label = match?.label ?? "Dashboard";

  return <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{label}</h1>;
}
