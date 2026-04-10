import { ReactNode } from "react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type DashboardShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ sidebar, topbar, children }: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <SidebarInset className="h-svh overflow-hidden">
        <header className="shrink-0 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">{topbar}</div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
