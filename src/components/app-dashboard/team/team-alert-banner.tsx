import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type TeamAlertBannerProps = {
  message: string;
};

export function TeamAlertBanner({ message }: TeamAlertBannerProps) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-red-700 dark:text-red-100">
        <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-300" />
        <p className="truncate text-red-700 dark:text-red-100">{message}</p>
      </div>
      <Button size="sm" className="rounded-lg bg-amber-500 text-amber-950 hover:bg-amber-400">
        Send reminders
      </Button>
    </section>
  );
}
