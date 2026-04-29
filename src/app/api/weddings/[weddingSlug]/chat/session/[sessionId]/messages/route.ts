import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

// Extracts displayable text from an Anthropic content block array (or raw string).
// Returns null for tool-only turns (no text to show).
function extractText(content: unknown): string | null {
  if (typeof content === "string") return content.trim() || null;
  if (Array.isArray(content)) {
    const block = (content as { type: string; text?: string }[]).find((b) => b.type === "text");
    return block?.text?.trim() || null;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string; sessionId: string }> },
) {
  const { sessionId } = await params;
  const supabase = createSupabaseRouteHandlerClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Verify the session belongs to this user (RLS also covers this, but an explicit
  // check gives a clean 404 instead of an empty array on ownership mismatch).
  const { data: session } = await supabase
    .from("ai_chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  const { data: rows } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("seq", { ascending: true });

  // Convert to the {role, text} shape deep-chat's `history` prop expects.
  // Skip tool-only turns (tool_use assistant messages, tool_result user messages).
  const messages = (rows ?? [])
    .map((row) => {
      const text = extractText(row.content);
      if (!text) return null;
      return {
        role: row.role === "assistant" ? "ai" : "user",
        text,
      };
    })
    .filter((m): m is { role: string; text: string } => m !== null);

  return NextResponse.json({ messages });
}
