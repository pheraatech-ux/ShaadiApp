import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { getWeddingSectionSummaryBySlug } from "@/lib/data/app-data";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

type DeepChatMessage = { role: string; text: string };

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WEB_SEARCH_TOOL: Anthropic.WebSearchTool20250305 = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 5,
};

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
        category: { type: "string", description: "Must be one of the fixed categories: Venue, Catering, Photography/Videography, Decor, Mehendi, Makeup/Hair, Music & DJ, Priest, Transportation, Clothing, Jewellery, Others. If none fits exactly, use 'Others'." },
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
        category: { type: "string", description: "New category (optional). Must be one of: Venue, Catering, Photography/Videography, Decor, Mehendi, Makeup/Hair, Music & DJ, Priest, Transportation, Clothing, Jewellery, Others." },
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
    name: "create_calendar_event",
    description:
      "Create a new personal calendar event — for bookings, tastings, meetings, site visits, client calls, or any appointment the user wants to add to their calendar. Resolve relative dates using TODAY. Include the vendor name in the title when relevant.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Clear event title, e.g. 'Catering tasting — Tandoori Nights'" },
        startAt: { type: "string", description: "ISO 8601 datetime, e.g. '2026-05-13T16:00:00'. Resolve relative dates using TODAY." },
        endAt: { type: "string", description: "ISO 8601 end datetime (optional). Default 1 hour after start." },
        allDay: { type: "boolean", description: "True only if no specific time given" },
        description: { type: "string", description: "Additional notes about the event" },
        color: {
          type: "string",
          description: "Hex color: #6366f1 meetings, #10b981 vendor tastings/trials, #3b82f6 client calls, #f59e0b deadlines, #ec4899 ceremonies",
        },
        location: {
          type: "string",
          description: "Physical location or address for the event if mentioned (e.g. 'Tandoori Nights kitchen', 'venue address')",
        },
        weddingId: {
          type: "string",
          description: "ID of the wedding this event relates to. Use CURRENT_WEDDING_ID from the system prompt when the user refers to this wedding. Omit only if the event is explicitly unrelated to any wedding.",
        },
        attendeeIds: {
          type: "array",
          items: { type: "string" },
          description: "Employee IDs to invite. Resolve names to IDs using the COMPANY EMPLOYEES list in the system prompt.",
        },
        guestEmails: {
          type: "array",
          items: { type: "string" },
          description: "External guest email addresses if the user mentions any.",
        },
      },
      required: ["title", "startAt", "allDay"],
    },
  },
  {
    name: "update_calendar_event",
    description:
      "Update an existing personal calendar event — reschedule, rename, add notes, change location or attendees. Use event IDs from PERSONAL CALENDAR EVENTS. Only include fields to change.",
    input_schema: {
      type: "object",
      properties: {
        eventId: { type: "string", description: "ID of the event to update — from PERSONAL CALENDAR EVENTS list" },
        title: { type: "string", description: "New title (optional)" },
        startAt: { type: "string", description: "New ISO 8601 start datetime (optional). Resolve 'move by X hours' using the event's current startAt." },
        endAt: { type: "string", description: "New ISO 8601 end datetime (optional)" },
        allDay: { type: "boolean", description: "New all-day flag (optional)" },
        description: { type: "string", description: "New description (optional)" },
        color: { type: "string", description: "New hex color (optional)" },
        location: { type: "string", description: "New location (optional)" },
        weddingId: {
          type: "string",
          description: "New wedding link — use CURRENT_WEDDING_ID from the system prompt (optional). Pass empty string to unlink.",
        },
        attendeeIds: {
          type: "array",
          items: { type: "string" },
          description: "Updated attendee employee IDs. Replaces existing list. Resolve names from COMPANY EMPLOYEES.",
        },
        guestEmails: {
          type: "array",
          items: { type: "string" },
          description: "Updated guest email list. Replaces existing list.",
        },
      },
      required: ["eventId"],
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
    return JSON.stringify({ success: true, action: "tasks", title: input.title });
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
    return JSON.stringify({ success: true, action: "tasks" });
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

  if (toolName === "create_calendar_event") {
    const input = toolInput as {
      title: string;
      startAt: string;
      endAt?: string;
      allDay: boolean;
      description?: string;
      color?: string;
      location?: string;
      weddingId?: string;
      attendeeIds?: string[];
      guestEmails?: string[];
    };

    const { error } = await supabase.from("calendar_events").insert({
      user_id: userId,
      title: input.title.trim(),
      start_at: input.startAt,
      end_at: input.endAt ?? null,
      all_day: input.allDay ?? false,
      description: input.description?.trim() || null,
      color: input.color ?? null,
      event_type: "personal",
      location: input.location?.trim() || null,
      wedding_id: input.weddingId || null,
      attendee_ids: input.attendeeIds ?? [],
      guest_emails: input.guestEmails ?? [],
    });

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, action: "calendar", title: input.title });
  }

  if (toolName === "update_calendar_event") {
    const input = toolInput as {
      eventId: string;
      title?: string;
      startAt?: string;
      endAt?: string;
      allDay?: boolean;
      description?: string;
      color?: string;
      location?: string;
      weddingId?: string;
      attendeeIds?: string[];
      guestEmails?: string[];
    };

    const updates: {
      title?: string;
      start_at?: string;
      end_at?: string | null;
      all_day?: boolean;
      description?: string | null;
      color?: string | null;
      location?: string | null;
      wedding_id?: string | null;
      attendee_ids?: string[];
      guest_emails?: string[];
      updated_at?: string;
    } = { updated_at: new Date().toISOString() };

    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.startAt !== undefined) updates.start_at = input.startAt;
    if (input.endAt !== undefined) updates.end_at = input.endAt ?? null;
    if (input.allDay !== undefined) updates.all_day = input.allDay;
    if (input.description !== undefined) updates.description = input.description?.trim() || null;
    if (input.color !== undefined) updates.color = input.color ?? null;
    if (input.location !== undefined) updates.location = input.location?.trim() || null;
    if (input.weddingId !== undefined) updates.wedding_id = input.weddingId || null;
    if (input.attendeeIds !== undefined) updates.attendee_ids = input.attendeeIds;
    if (input.guestEmails !== undefined) updates.guest_emails = input.guestEmails;

    const { error } = await supabase
      .from("calendar_events")
      .update(updates)
      .eq("id", input.eventId)
      .eq("user_id", userId);

    if (error) return JSON.stringify({ success: false, error: error.message });
    return JSON.stringify({ success: true, action: "calendar" });
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

  const [{ data: eventsData }, { data: memberRows }, { data: calendarRows }, { data: companyEmployeeRows }] = await Promise.all([
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
    supabase
      .from("calendar_events")
      .select("id, title, start_at, end_at, all_day")
      .eq("user_id", user.id)
      .order("start_at", { ascending: true })
      .limit(50),
    supabase
      .from("company_employees")
      .select("id, name, role")
      .eq("owner_user_id", user.id)
      .order("name", { ascending: true }),
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
CURRENT_WEDDING_ID: ${summary.wedding.id} — use this as the weddingId when creating/updating calendar events that relate to this wedding.

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

PERSONAL CALENDAR EVENTS (${(calendarRows ?? []).length}) — use these IDs for update_calendar_event:
${(calendarRows ?? []).length > 0
  ? (calendarRows ?? []).map((e) => `- [id:${e.id}] "${e.title}" | ${e.start_at}${e.end_at ? ` → ${e.end_at}` : ""}${e.all_day ? " (all-day)" : ""}`).join("\n")
  : "None yet"}

COMPANY EMPLOYEES (${(companyEmployeeRows ?? []).length}) — resolve names to IDs for attendeeIds:
${(companyEmployeeRows ?? []).length > 0
  ? (companyEmployeeRows ?? []).map((e) => `- [id:${e.id}] ${e.name} (${e.role})`).join("\n")
  : "None yet"}

BUDGET: ${formatINR(budgetTotal)} allocated, ${formatINR(budgetSpent)} spent, ${formatINR(budgetTotal - budgetSpent)} remaining
DOCUMENTS: ${summary.documents.length} uploaded
MESSAGES: ${summary.messages.length} on record

TEAM MEMBERS (${members.length}) — use these exact user IDs when assigning tasks:
${members.length > 0
  ? members.map((m) => `- ${m.name} [user_id: ${m.userId}]${m.role ? ` (${m.role})` : ""}`).join("\n")
  : "None yet"}

You have nine actions available:
- **create_task**: Adds a task to the wedding workspace. Before calling it, tell the user what you are creating. Resolve team member names to user IDs from the TEAM MEMBERS list.
- **update_task**: Edits an existing task. Match the task by name from the TASKS list and use its id. Only send fields the user wants to change.
- **create_event**: Adds an event or ceremony to the timeline. Confirm the title and date — if no date was given, ask for it first. Use the wedding's cultures for culture_label when relevant.
- **update_event**: Edits an existing event. Match by name from the EVENTS/CEREMONIES list and use its id. Only send fields the user wants to change.
- **add_vendor**: Saves a vendor to the wedding directory. **Before saving, always ensure you have at least one contact detail (phone, email, or website). If contact details are missing, first use web_search to find them, then add the vendor.** Extract all details from prior search results in your history — don't ask the user to repeat them.
- **update_vendor**: Edits an existing vendor. Match by name from the VENDORS list and use its id. Only send fields the user wants to change.
- **create_calendar_event**: Adds a personal calendar event — tastings, client meetings, site visits, bookings. Resolve relative dates using TODAY. Include vendor name in title when relevant.
- **update_calendar_event**: Reschedules or edits a personal calendar event. Match by name from PERSONAL CALENDAR EVENTS and use its id. For "move by X hours", add X hours to the current startAt.
- **web_search**: Searches the web for real-time information — vendor contacts, prices, services, availability, reviews. Tell the user what you are searching for before calling. Use specific queries including category, city, and budget when relevant.

**Important — conversation continuity:** The full message history is available to you above, including the raw results of any previous searches. If the user asks a follow-up question about results already discussed (e.g. "find contact details for the top 2" after you listed dhol players), use the exact names and data from those prior search results — do not run a new search from scratch. Only call web_search when genuinely new information is needed.

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

  const allTools = [...TOOLS, WEB_SEARCH_TOOL];
  const encoder = new TextEncoder();

  const sseStream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      const actionsPerformed = new Set<string>();
      let currentMessages = [...anthropicMessages];
      // Set to true after the first custom tool fires. Used to decide whether
      // to stream text live (bubble 1) or buffer it for bubble 2.
      let hasCalledTool = false;

      try {
        // Agentic loop with streaming. Each iteration opens one Anthropic stream.
        // - pause_turn: web_search server tool ran mid-turn; append and loop again.
        // - tool_use:   our custom tools; execute them, append results, loop again.
        // - end_turn:   done — save to DB, send final metadata event, close stream.
        while (true) {
          const stream = anthropic.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt,
            tools: allTools,
            messages: currentMessages,
          });

          // Stream text live before the first tool call (bubble 1).
          // After a tool has been called, buffer silently — the final text will
          // be sent as a complete "final_text" event for bubble 2.
          const textBuffer: string[] = [];
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              textBuffer.push(event.delta.text);
              if (!hasCalledTool) {
                send({ text: event.delta.text });
              }
            }
          }

          const finalMsg = await stream.finalMessage();
          const assistantContent = finalMsg.content;

          if (finalMsg.stop_reason === "pause_turn") {
            currentMessages = [...currentMessages, { role: "assistant", content: assistantContent }];
            continue;
          }

          if (finalMsg.stop_reason === "tool_use") {
            if (!hasCalledTool) {
              // Pre-tool text has been streaming live into bubble 1.
              // Signal the client to close bubble 1 now before the tool runs.
              send({ tool_call: true });
              hasCalledTool = true;
            }

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
                try {
                  const parsed = JSON.parse(resultJson) as { action?: string; success?: boolean };
                  if (parsed.success && parsed.action) actionsPerformed.add(parsed.action);
                } catch {}
                return { type: "tool_result" as const, tool_use_id: block.id, content: resultJson };
              }),
            );
            currentMessages = [
              ...currentMessages,
              { role: "assistant", content: assistantContent },
              { role: "user", content: toolResults },
            ];
            continue;
          }

          // end_turn — if a tool was called, send the final text as a complete
          // event so the client renders it as a second bubble via addMessage.
          // Otherwise the text was already streamed live into bubble 1.
          if (hasCalledTool) {
            send({ final_text: textBuffer.join("") });
          }

          // end_turn (or max_tokens / stop_sequence)
          currentMessages = [...currentMessages, { role: "assistant", content: assistantContent }];

          if (sessionId) {
            await saveMessages(supabase, sessionId, currentMessages.slice(priorLength));
            if (priorLength === 0 && userText) {
              supabase
                .from("ai_chat_sessions")
                .update({ title: userText.slice(0, 60).trim() })
                .eq("id", sessionId)
                .is("title", null)
                .then(() => {});
            }
          }

          // Final event carries metadata (no visible text); client uses it to
          // trigger query invalidation and session-list refresh.
          send({ actionsPerformed: [...actionsPerformed] });
          break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI request failed.";
        send({ error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
