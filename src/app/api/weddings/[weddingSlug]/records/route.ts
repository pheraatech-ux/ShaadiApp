import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type Payload = {
  kind?: "task" | "vendor" | "message" | "document" | "budget" | "event";
  primary?: string;
  secondary?: string | null;
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
        ({ error: insertError } = await supabase.from("messages").insert({
          wedding_id: wedding.id,
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
