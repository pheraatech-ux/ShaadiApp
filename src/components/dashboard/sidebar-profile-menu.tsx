"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Ellipsis, Loader2, LogOut, User, Bell } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SidebarProfileMenuProps = {
  userName: string;
  userEmail: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const menuItems = [
  { label: "Account", icon: User, href: "/app/account" },
  { label: "Billing", icon: CreditCard, href: "/app/billing" },
  { label: "Notifications", icon: Bell, href: "/app/notifications" },
] as const;

export function SidebarProfileMenu({ userName, userEmail }: SidebarProfileMenuProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
      router.replace("/auth");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        className="mt-auto flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/50 px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
      >
        <Avatar size="default">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{userEmail}</p>
        </div>
        <Ellipsis className="size-4 shrink-0 text-sidebar-foreground/50" />
      </PopoverTrigger>

      <PopoverContent side="top" align="start" sideOffset={8} className="w-64 rounded-xl p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <Separator />

        <div className="p-1.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </button>
          ))}
        </div>

        <Separator />

        <div className="p-1.5">
          <Button
            variant="ghost"
            disabled={loggingOut}
            className="h-auto w-full justify-start gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-70"
            onClick={handleLogout}
          >
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            {loggingOut ? "Signing out…" : "Log out"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
