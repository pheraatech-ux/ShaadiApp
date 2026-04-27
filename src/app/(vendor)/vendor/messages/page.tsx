import { redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorMessages } from "@/components/vendor/messages/vendor-messages";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function displayName(first?: string | null, last?: string | null, fallback = "Planner") {
  return [first?.trim(), last?.trim()].filter(Boolean).join(" ") || fallback;
}

async function getOrCreateVendorThread(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  weddingId: string,
  vendorUserId: string,
  plannerUserId: string,
) {
  // Find an existing thread where both are members
  const { data: vendorMemberships } = await admin
    .from("message_thread_members")
    .select("thread_id")
    .eq("user_id", vendorUserId);

  const threadIds = (vendorMemberships ?? []).map((m) => m.thread_id);

  if (threadIds.length > 0) {
    const { data: plannerMemberships } = await admin
      .from("message_thread_members")
      .select("thread_id")
      .eq("user_id", plannerUserId)
      .in("thread_id", threadIds);

    const shared = (plannerMemberships ?? []).map((m) => m.thread_id);

    if (shared.length > 0) {
      // Prefer a thread in this wedding
      const { data: weddingThread } = await admin
        .from("message_threads")
        .select("id")
        .eq("wedding_id", weddingId)
        .in("id", shared)
        .limit(1)
        .maybeSingle();
      if (weddingThread) return weddingThread.id;
      return shared[0];
    }
  }

  // Create a new DM thread
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

  if (error || !newThread) throw new Error("Failed to create thread");

  await admin.from("message_thread_members").insert([
    { thread_id: newThread.id, user_id: vendorUserId },
    { thread_id: newThread.id, user_id: plannerUserId },
  ]);

  return newThread.id;
}

export default async function VendorMessagesPage() {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();

  const [threadId, { data: ownerProfile }] = await Promise.all([
    getOrCreateVendorThread(admin, ctx.weddingId, ctx.userId, ctx.ownerUserId),
    admin.from("profiles").select("first_name, last_name").eq("id", ctx.ownerUserId).maybeSingle(),
  ]);

  const { data: rawMessages } = await admin
    .from("messages")
    .select("id, body, created_at, author_user_id")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  const authorIds = [...new Set((rawMessages ?? []).map((m) => m.author_user_id).filter(Boolean) as string[])];
  const { data: profiles } = authorIds.length > 0
    ? await admin.from("profiles").select("id, first_name, last_name").in("id", authorIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const plannerName = displayName(ownerProfile?.first_name, ownerProfile?.last_name);

  const messages = (rawMessages ?? []).map((m) => {
    const isMe = m.author_user_id === ctx.userId;
    const profile = m.author_user_id ? profileMap.get(m.author_user_id) : null;
    const name = isMe ? "You" : displayName(profile?.first_name, profile?.last_name);
    return {
      id: m.id,
      body: m.body,
      created_at: m.created_at,
      authorName: name,
      authorInitials: getInitials(name),
      isCurrentUser: isMe,
    };
  });

  return (
    <VendorMessages
      threadId={threadId}
      plannerName={plannerName}
      plannerInitials={getInitials(plannerName)}
      messages={messages}
    />
  );
}
