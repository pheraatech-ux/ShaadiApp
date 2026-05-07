import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type CalendarEventContext = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
};

type VendorContext = {
  id: string;
  name: string;
  category: string;
  weddingName: string;
};

type RequestBody = {
  message: string;
  existingEvents: CalendarEventContext[];
  vendors: VendorContext[];
};

const CREATE_TOOL: Anthropic.Tool = {
  name: "create_calendar_event",
  description:
    "Create a new personal calendar event. Call this when the user wants to schedule, book, or add something to their calendar. Always resolve relative dates (next Tuesday, tomorrow, etc.) using TODAY from the system prompt.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Clear event title, e.g. 'Catering tasting — Tandoori Nights'" },
      startAt: {
        type: "string",
        description: "ISO 8601 datetime string, e.g. '2026-05-13T16:00:00'. Resolve relative dates using TODAY.",
      },
      endAt: {
        type: "string",
        description: "ISO 8601 end datetime (optional). Default to 1 hour after start if not specified.",
      },
      allDay: { type: "boolean", description: "True only if no specific time is given" },
      description: {
        type: "string",
        description: "Additional notes — include vendor name, location, any other details mentioned",
      },
      color: {
        type: "string",
        description: "Hex color. Use #6366f1 (violet) for meetings, #10b981 (emerald) for vendor tastings/trials, #3b82f6 (blue) for client calls, #f59e0b (amber) for deadlines, #ec4899 (pink) for ceremonies.",
      },
    },
    required: ["title", "startAt", "allDay"],
  },
};

const UPDATE_TOOL: Anthropic.Tool = {
  name: "update_calendar_event",
  description:
    "Update an existing personal calendar event. Use event IDs from the EXISTING EVENTS list. Only include fields that need to change — omit everything else. Use this for reschedules, time changes, renames, or adding notes.",
  input_schema: {
    type: "object",
    properties: {
      eventId: { type: "string", description: "ID of the event to update — from the EXISTING EVENTS list" },
      title: { type: "string", description: "New title (optional)" },
      startAt: {
        type: "string",
        description: "New ISO 8601 start datetime (optional). Resolve relative dates and 'move by X hours/days' using TODAY and the event's current startAt.",
      },
      endAt: { type: "string", description: "New ISO 8601 end datetime (optional)" },
      allDay: { type: "boolean", description: "New all-day flag (optional)" },
      description: { type: "string", description: "New description (optional)" },
      color: { type: "string", description: "New hex color (optional)" },
    },
    required: ["eventId"],
  },
};

function buildSystemPrompt(
  today: string,
  existingEvents: CalendarEventContext[],
  vendors: VendorContext[],
) {
  const eventsBlock =
    existingEvents.length > 0
      ? existingEvents
          .map((e) => `  - ID: ${e.id} | "${e.title}" | ${e.startAt}${e.endAt ? ` → ${e.endAt}` : ""}${e.allDay ? " (all-day)" : ""}`)
          .join("\n")
      : "  (no personal events yet)";

  const vendorsBlock =
    vendors.length > 0
      ? vendors.map((v) => `  - "${v.name}" (${v.category}, ${v.weddingName})`).join("\n")
      : "  (no vendors)";

  return `You are a smart calendar assistant for a wedding planner app. Parse the user's natural language message and call the appropriate tool.

TODAY: ${today}

EXISTING PERSONAL EVENTS:
${eventsBlock}

VENDORS (for name matching when user references a vendor):
${vendorsBlock}

RULES:
- Always resolve relative dates (next Tuesday, tomorrow, in 3 days) using TODAY.
- For "move by X hours", add X hours to the event's current startAt and endAt.
- For "move to [date/time]", set the new absolute datetime.
- Match events by name fuzzy search — pick the closest match from EXISTING EVENTS.
- Include the vendor name in the event title when the user mentions one (e.g. "Catering tasting — Tandoori Nights").
- If the user mentions a location, include it in the description.
- Default event duration is 1 hour unless specified.
- Call exactly one tool per message. Do not explain yourself — just call the tool.`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = (await request.json()) as RequestBody;
    const { message, existingEvents, vendors } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const systemPrompt = buildSystemPrompt(today, existingEvents, vendors);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools: [CREATE_TOOL, UPDATE_TOOL],
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: message }],
    });

    const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    if (!toolUse) {
      return NextResponse.json({ error: "Could not understand the request. Please try again." }, { status: 422 });
    }

    return NextResponse.json({
      action: toolUse.name === "create_calendar_event" ? "create" : "update",
      input: toolUse.input,
    });
  } catch {
    return NextResponse.json({ error: "AI processing failed. Please try again." }, { status: 500 });
  }
}
