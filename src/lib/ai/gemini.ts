import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type WeddingSummaryInput = {
  coupleName: string;
  weddingDate: string | null;
  tasks: { title: string; status: string; due_date: string | null }[];
  vendors: { name: string; category: string; status: string }[];
  budgetItems: { category: string; allocated_paise: number; spent_paise: number }[];
  documents: { title: string }[];
  messageCount: number;
};

export async function generateWeddingAiReport(summary: WeddingSummaryInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const budgetTotal = summary.budgetItems.reduce((sum, b) => sum + b.allocated_paise, 0);
  const budgetSpent = summary.budgetItems.reduce((sum, b) => sum + b.spent_paise, 0);
  const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  const tasksByStatus = summary.tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const vendorsByStatus = summary.vendors.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});

  const prompt = `You are a professional wedding coordinator assistant. Analyze this wedding planning data and produce a concise readiness report.

Wedding: ${summary.coupleName}
Date: ${summary.weddingDate ?? "Not set"}

TASKS (${summary.tasks.length} total):
${Object.entries(tasksByStatus).map(([s, n]) => `  - ${s}: ${n}`).join("\n") || "  None"}

VENDORS (${summary.vendors.length} total):
${Object.entries(vendorsByStatus).map(([s, n]) => `  - ${s}: ${n}`).join("\n") || "  None"}
${summary.vendors.length > 0 ? `Categories: ${[...new Set(summary.vendors.map((v) => v.category))].join(", ")}` : ""}

BUDGET:
  Allocated: ${formatINR(budgetTotal)}
  Spent: ${formatINR(budgetSpent)}
  Remaining: ${formatINR(budgetTotal - budgetSpent)}
  Items: ${summary.budgetItems.length}

DOCUMENTS: ${summary.documents.length} uploaded
MESSAGES: ${summary.messageCount} on record

Write a short report with these sections (use markdown ## headings):
## Readiness Overview
A 2-3 sentence overall assessment.

## What's On Track
Bullet points of positives.

## Action Items
Bullet points of the most important things to address, ordered by urgency.

## Budget Snapshot
1-2 sentences on budget health.

Keep it practical, warm, and under 300 words.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
