"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppSidebar } from "@/components/app-dashboard/dashboard/app-sidebar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppSidebarCounts } from "@/lib/data/app-data";

export const SIDEBAR_COUNTS_QUERY_KEY = ["sidebar-counts"] as const;

async function fetchSidebarCounts(): Promise<AppSidebarCounts> {
  const res = await fetch("/api/sidebar/counts", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch sidebar counts");
  return res.json() as Promise<AppSidebarCounts>;
}

type Props = {
  userName: string;
  userEmail: string;
  initialCounts: AppSidebarCounts;
  weddingIds: string[];
  basePath?: string;
  hideBudgetTab?: boolean;
  hideTeamTab?: boolean;
};

export function AppSidebarWithLiveCounts({
  userName,
  userEmail,
  initialCounts,
  weddingIds,
  basePath,
  hideBudgetTab,
  hideTeamTab,
}: Props) {
  const queryClient = useQueryClient();

  const { data: counts } = useQuery({
    queryKey: SIDEBAR_COUNTS_QUERY_KEY,
    queryFn: fetchSidebarCounts,
    initialData: initialCounts,
    staleTime: 5 * 60 * 1000,
  });

  const weddingIdsFilter = useMemo(() => weddingIds.join(","), [weddingIds]);

  useEffect(() => {
    if (!weddingIdsFilter) return;
    const supabase = getSupabaseBrowserClient();
    const filter = `wedding_id=in.(${weddingIdsFilter})`;
    const invalidate = () => {
      void queryClient.invalidateQueries({ queryKey: SIDEBAR_COUNTS_QUERY_KEY });
    };
    const channel = supabase
      .channel("sidebar-counts-invalidation")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter }, invalidate)
      .on("postgres_changes", { event: "*", schema: "public", table: "wedding_members", filter }, invalidate)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient, weddingIdsFilter]);

  return (
    <AppSidebar
      userName={userName}
      userEmail={userEmail}
      counts={counts}
      basePath={basePath}
      hideBudgetTab={hideBudgetTab}
      hideTeamTab={hideTeamTab}
    />
  );
}
