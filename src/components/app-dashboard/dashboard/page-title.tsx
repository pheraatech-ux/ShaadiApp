"use client";

import { usePathname } from "next/navigation";

const PATH_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/app/weddings", label: "Weddings" },
  { prefix: "/app/tasks",    label: "Tasks" },
  { prefix: "/app/employee/budget", label: "Financials" },
  { prefix: "/app/budget", label: "Financials" },
  { prefix: "/app/team",     label: "Team" },
  { prefix: "/app/messages", label: "Messages" },
  { prefix: "/app/calendar", label: "Calendar" },
  { prefix: "/app/dashboard", label: "Dashboard" },
];

export function PageTitle() {
  const pathname = usePathname();
  const match = PATH_LABELS.find(({ prefix }) => pathname.startsWith(prefix));
  const label = match?.label ?? "Dashboard";

  return <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{label}</h1>;
}
