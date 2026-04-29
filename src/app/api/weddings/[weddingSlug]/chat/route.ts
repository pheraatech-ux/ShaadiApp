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
    name: "update_task",
    description:
      "Update an existing task in the wedding workspace. Use the task ID from the TASKS list in the system prompt. Only include fields the user wants to change — omit everything else.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "The ID of the task to update — from the TASKS list" },
        title: { type: "string", description: "New title (optional)" },
        description: { type: "string", description: "New description (optional)" },
        priority: { type: "string", enum: ["high", "medium", "low"], description: "New priority (optional)" },
        status: { type: "string", enum: ["todo", "in_progress", "needs_review", "done"], description: "New status (optional)" },
        due_date: { type: "string", description: "New due date in YYYY-MM-DD format. Use TODAY from the system prompt to resolve relative dates. Pass empty string to clear." },
        assignee_user_ids: {
          type: "array",
          items: { type: "string" },
          description: "New list of assignee user IDs. Replaces the existing assignees entirely. Resolve names from the TEAM MEMBERS list.",
        },
      },
      required: ["task_id"],
    },
  },
  {
    name: "create_event",
    description:
      "Add a new event or ceremony to the wedding timeline. Call this when the user asks to add, create, or schedule an event/ceremony. The title is required — if the user hasn't provided a date, ask for it first since it's important for the timeline. Other fields are optional and can be filled in later.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Event or ceremony name, e.g. 'Mehndi', 'Sangeet', 'Pheras'" },
        event_date: {
          type: "string",
          description: "Date in YYYY-MM-DD format. Use TODAY from the system prompt to resolve relative dates. Ask the user if not provided.",
        },
        culture_label: {
          type: "string",
          description: "Cultural tradition this event belongs to — use one of the wedding's cultures listed in the system prompt, or leave blank if it applies to all.",
        },
        start_time: { type: "string", description: "Start time in HH:MM 24-hour format, e.g. '18:00' (optional)" },
        end_time: { type: "string", description: "End time in HH:MM 24-hour format, e.g. '22:00' (optional)" },
        venue: { type: "string", description: "Venue name (optional)" },
        venue_address: { type: "string", description: "Full venue address (optional)" },
        notes: { type: "string", description: "Any additional notes about the event (optional)" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_event",
    description:
      "Update an existing event or ceremony on the wedding timeline. Use the event ID from the EVENTS/CEREMONIES list in the system prompt. Only include fields the user wants to change — omit everything else.",
    input_schema: {
      type: "object",
      properties: {
        event_id: { type: "string", description: "The ID of the event to update — from the EVENTS/CEREMONIES list" },
        title: { type: "string", description: "New title (optional)" },
        event_date: { type: "string", description: "New date in YYYY-MM-DD format (optional)" },
        culture_label: { type: "string", description: "New culture label (optional). Use the wedding's cultures from the system prompt." },
        start_time: { type: "string", description: "New start time in HH:MM 24-hour format (optional)" },
        end_time: { type: "string", description: "New end time in HH:MM 24-hour format (optional)" },
        venue: { type: "string", description: "New venue name (optional)" },
        venue_address: { type: "string", description: "New venue address (optional)" },
        notes: { type: "string", description: "New notes (optional)" },
      },
      required: ["event_id"],
    },
  },
  {
    name: "add_vendor",
    description:
      "Add a vendor to this wedding's vendor directory. Use this after finding vendors via search when the user asks to save, add, or keep a vendor. Before calling this tool, make sure you have contact details (phone, email, or website) — if you don't have them, run search_vendors_web first to find them. Tell the user which vendor you are adding.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Vendor or business name" },
        category: { type: "string", description: "e.g. 'Dhol Player', 'Photographer', 'Caterer', 'Decorator'" },
        phone: { type: "string", description: "Phone number if available" },
        email: { type: "string", description: "Email address if available" },
        website_url: { type: "string", description: "Website URL if available" },
        address: { type: "string", description: "Physical address if available" },
        notes: { type: "string", description: "Pricing, specialties, or any other useful details from the search results" },
      },
      required: ["name", "category"],
    },
  },
  {
    name: "update_vendor",
    description:
      "Update an existing vendor in this wedding's vendor directory. Use this when the user asks to edit, change, or update a vendor's details. Only include fields the user wants to change — omit everything else.",
    input_schema: {
      type: "object",
      properties: {
        vendor_id: { type: "string", description: "The ID of the vendor to update — match by name from the VENDORS list" },
        name: { type: "string", description: "New vendor name (optional)" },
        category: { type: "string", description: "New category (optional)" },
        phone: { type: "string", description: "New phone number (optional)" },
        email: { type: "string", description: "New email address (optional)" },
        website_url: { type: "string", description: "New website URL (optional)" },
        address: { type: "string", description: "New address (optional)" },
        notes: { type: "string", description: "New notes (optional)" },
        is_confirmed: { type: "boolean", description: "Set to true to confirm the vendor, false to revert to pending (optional)" },
      },
      required: ["vendor_id"],
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

const SESSION_WINDOW = 30; // max messages loaded per session to control token cost

async function loadSessionMessages(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  sessionId: string,
): Promise<Anthropic.MessageParam[]> {
  // Order by seq descending so we can LIMIT to the last N messages, then reverse
  const { data } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("seq", { ascending: false })
    .limit(SESSION_WINDOW);

  return (data ?? []).reverse().map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content as Anthropic.MessageParam["content"],
  }));
}

