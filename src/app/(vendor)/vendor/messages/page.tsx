import { redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { findVendorThread } from "@/lib/vendor/thread";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorMessages } from "@/components/vendor/messages/vendor-messages";

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function displayName(first?: string | null, last?: string | null, fallback = "Planner") {
  return [first?.trim(), last?.trim()].filter(Boolean).join(" ") || fallback;
}

export default async function VendorMessagesPage() {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();

  const [threadId, { data: ownerProfile }] = await Promise.all([
    findVendorThread(admin, ctx.weddingId, ctx.userId, ctx.ownerUserId),
    admin.from("profiles").select("first_name, last_name").eq("id", ctx.ownerUserId).maybeSingle(),
  ]);

  const plannerName = displayName(ownerProfile?.first_name, ownerProfile?.last_name);

  if (!threadId) {
    return (
      <VendorMessages
        threadId={null}
        plannerName={plannerName}
        plannerInitials={getInitials(plannerName)}
        messages={[]}
      />
    );
  }

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
