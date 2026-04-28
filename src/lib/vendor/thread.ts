import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function findVendorThread(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  weddingId: string,
  vendorUserId: string,
  plannerUserId: string,
): Promise<string | null> {
  const { data: vendorMemberships } = await admin
    .from("message_thread_members")
    .select("thread_id")
    .eq("user_id", vendorUserId);

  const threadIds = (vendorMemberships ?? []).map((m) => m.thread_id);
  if (threadIds.length === 0) return null;

  const { data: plannerMemberships } = await admin
    .from("message_thread_members")
    .select("thread_id")
    .eq("user_id", plannerUserId)
    .in("thread_id", threadIds);

  const shared = (plannerMemberships ?? []).map((m) => m.thread_id);
  if (shared.length === 0) return null;
  if (shared.length === 1) return shared[0];

  const { data: weddingThread } = await admin
    .from("message_threads")
    .select("id")
    .eq("wedding_id", weddingId)
    .in("id", shared)
    .limit(1)
    .maybeSingle();

  return weddingThread?.id ?? shared[0];
}

export async function getOrCreateVendorThread(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  weddingId: string,
  vendorUserId: string,
  plannerUserId: string,
): Promise<string> {
  const existing = await findVendorThread(admin, weddingId, vendorUserId, plannerUserId);
  if (existing) return existing;

  const { data: newThread, error } = await admin
    .from("message_threads")
    .insert({
      wedding_id: weddingId,
      title: "Vendor chat",
      created_by_user_id: plannerUserId,
      is_default: false,
    })
    .select("id")
    .single();

  if (error || !newThread) throw new Error("Failed to create vendor thread");

  await admin.from("message_thread_members").insert([
    { thread_id: newThread.id, user_id: vendorUserId },
    { thread_id: newThread.id, user_id: plannerUserId },
  ]);

  return newThread.id;
}