async function saveMessages(
  supabase: ReturnType<typeof createSupabaseRouteHandlerClient>,
  sessionId: string,
  messages: Anthropic.MessageParam[],
): Promise<void> {
  if (messages.length === 0) return;

  // Get current max seq so new messages are appended in strict order
  const { data: maxRow } = await supabase
    .from("ai_chat_messages")
    .select("seq")
    .eq("session_id", sessionId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startSeq = (maxRow?.seq ?? -1) + 1;

  await supabase.from("ai_chat_messages").insert(
    messages.map((m, i) => ({
      session_id: sessionId,
      role: m.role,
      seq: startSeq + i,
      content: m.content as unknown as import("@/types/database").Json,
    })),
  );
}

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

  if (toolName === "update_task") {
    const input = toolInput as {
      task_id: string;
      title?: string;
      description?: string;
      priority?: "high" | "medium" | "low";
      status?: "todo" | "in_progress" | "needs_review" | "done";
      due_date?: string;
      assignee_user_ids?: string[];
    };

    const updates: Record<string, unknown> = {};
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.description !== undefined) updates.description = input.description.trim() || null;
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.status !== undefined) {
      updates.status = input.status;
      updates.completed_at = input.status === "done" ? new Date().toISOString() : null;
    }
    if (input.due_date !== undefined) updates.due_date = input.due_date || null;
    if (input.assignee_user_ids !== undefined) {
      const ids = input.assignee_user_ids.filter(Boolean);
      updates.assignee_user_ids = ids;
      updates.assignee_user_id = ids[0] ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return JSON.stringify({ success: false, error: "No fields to update." });
    }

    const { error } = await (supabase.from("tasks") as any)
      .update(updates)
      .eq("id", input.task_id)
      .eq("wedding_id", weddingId);

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true });
  }

  if (toolName === "create_event") {
    const input = toolInput as {
      title: string;
      event_date?: string;
      culture_label?: string;
      start_time?: string;
      end_time?: string;
      venue?: string;
      venue_address?: string;
      notes?: string;
    };

    const { error } = await supabase.from("wedding_events").insert({
      wedding_id: weddingId,
      title: input.title.trim(),
      event_date: input.event_date || null,
      culture_label: input.culture_label?.trim() || null,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      venue: input.venue?.trim() || null,
      venue_address: input.venue_address?.trim() || null,
      notes: input.notes?.trim() || null,
    });

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, title: input.title });
  }

  if (toolName === "update_event") {
    const input = toolInput as {
      event_id: string;
      title?: string;
      event_date?: string;
      culture_label?: string;
      start_time?: string;
      end_time?: string;
      venue?: string;
      venue_address?: string;
      notes?: string;
    };

    const updates: {
      title?: string;
      event_date?: string | null;
      culture_label?: string | null;
      start_time?: string | null;
      end_time?: string | null;
      venue?: string | null;
      venue_address?: string | null;
      notes?: string | null;
    } = {};
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.event_date !== undefined) updates.event_date = input.event_date || null;
    if (input.culture_label !== undefined) updates.culture_label = input.culture_label.trim() || null;
    if (input.start_time !== undefined) updates.start_time = input.start_time || null;
    if (input.end_time !== undefined) updates.end_time = input.end_time || null;
    if (input.venue !== undefined) updates.venue = input.venue.trim() || null;
    if (input.venue_address !== undefined) updates.venue_address = input.venue_address.trim() || null;
    if (input.notes !== undefined) updates.notes = input.notes.trim() || null;

    if (Object.keys(updates).length === 0) {
      return JSON.stringify({ success: false, error: "No fields to update." });
    }

    const { error } = await supabase
      .from("wedding_events")
      .update(updates)
      .eq("id", input.event_id)
      .eq("wedding_id", weddingId);

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true });
  }

  if (toolName === "add_vendor") {
    const input = toolInput as {
      name: string;
      category: string;
      phone?: string;
      email?: string;
      website_url?: string;
      address?: string;
      notes?: string;
    };

    const { error } = await supabase.from("vendors").insert({
      wedding_id: weddingId,
      name: input.name.trim(),
      category: input.category.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      website_url: input.website_url?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "pending",
    });

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, name: input.name, action: "vendors" });
  }

  if (toolName === "update_vendor") {
    const input = toolInput as {
      vendor_id: string;
      name?: string;
      category?: string;
      phone?: string;
      email?: string;
      website_url?: string;
      address?: string;
      notes?: string;
      is_confirmed?: boolean;
    };

    const updates: {
      name?: string;
      category?: string;
      phone?: string | null;
      email?: string | null;
      website_url?: string | null;
      address?: string | null;
      notes?: string | null;
      status?: "pending" | "confirmed" | "declined";
    } = {};
    if (input.name !== undefined) updates.name = input.name.trim() || "Vendor";
    if (input.category !== undefined) updates.category = input.category.trim() || "Other";
    if (input.phone !== undefined) updates.phone = input.phone.trim() || null;
    if (input.email !== undefined) updates.email = input.email.trim() || null;
    if (input.website_url !== undefined) updates.website_url = input.website_url.trim() || null;
    if (input.address !== undefined) updates.address = input.address.trim() || null;
    if (input.notes !== undefined) updates.notes = input.notes.trim() || null;
    if (input.is_confirmed !== undefined) updates.status = input.is_confirmed ? "confirmed" : "pending";

    if (Object.keys(updates).length === 0) {
      return JSON.stringify({ success: false, error: "No fields to update." });
    }

    const { error } = await supabase
      .from("vendors")
      .update(updates)
      .eq("id", input.vendor_id)
      .eq("wedding_id", weddingId);

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, action: "vendors" });
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

  const body = (await req.json()) as { messages: DeepChatMessage[]; sessionId?: string };
  const messages: DeepChatMessage[] = body.messages ?? [];
  const sessionId = body.sessionId;

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
            `- [id:${e.id}] ${e.title}${e.event_date ? ` on ${e.event_date}` : " (no date set)"}${e.culture_label ? ` [${e.culture_label}]` : ""}`,
        )
        .join("\n")
    : "None added yet"
}

