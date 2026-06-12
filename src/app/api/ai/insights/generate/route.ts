import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiInsight } from "@/components/app-dashboard/dashboard/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function paise_to_lakh_label(paise: number): string {
  const lakhs = paise / 10_000_000;
  if (lakhs >= 1) return `₹${lakhs.toFixed(1)}L`;
  const thousands = paise / 100_000;
  return `₹${thousands.toFixed(0)}K`;
}

function days_until(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function POST(_req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [
    { data: weddingRows },
    { data: taskRows },
    { data: vendorRows },
    { data: calendarRows },
    { data: weddingEventRows },
  ] = await Promise.all([
    supabase
      .from("weddings")
      .select("id, couple_name, wedding_date, city, venue_name, total_budget_paise, spent_budget_paise, status"),
    supabase
      .from("tasks")
      .select("id, status, due_date, wedding_id")
      .neq("status", "done"),
    supabase
      .from("vendors")
      .select("id, name, status, wedding_id, category"),
    supabase
      .from("calendar_events")
      .select("id, title, start_at, event_type, wedding_id")
      .gte("start_at", today)
      .lte("start_at", in14Days)
      .order("start_at"),
    supabase
      .from("wedding_events")
      .select("id, wedding_id, title, event_date")
      .gte("event_date", today)
      .lte("event_date", in14Days)
      .order("event_date"),
  ]);

  const weddingNameById = new Map(
    (weddingRows ?? []).map((w) => [w.id, w.couple_name])
  );

  const tasksByWedding = new Map<string, { overdue: number; total: number }>();
  for (const task of taskRows ?? []) {
    const entry = tasksByWedding.get(task.wedding_id) ?? { overdue: 0, total: 0 };
    entry.total += 1;
    if (task.due_date && task.due_date < today) entry.overdue += 1;
    tasksByWedding.set(task.wedding_id, entry);
  }

  const vendorsByWedding = new Map<string, { pending: number; total: number }>();
  for (const v of vendorRows ?? []) {
    const entry = vendorsByWedding.get(v.wedding_id) ?? { pending: 0, total: 0 };
    entry.total += 1;
    if (v.status !== "confirmed") entry.pending += 1;
    vendorsByWedding.set(v.wedding_id, entry);
  }

  const weddingsSnapshot = (weddingRows ?? [])
    .filter((w) => w.status !== "completed")
    .map((w) => {
      const tasks = tasksByWedding.get(w.id) ?? { overdue: 0, total: 0 };
      const vendors = vendorsByWedding.get(w.id) ?? { pending: 0, total: 0 };
      const daysUntilWedding = days_until(w.wedding_date);
      const budgetUsedPct =
        w.total_budget_paise > 0
          ? Math.round((w.spent_budget_paise / w.total_budget_paise) * 100)
          : 0;
      return {
        name: w.couple_name,
        city: w.city ?? "—",
        weddingDate: w.wedding_date ?? "TBD",
        daysUntil: daysUntilWedding,
        budget: paise_to_lakh_label(w.total_budget_paise),
        spent: paise_to_lakh_label(w.spent_budget_paise),
        budgetUsedPct,
        overBudget: w.spent_budget_paise > w.total_budget_paise,
        tasksOverdue: tasks.overdue,
        tasksTotal: tasks.total,
        vendorsPending: vendors.pending,
        vendorsTotal: vendors.total,
      };
    });

  const upcomingCalendarEvents = (calendarRows ?? []).map((e) => ({
    title: e.title,
    date: e.start_at.slice(0, 10),
    wedding: weddingNameById.get(e.wedding_id ?? "") ?? null,
  }));

  const upcomingWeddingEvents = (weddingEventRows ?? []).map((e) => ({
    title: e.title,
    date: e.event_date,
    wedding: weddingNameById.get(e.wedding_id) ?? null,
  }));

  const allUpcoming = [...upcomingCalendarEvents, ...upcomingWeddingEvents].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "")
  );

  const snapshot = {
    today,
    weddings: weddingsSnapshot,
    upcomingEventsNext14Days: allUpcoming,
    totals: {
      overdueTasksAcrossAll: weddingsSnapshot.reduce((s, w) => s + w.tasksOverdue, 0),
      vendorsPendingAcrossAll: weddingsSnapshot.reduce((s, w) => s + w.vendorsPending, 0),
    },
  };

  const systemPrompt = `You are Hitched AI, an intelligent assistant for wedding planners in India.
Analyse the planner's current portfolio snapshot and generate 3–5 sharp, actionable AI insights.

Rules:
- Be specific — mention couple names, dates, numbers, and rupee amounts where relevant
- Prioritise the most urgent or high-impact issues
- For navigation CTAs, set ctaHref to one of: /app/tasks, /app/vendors, /app/budget, /app/calendar
- If the portfolio has no active weddings, generate 1 insight encouraging the planner to add their first wedding. Use ctaAction "add-wedding" (omit ctaHref) and ctaLabel like "Add wedding"
- variant must be exactly one of: "risk", "budget", "vendor", "task"
- title: ≤ 9 words, punchy
- description: 1 short sentence, specific and actionable
- ctaLabel: 2–3 words

Respond ONLY with valid JSON in this exact shape:
{
  "insights": [
    {
      "id": "unique-kebab-id",
      "variant": "risk|budget|vendor|task",
      "title": "...",
      "description": "...",
      "ctaLabel": "...",
      "ctaHref": "/app/...",
      "ctaAction": "add-wedding"
    }
  ]
}`;

  const userPrompt = `Here is my current wedding portfolio snapshot:\n\n${JSON.stringify(snapshot, null, 2)}\n\nGenerate insights now.`;

  let rawContent = "";
  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    rawContent =
      message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    console.error("[ai-insights] Anthropic error", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }

  let insights: AiInsight[] = [];
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { insights?: unknown };
      if (Array.isArray(parsed.insights)) {
        insights = (parsed.insights as AiInsight[]).slice(0, 5).map((insight) => {
          const isAddWeddingCta =
            insight.ctaAction === "add-wedding" ||
            /add\s+(a\s+)?wedding|new\s+wedding|create\s+(a\s+)?wedding|first\s+wedding/i.test(insight.ctaLabel) ||
            (weddingsSnapshot.length === 0 &&
              /portfolio is empty|add (your )?first wedding|no weddings/i.test(
                `${insight.title} ${insight.description}`,
              ));

          if (!isAddWeddingCta) return insight;

          return {
            ...insight,
            ctaAction: "add-wedding" as const,
            ctaLabel: insight.ctaLabel || "Add wedding",
            ctaHref: undefined,
          };
        });
      }
    }
  } catch {
    console.error("[ai-insights] JSON parse error", rawContent);
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const { error: upsertError } = await supabase
    .from("ai_insights_cache")
    .upsert(
      { planner_id: user.id, insights, generated_at: new Date().toISOString() },
      { onConflict: "planner_id" }
    );

  if (upsertError) {
    console.error("[ai-insights] Upsert error", upsertError);
    return NextResponse.json({ error: "Failed to save insights" }, { status: 500 });
  }

  return NextResponse.json({
    insights,
    generatedAt: new Date().toISOString(),
  });
}
