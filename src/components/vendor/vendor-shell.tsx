import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/app-dashboard/dashboard/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/vendor/vendor-sidebar";

type VendorShellProps = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  vendorName: string;
  topbarTitle: string;
  unreadMessages?: number;
};

export function VendorShell({
  children,
  userName,
  userEmail,
  vendorName,
  topbarTitle,
  unreadMessages,
}: VendorShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <VendorSidebar
        userName={userName}
        userEmail={userEmail}
        vendorName={vendorName}
        unreadMessages={unreadMessages}
      />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex min-h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold tracking-tight">{topbarTitle}</p>
          </div>
          <ThemeToggle />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
