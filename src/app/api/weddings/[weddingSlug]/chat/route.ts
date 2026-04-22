import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DeepChatMessage = { role: string; text: string };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;

  const body = await req.json() as { messages: DeepChatMessage[] };
  const messages: DeepChatMessage[] = body.messages ?? [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const summary = await getWeddingSectionSummaryBySlug(weddingSlug);
  if (!summary) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  // Fetch events separately (not in the shared summary)
  const supabase = await createSupabaseServerClient();
  const { data: eventsData } = await supabase
    .from("wedding_events")
    .select("id, title, event_date, culture_label")
    .eq("wedding_id", summary.wedding.id)
    .order("event_date", { ascending: true });
  const events = (eventsData ?? []) as { id: string; title: string; event_date: string | null; culture_label: string | null }[];

  const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
  const budgetTotal = summary.budgetItems.reduce((s, b) => s + b.allocated_paise, 0);
  const budgetSpent = summary.budgetItems.reduce((s, b) => s + b.spent_paise, 0);

  const systemPrompt = `You are a knowledgeable wedding planning assistant for ShaadiOS. You are helping plan the wedding for ${summary.wedding.couple_name}.

Here is the complete current state of this wedding:

DATE: ${summary.wedding.wedding_date ?? "Not set yet"}
CULTURES/TRADITIONS: ${summary.wedding.cultures?.join(", ") || "Not specified"}

EVENTS/CEREMONIES (${events.length}):
${events.length > 0
  ? events.map((e) => `- ${e.title}${e.event_date ? ` on ${e.event_date}` : " (no date set)"}${e.culture_label ? ` [${e.culture_label}]` : ""}`).join("\n")
  : "None added yet"}

TASKS (${summary.tasks.length}):
${summary.tasks.slice(0, 20).map((t) => `- [${t.status}] ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}`).join("\n") || "None yet"}

VENDORS (${summary.vendors.length}):
${summary.vendors.slice(0, 20).map((v) => `- [${v.status}] ${v.name} (${v.category})`).join("\n") || "None yet"}

BUDGET: ${formatINR(budgetTotal)} allocated, ${formatINR(budgetSpent)} spent, ${formatINR(budgetTotal - budgetSpent)} remaining
DOCUMENTS: ${summary.documents.length} uploaded
MESSAGES: ${summary.messages.length} on record

You are aware of all the above data. When asked about missing events or ceremonies, compare what's listed above against the typical ceremonies for a ${summary.wedding.cultures?.join(" and ") || "traditional"} wedding and identify gaps. Be specific about what's present and what's missing. Be helpful, warm, and concise. Use markdown for formatting when useful — but never use # headings; use **bold** for section titles instead.`;

  const anthropicMessages = messages.map((m) => ({
    role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
    content: m.text,
  }));

  try {
    const result = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });
    const text = result.content[0].type === "text" ? result.content[0].text : "";
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
