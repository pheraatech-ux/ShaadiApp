import { redirect } from "next/navigation";

import { getVendorPortalContext } from "@/lib/vendor/context";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { VendorHome } from "@/components/vendor/home/vendor-home";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function displayName(first?: string | null, last?: string | null, fallback = "Your Planner") {
  return [first?.trim(), last?.trim()].filter(Boolean).join(" ") || fallback;
}

export default async function VendorHomePage() {
  const ctx = await getVendorPortalContext();
  if (!ctx) redirect("/auth");

  const admin = getSupabaseAdminClient();

  const [{ data: tasks }, { data: events }, { data: ownerProfile }, { data: threadMemberships }] = await Promise.all([
    admin
      .from("tasks")
      .select("id, title, status, due_date, priority")
      .eq("wedding_id", ctx.weddingId)
      .contains("assignee_user_ids", [ctx.userId])
      .order("due_date", { ascending: true, nullsFirst: false }),
    admin
      .from("wedding_events")
      .select("id, title, event_date, culture_label")
      .eq("wedding_id", ctx.weddingId)
      .order("event_date", { ascending: true }),
    admin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", ctx.ownerUserId)
      .maybeSingle(),
    admin
      .from("message_thread_members")
      .select("thread_id")
      .eq("user_id", ctx.userId),
  ]);

  // Count unread messages — approximate: total messages in shared threads
  let unreadMessages = 0;
  const threadIds = (threadMemberships ?? []).map((m) => m.thread_id);
  if (threadIds.length > 0) {
    const { count } = await admin
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("thread_id", threadIds)
      .neq("author_user_id", ctx.userId);
    unreadMessages = count ?? 0;
  }

  const now = new Date();
  const upcomingEvents = (events ?? []).filter((e) => !e.event_date || new Date(e.event_date) >= now);
  const plannerName = displayName(ownerProfile?.first_name, ownerProfile?.last_name);

  return (
    <VendorHome
      vendorName={ctx.vendorName}
      vendorCategory={ctx.vendorCategory}
      weddingCoupleName={ctx.weddingCoupleName}
      weddingDate={ctx.weddingDate}
      plannerName={plannerName}
      plannerInitials={getInitials(plannerName)}
      tasks={tasks ?? []}
      upcomingEvents={upcomingEvents}
      unreadMessages={unreadMessages}
    />
  );
}
