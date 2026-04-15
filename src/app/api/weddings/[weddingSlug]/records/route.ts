import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type Payload = {
  kind?: "task" | "vendor" | "message" | "document" | "budget" | "event";
  primary?: string;
  secondary?: string | null;
  threadId?: string | null;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as Payload;

    if (!payload.kind || !payload.primary?.trim()) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id")
      .eq("slug", weddingSlug)
      .maybeSingle();

    if (weddingError || !wedding) {
      return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
    }

    let insertError: { message?: string } | null = null;
    switch (payload.kind) {
      case "task":
        ({ error: insertError } = await supabase.from("tasks").insert({
          wedding_id: wedding.id,
          title: payload.primary.trim(),
          due_date: payload.secondary || null,
        }));
        break;
      case "vendor":
        ({ error: insertError } = await supabase.from("vendors").insert({
          wedding_id: wedding.id,
          name: payload.primary.trim(),
          category: payload.secondary?.trim() || "General",
        }));
        break;
      case "message":
        let targetThreadId = payload.threadId ?? null;
        if (!targetThreadId) {
          const { data: defaultThread } = await supabase
            .from("message_threads")
            .select("id")
            .eq("wedding_id", wedding.id)
            .eq("is_default", true)
            .maybeSingle();
          targetThreadId = defaultThread?.id ?? null;
        }
        if (!targetThreadId) {
          return NextResponse.json({ error: "No message thread found for this wedding." }, { status: 400 });
        }

        const { data: thread, error: threadError } = await supabase
          .from("message_threads")
          .select("id")
          .eq("id", targetThreadId)
          .eq("wedding_id", wedding.id)
          .maybeSingle();
        if (threadError || !thread) {
          return NextResponse.json({ error: "Thread not found for this wedding." }, { status: 400 });
        }

        const { data: membership } = await supabase
          .from("message_thread_members")
          .select("thread_id")
          .eq("thread_id", targetThreadId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!membership) {
          return NextResponse.json({ error: "You are not a member of this thread." }, { status: 403 });
        }

        ({ error: insertError } = await supabase.from("messages").insert({
          wedding_id: wedding.id,
          thread_id: targetThreadId,
          body: payload.primary.trim(),
          author_user_id: user.id,
        }));
        break;
      case "document":
        ({ error: insertError } = await supabase.from("documents").insert({
          wedding_id: wedding.id,
          title: payload.primary.trim(),
          file_url: payload.secondary || null,
          created_by_user_id: user.id,
        }));
        break;
      case "budget":
        ({ error: insertError } = await supabase.from("budget_items").insert({
          wedding_id: wedding.id,
          category: payload.primary.trim(),
          allocated_paise: Math.max(0, Number(payload.secondary ?? "0")) * 100,
        }));
        break;
      case "event":
        ({ error: insertError } = await supabase.from("wedding_events").insert({
          wedding_id: wedding.id,
          title: payload.primary.trim(),
          culture_label: payload.secondary || null,
        }));
        break;
      default:
        return NextResponse.json({ error: "Unsupported kind." }, { status: 400 });
    }

    if (insertError) {
      return NextResponse.json({ error: insertError.message ?? "Unable to save record." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save record." }, { status: 500 });
  }
}
