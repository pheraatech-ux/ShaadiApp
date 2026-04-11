import { Plus, Sparkles, UserPlus } from "lucide-react";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Button } from "@/components/ui/button";

export function WorkspaceTopbar() {
  return (
    <div className="flex min-h-9 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="secondary" size="sm" className="h-9 w-fit rounded-xl">
        Overview
      </Button>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button variant="outline" size="sm" className="h-9 rounded-xl">
          <Plus />
          Add vendor
        </Button>
        <Button variant="outline" size="sm" className="h-9 rounded-xl">
          <UserPlus />
          Invite team
        </Button>
        <Button size="sm" className="h-9 rounded-xl bg-violet-600 text-white hover:bg-violet-500">
          <Sparkles />
          AI report
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
