import { ReactNode } from "react";

import { GlobalSearch } from "@/components/app-dashboard/dashboard/global-search";
import { PageTitle } from "@/components/app-dashboard/dashboard/page-title";
import { ThemeToggle } from "@/components/app-dashboard/dashboard/theme-toggle";

type DashboardTopbarProps = {
  greeting: string;
  actions?: ReactNode;
};

export function DashboardTopbar({ greeting: _greeting, actions }: DashboardTopbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageTitle />
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        {actions}
        <ThemeToggle />
      </div>
    </div>
  );
}
