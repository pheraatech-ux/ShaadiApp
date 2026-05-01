import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ForecastRequestBody = {
  revenueByCategory: Record<string, number>;
  totalRevenue: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  overdueReceivables: number;
  activeWeddings: number;
  period: string;
  userMessage?: string;
};

export async function POST(req: NextRequest) {
  const supabase = createSupabaseRouteHandlerClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as ForecastRequestBody;

  const {
    revenueByCategory,
    totalRevenue,
    totalExpenses,
    expensesByCategory,
    overdueReceivables,
    activeWeddings,
    period,
    userMessage,
  } = body;

  const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const grossMargin = totalRevenue > 0
    ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)
    : "0.0";

  const revenueBreakdown = Object.entries(revenueByCategory)
    .map(([cat, amt]) => `  - ${cat}: ${INR(amt)}`)
    .join("\n");

  const expenseBreakdown = Object.entries(expensesByCategory)
    .map(([cat, amt]) => `  - ${cat}: ${INR(amt)}`)
    .join("\n");

  const systemPrompt = `You are a senior financial advisor specializing in the Indian wedding planning industry. You provide concise, actionable financial forecasts and insights for wedding planning businesses.

When asked to forecast or analyze, be specific — cite the numbers provided, identify risks, and suggest concrete actions. Keep responses to 3-5 paragraphs or use structured bullet points. Use ₹ notation for Indian Rupees. Do not pad responses with generic disclaimers.`;

  const financialContext = `Here is the current financial snapshot of this wedding planning business (${period}):

**Revenue: ${INR(totalRevenue)}**
${revenueBreakdown || "  - No revenue entries yet"}

**Operations Expenses: ${INR(totalExpenses)}**
${expenseBreakdown || "  - No expense entries yet"}

**Gross Margin: ${grossMargin}%**
**Overdue Receivables: ${INR(overdueReceivables)}**
**Active Weddings: ${activeWeddings}**`;

  const userPromptText = userMessage?.trim()
    ? `${financialContext}\n\n${userMessage}`
    : `${financialContext}\n\nPlease provide a financial forecast and actionable recommendations for this business. Include: revenue growth opportunities, expense optimization areas, cash flow risks (especially from overdue receivables), and realistic projections for the next quarter based on current trends.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPromptText }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return NextResponse.json({ forecast: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
