import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DeepChatMessage = { role: string; text: string };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

You are aware of all the above data. When asked about missing events or ceremonies, compare what's listed above against the typical ceremonies for a ${summary.wedding.cultures?.join(" and ") || "traditional"} wedding and identify gaps. Be specific about what's present and what's missing. Be helpful, warm, and concise. Use markdown for formatting when useful.`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const lastMessage = messages[messages.length - 1];

  try {
    const chat = model.startChat({
      history,
      systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
    });

    const result = await chat.sendMessage(lastMessage.text);
    const text = result.response.text();
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
