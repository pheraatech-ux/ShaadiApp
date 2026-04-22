import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type BudgetPayload = {
  itemId?: string;
  category?: string;
  allocatedRupees?: number;
  spentRupees?: number;
  totalBudgetRupees?: number;
};

async function getWeddingLookup(request: NextRequest, weddingSlug: string) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();

  if (error || !wedding) {
    return { error: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };
  }

  return { supabase, weddingId: wedding.id };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as BudgetPayload;
    const category = payload.category?.trim();
    if (!category) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }

    const lookup = await getWeddingLookup(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const allocatedPaise = Math.max(0, Math.round((payload.allocatedRupees ?? 0) * 100));
    const spentPaise = Math.max(0, Math.round((payload.spentRupees ?? 0) * 100));

    const { error } = await supabase.from("budget_items").insert({
      wedding_id: weddingId,
      category,
      allocated_paise: allocatedPaise,
      spent_paise: spentPaise,
    });
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to create budget item." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create budget item." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as BudgetPayload;

    const lookup = await getWeddingLookup(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    if (typeof payload.totalBudgetRupees === "number") {
      const totalBudgetPaise = Math.max(0, Math.round(payload.totalBudgetRupees * 100));
      const { error } = await supabase
        .from("weddings")
        .update({ total_budget_paise: totalBudgetPaise })
        .eq("id", weddingId);
      if (error) {
        return NextResponse.json({ error: error.message || "Unable to update total budget." }, { status: 400 });
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!payload.itemId) {
      return NextResponse.json({ error: "Budget item id is required." }, { status: 400 });
    }

    const updates: Database["public"]["Tables"]["budget_items"]["Update"] = {};
    if (typeof payload.category === "string") updates.category = payload.category.trim();
    if (typeof payload.allocatedRupees === "number") {
      updates.allocated_paise = Math.max(0, Math.round(payload.allocatedRupees * 100));
    }
    if (typeof payload.spentRupees === "number") {
      updates.spent_paise = Math.max(0, Math.round(payload.spentRupees * 100));
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("id", payload.itemId)
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (existingError || !existing) {
      return NextResponse.json({ error: "Budget item not found." }, { status: 404 });
    }

    const { error } = await supabase.from("budget_items").update(updates).eq("id", payload.itemId);
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to update budget item." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update budget item." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as BudgetPayload;
    if (!payload.itemId) {
      return NextResponse.json({ error: "Budget item id is required." }, { status: 400 });
    }

    const lookup = await getWeddingLookup(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const { data: existing, error: existingError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("id", payload.itemId)
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (existingError || !existing) {
      return NextResponse.json({ error: "Budget item not found." }, { status: 404 });
    }

    const { error } = await supabase.from("budget_items").delete().eq("id", payload.itemId);
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to delete budget item." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete budget item." }, { status: 500 });
  }
}
