import { ReactNode } from "react";

type DashboardShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  mobileSidebar?: ReactNode;
  children: ReactNode;
};

export function DashboardShell({ sidebar, topbar, mobileSidebar, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden h-screen w-72 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex">
          {sidebar}
        </aside>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
            {topbar}
          </header>
          {mobileSidebar ? (
            <div className="border-b px-4 py-2 lg:hidden sm:px-6">{mobileSidebar}</div>
          ) : null}
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
