"use client";

import { ReactNode } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type DashboardShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
};

export function DashboardShell({ sidebar, topbar, children, rightPanel }: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {sidebar}
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex min-h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">{topbar}</div>
        </header>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <OverlayScrollbarsComponent
            element="main"
            className="min-h-0 flex-1 bg-muted/90"
            options={{
              overflow: { x: "hidden", y: "scroll" },
              scrollbars: { theme: "os-theme-dark", autoHide: "scroll", autoHideSuspend: true, clickScroll: true },
            }}
            defer
          >
            <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
          </OverlayScrollbarsComponent>
          {rightPanel}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
