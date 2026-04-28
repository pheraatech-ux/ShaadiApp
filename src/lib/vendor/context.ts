import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type VendorPortalContext = {
  userId: string;
  userEmail: string | null;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  weddingId: string;
  weddingSlug: string;
  weddingCoupleName: string;
  weddingDate: string | null;
  ownerUserId: string;
};

export const getVendorPortalContext = cache(async (): Promise<VendorPortalContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getSupabaseAdminClient();
  const { data: vendor } = await admin
    .from("vendors")
    .select("id, name, category, invite_status, weddings(id, slug, couple_name, wedding_date, creator_id)")
    .eq("user_id", user.id)
    .eq("invite_status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!vendor) return null;

  const wedding = vendor.weddings as {
    id: string;
    slug: string;
    couple_name: string;
    wedding_date: string | null;
    creator_id: string;
  } | null;

  if (!wedding) return null;

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorCategory: vendor.category,
    weddingId: wedding.id,
    weddingSlug: wedding.slug,
    weddingCoupleName: wedding.couple_name,
    weddingDate: wedding.wedding_date ?? null,
    ownerUserId: wedding.creator_id,
  };
});