TASKS (${summary.tasks.length}):
${summary.tasks.slice(0, 20).map((t) => `- [id:${t.id}] [${t.status}] ${t.title}${t.due_date ? ` (due ${t.due_date})` : ""}`).join("\n") || "None yet"}

VENDORS (${summary.vendors.length}):
${summary.vendors.slice(0, 20).map((v) => `- [id:${v.id}] [${v.status}] ${v.name} (${v.category})`).join("\n") || "None yet"}

BUDGET: ${formatINR(budgetTotal)} allocated, ${formatINR(budgetSpent)} spent, ${formatINR(budgetTotal - budgetSpent)} remaining
DOCUMENTS: ${summary.documents.length} uploaded
MESSAGES: ${summary.messages.length} on record

TEAM MEMBERS (${members.length}) — use these exact user IDs when assigning tasks:
${members.length > 0
  ? members.map((m) => `- ${m.name} [user_id: ${m.userId}]${m.role ? ` (${m.role})` : ""}`).join("\n")
  : "None yet"}

You have seven actions available:
- **create_task**: Adds a task to the wedding workspace. Before calling it, tell the user what you are creating. Resolve team member names to user IDs from the TEAM MEMBERS list.
- **update_task**: Edits an existing task. Match the task by name from the TASKS list and use its id. Only send fields the user wants to change.
- **create_event**: Adds an event or ceremony to the timeline. Confirm the title and date — if no date was given, ask for it first. Use the wedding's cultures for culture_label when relevant.
- **update_event**: Edits an existing event. Match by name from the EVENTS/CEREMONIES list and use its id. Only send fields the user wants to change.
- **add_vendor**: Saves a vendor to the wedding directory. **Before saving, always ensure you have at least one contact detail (phone, email, or website). If contact details are missing, first call search_vendors_web to find them, then add the vendor.** Extract all details from the tool_result blocks in your history — don't ask the user to repeat them.
- **update_vendor**: Edits an existing vendor. Match by name from the VENDORS list and use its id. Only send fields the user wants to change.
- **search_vendors_web**: Searches the web for vendors or services. Tell the user what you are searching for before calling.

