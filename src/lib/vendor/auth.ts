import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function verifyActiveVendorForWedding(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string,
  weddingId: string,
): Promise<{ id: string } | null> {
  const { data } = await admin
    .from("vendors")
    .select("id")
    .eq("user_id", userId)
    .eq("wedding_id", weddingId)
    .eq("invite_status", "active")
    .maybeSingle();
  return data ?? null;
}
