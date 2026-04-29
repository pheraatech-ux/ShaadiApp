"use client";

import { useQuery } from "@tanstack/react-query";

import type { WeddingVendorRecord } from "@/components/wedding-workspace/vendors/types";

export const vendorsQueryKey = (weddingSlug: string) => ["vendors", weddingSlug] as const;

async function fetchVendors(weddingSlug: string): Promise<WeddingVendorRecord[]> {
  const res = await fetch(`/api/weddings/${weddingSlug}/vendors`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch vendors");
  const data = (await res.json()) as { vendors: WeddingVendorRecord[] };
  return data.vendors;
}

export function useVendorsQuery(weddingSlug: string, initialData: WeddingVendorRecord[]) {
  return useQuery({
    queryKey: vendorsQueryKey(weddingSlug),
    queryFn: () => fetchVendors(weddingSlug),
    initialData,
    staleTime: 30_000,
  });
}
