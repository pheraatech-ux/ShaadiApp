import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type DeepChatMessage = { role: string; text: string };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "create_task",
    description:
      "Create a new task in the wedding workspace. Call this when the user explicitly asks to create, add, or log a task. Always tell the user what you are creating before calling this tool.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Clear, concise task title" },
        description: { type: "string", description: "Optional longer description" },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Task priority (defaults to medium)",
        },
        due_date: {
          type: "string",
          description: "Due date in YYYY-MM-DD format (optional). Use the TODAY date provided in the system prompt to resolve relative dates like 'tomorrow' or 'next week'.",
        },
        status: {
          type: "string",
          enum: ["todo", "in_progress", "needs_review", "done"],
          description: "Initial status (defaults to todo)",
        },
        assignee_user_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of user IDs to assign this task to. Use the TEAM MEMBERS list in the system prompt to resolve names to IDs.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "search_vendors_web",
    description:
      "Search the web for wedding vendors — photographers, caterers, decorators, mehendi artists, DJs, florists, etc. Use when the user asks to find, search, or discover vendors or services. Always tell the user you are searching before calling this tool.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Specific search query including category, location, and budget if mentioned — e.g. 'wedding photographers in Mumbai under 1 lakh rupees'",
        },
      },
      required: ["query"],
    },
  },
];

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  weddingId: string,
  userId: string,
): Promise<string> {
  if (toolName === "create_task") {
    const input = toolInput as {
      title: string;
      description?: string;
      priority?: "high" | "medium" | "low";
      due_date?: string;
      status?: "todo" | "in_progress" | "needs_review" | "done";
      assignee_user_ids?: string[];
    };

    const assigneeIds = (input.assignee_user_ids ?? []).filter(Boolean);
    const { error } = await (supabase.from("tasks") as any).insert({
      wedding_id: weddingId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority ?? "medium",
      due_date: input.due_date || null,
      status: input.status ?? "todo",
      raised_by_user_id: userId,
      assignee_user_id: assigneeIds[0] ?? null,
      assignee_user_ids: assigneeIds,
      visibility: ["team_only"],
    });

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, title: input.title });
  }

  if (toolName === "search_vendors_web") {
    const { query } = toolInput as { query: string };

    if (!process.env.TAVILY_API_KEY) {
      return JSON.stringify({ error: "Web search is not configured." });
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    if (!res.ok) return JSON.stringify({ error: "Search failed. Please try again." });

    const data = (await res.json()) as {
      answer?: string;
      results?: { title: string; url: string; content?: string }[];
    };

    return JSON.stringify({
      answer: data.answer ?? null,
      results: (data.results ?? []).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.slice(0, 400),
      })),
    });
  }

  return JSON.stringify({ error: `Unknown tool: ${toolName}` });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weddingSlug: string }> },
) {
  const { weddingSlug } = await params;

  const body = (await req.json()) as { messages: DeepChatMessage[] };
  const messages: DeepChatMessage[] = body.messages ?? [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const summary = await getWeddingSectionSummaryBySlug(weddingSlug);
  if (!summary) {
    return NextResponse.json({ error: "Wedding not found." }, { status: 404 });
  }

  const supabase = createSupabaseRouteHandlerClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [{ data: eventsData }, { data: memberRows }] = await Promise.all([
    supabase
      .from("wedding_events")
      .select("id, title, event_date, culture_label")
      .eq("wedding_id", summary.wedding.id)
      .order("event_date", { ascending: true }),
    supabase
      .from("wedding_members")
      .select("user_id, display_name, invited_email, role")
      .eq("wedding_id", summary.wedding.id)
      .eq("status", "active"),
  ]);

  const events = (eventsData ?? []) as {
    id: string;
    title: string;
    event_date: string | null;
    culture_label: string | null;
  }[];

  const rawMembers = (memberRows ?? []) as {
    user_id: string | null;
    display_name: string | null;
    invited_email: string | null;
    role: string | null;
  }[];

  const memberUserIds = rawMembers.map((m) => m.user_id).filter((id): id is string => Boolean(id));
  const { data: profileRows } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, first_name, last_name").in("id", memberUserIds)
    : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };

  const profileById = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const members = rawMembers
    .filter((m): m is typeof m & { user_id: string } => Boolean(m.user_id))
    .map((m) => {
      const profile = profileById.get(m.user_id);
      const name =
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
        m.display_name ||
        m.invited_email ||
        "Team member";
      return { userId: m.user_id, name, role: m.role };
    });

  const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
  const budgetTotal = summary.budgetItems.reduce((s, b) => s + b.allocated_paise, 0);
  const budgetSpent = summary.budgetItems.reduce((s, b) => s + b.spent_paise, 0);

  const today = new Date().toISOString().slice(0, 10);

  const systemPrompt = `You are a knowledgeable wedding planning assistant for ShaadiOS. You are helping plan the wedding for ${summary.wedding.couple_name}.

TODAY: ${today} — use this as your reference for resolving relative dates like "tomorrow", "next week", etc.

Here is the complete current state of this wedding:

WEDDING DATE: ${summary.wedding.wedding_date ?? "Not set yet"}
CULTURES/TRADITIONS: ${summary.wedding.cultures?.join(", ") || "Not specified"}

EVENTS/CEREMONIES (${events.length}):
${
  events.length > 0
    ? events
        .map(
          (e) =>
            `- ${e.title}${e.event_date ? ` on ${e.event_date}` : " (no date set)"}${e.culture_label ? ` [${e.culture_label}]` : ""}`,
        )
        .join("\n")
    : "None added yet"
}

TASKS (${summary.tasks.length}):
${summary.tasks.slice(0, 20).map((t) => `- [${t.status}] ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}`).join("\n") || "None yet"}

VENDORS (${summary.vendors.length}):
${summary.vendors.slice(0, 20).map((v) => `- [${v.status}] ${v.name} (${v.category})`).join("\n") || "None yet"}

BUDGET: ${formatINR(budgetTotal)} allocated, ${formatINR(budgetSpent)} spent, ${formatINR(budgetTotal - budgetSpent)} remaining
DOCUMENTS: ${summary.documents.length} uploaded
MESSAGES: ${summary.messages.length} on record

TEAM MEMBERS (${members.length}) — use these exact user IDs when assigning tasks:
${members.length > 0
  ? members.map((m) => `- ${m.name} [user_id: ${m.userId}]${m.role ? ` (${m.role})` : ""}`).join("\n")
  : "None yet"}

You have two actions available:
- **create_task**: Adds a task directly to the wedding workspace. Before calling it, tell the user exactly what task you are creating.
- **search_vendors_web**: Searches the web for vendors or services. Before calling it, tell the user what you are searching for.

When asked about missing events or ceremonies, compare what's listed above against the typical ceremonies for a ${summary.wedding.cultures?.join(" and ") || "traditional"} wedding and identify gaps. Be specific about what's present and what's missing. Be helpful, warm, and concise. Use markdown for formatting when useful — but never use # headings; use **bold** for section titles instead.`;

  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
    content: m.text,
  }));

  try {
    let response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: anthropicMessages,
    });

    // Agentic loop: execute tools until Claude reaches end_turn
    while (response.stop_reason === "tool_use") {
      const assistantContent = response.content;
      const toolUseBlocks = assistantContent.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            supabase,
            summary.wedding.id,
            user.id,
          ),
        })),
      );

      anthropicMessages.push({ role: "assistant", content: assistantContent });
      anthropicMessages.push({ role: "user", content: toolResults });

      response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        tools: TOOLS,
        messages: anthropicMessages,
      });
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    const text = textBlock?.text ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
