import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type Params = { weddingSlug: string; itemId: string };

type ExpensePayload = {
  expenseId?: string;
  description?: string;
  amountRupees?: number;
  status?: "paid" | "pending";
};

async function getLookup(request: NextRequest, weddingSlug: string, itemId: string) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();
  if (!wedding) return { error: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };

  const { data: item } = await supabase
    .from("budget_items")
    .select("id")
    .eq("id", itemId)
    .eq("wedding_id", wedding.id)
    .maybeSingle();
  if (!item) return { error: NextResponse.json({ error: "Budget item not found." }, { status: 404 }) };

  return { supabase, weddingId: wedding.id, itemId: item.id };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  try {
    const { weddingSlug, itemId } = await context.params;
    const lookup = await getLookup(request, weddingSlug, itemId);
    if ("error" in lookup) return lookup.error;
    const { supabase } = lookup;

    const { data, error } = await supabase
      .from("budget_expenses")
      .select("id, description, amount_paise, status, created_at")
      .eq("budget_item_id", itemId)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ expenses: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Unable to fetch expenses." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  try {
    const { weddingSlug, itemId } = await context.params;
    const payload = (await request.json()) as ExpensePayload;
    const description = payload.description?.trim();
    if (!description) return NextResponse.json({ error: "Description is required." }, { status: 400 });

    const lookup = await getLookup(request, weddingSlug, itemId);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const amountPaise = Math.max(0, Math.round((payload.amountRupees ?? 0) * 100));
    const { error } = await supabase.from("budget_expenses").insert({
      budget_item_id: itemId,
      wedding_id: weddingId,
      description,
      amount_paise: amountPaise,
      status: payload.status ?? "pending",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add expense." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  try {
    const { weddingSlug, itemId } = await context.params;
    const payload = (await request.json()) as ExpensePayload;
    if (!payload.expenseId) return NextResponse.json({ error: "Expense id is required." }, { status: 400 });

    const lookup = await getLookup(request, weddingSlug, itemId);
    if ("error" in lookup) return lookup.error;
    const { supabase } = lookup;

    const updates: Database["public"]["Tables"]["budget_expenses"]["Update"] = {
      ...(typeof payload.description === "string" ? { description: payload.description.trim() } : {}),
      ...(typeof payload.amountRupees === "number" ? { amount_paise: Math.max(0, Math.round(payload.amountRupees * 100)) } : {}),
      ...(payload.status ? { status: payload.status } : {}),
    };
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No updates." }, { status: 400 });

    const { error } = await supabase
      .from("budget_expenses")
      .update(updates)
      .eq("id", payload.expenseId)
      .eq("budget_item_id", itemId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update expense." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  try {
    const { weddingSlug, itemId } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as ExpensePayload;
    if (!payload.expenseId) return NextResponse.json({ error: "Expense id is required." }, { status: 400 });

    const lookup = await getLookup(request, weddingSlug, itemId);
    if ("error" in lookup) return lookup.error;
    const { supabase } = lookup;

    const { error } = await supabase
      .from("budget_expenses")
      .delete()
      .eq("id", payload.expenseId)
      .eq("budget_item_id", itemId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete expense." }, { status: 500 });
  }
}