**Important — conversation continuity:** The full message history is available to you above, including the raw results of any previous searches. If the user asks a follow-up question about results already discussed (e.g. "find contact details for the top 2" after you listed dhol players), use the exact names and data from those prior tool results — do not run a new search from scratch. Only call search_vendors_web when genuinely new information is needed. When doing a targeted follow-up search, use the specific vendor name from the prior result in the query.

When asked about missing events or ceremonies, compare what's listed above against the typical ceremonies for a ${summary.wedding.cultures?.join(" and ") || "traditional"} wedding and identify gaps. Be specific about what's present and what's missing. Be helpful, warm, and concise. Use markdown for formatting when useful — but never use # headings; use **bold** for section titles instead.`;

  // Load full history from DB if we have a session; otherwise fall back to deep-chat messages
  let anthropicMessages: Anthropic.MessageParam[];
  if (sessionId) {
    anthropicMessages = await loadSessionMessages(supabase, sessionId);
  } else {
    anthropicMessages = messages.map((m) => ({
      role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: m.text,
    }));
  }

  // Track where prior history ends so we know what's new to save
  const priorLength = anthropicMessages.length;

  // Append the latest user message
  const userText = messages[messages.length - 1]?.text ?? "";
  anthropicMessages.push({
    role: "user",
    content: [{ type: "text", text: userText }],
  });

  try {
    let response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      tools: TOOLS,
      messages: anthropicMessages,
    });

    // Track which resource types were mutated so the client can invalidate queries
    const actionsPerformed = new Set<string>();

    // Agentic loop: execute tools until Claude reaches end_turn
    while (response.stop_reason === "tool_use") {
      const assistantContent = response.content;
      const toolUseBlocks = assistantContent.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const resultJson = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            supabase,
            summary.wedding.id,
            user.id,
          );
          // Extract action tag from tool result if present
          try {
            const parsed = JSON.parse(resultJson) as { action?: string; success?: boolean };
            if (parsed.success && parsed.action) actionsPerformed.add(parsed.action);
          } catch {
            // ignore parse errors
          }
          return { type: "tool_result" as const, tool_use_id: block.id, content: resultJson };
        }),
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

    // Push final assistant response so it gets persisted too
    anthropicMessages.push({ role: "assistant", content: response.content });

    // Persist all new turns (user message + any tool loops + final assistant) to DB
    if (sessionId) {
      await saveMessages(supabase, sessionId, anthropicMessages.slice(priorLength));
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    const text = textBlock?.text ?? "";
    return NextResponse.json({ text, actionsPerformed: [...actionsPerformed] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
