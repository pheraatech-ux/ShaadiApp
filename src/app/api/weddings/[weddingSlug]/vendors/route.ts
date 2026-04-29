import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type VendorStatus = Database["public"]["Enums"]["vendor_status"];

type CreateVendorPayload = {
  category?: string;
  name?: string;
  phone?: string;
  email?: string;
  instagramHandle?: string;
  websiteUrl?: string;
  address?: string;
  quotedPriceRupees?: string;
  advancePaidRupees?: string;
  notes?: string;
  isConfirmed?: boolean;
};

type UpdateVendorPayload = CreateVendorPayload & {
  vendorId?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getWeddingBySlug(request: NextRequest, weddingSlug: string) {
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

function safeRupeesToPaise(value: string | undefined) {
  if (!value?.trim()) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed * 100));
}

function normalizeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function resolveStatus(isConfirmed?: boolean): VendorStatus | undefined {
  if (isConfirmed === undefined) return undefined;
  return isConfirmed ? "confirmed" : "pending";
}

function validateEmail(email?: string) {
  const trimmed = email?.trim();
  if (!trimmed) return true;
  return EMAIL_PATTERN.test(trimmed);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const lookup = await getWeddingBySlug(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const { data, error } = await supabase
      .from("vendors")
      .select("id, name, category, phone, email, instagram_handle, website_url, address, quoted_price_paise, advance_paid_paise, status, notes, invite_status, invited_at, created_at, user_id")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const vendors = (data ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      phone: v.phone ?? null,
      email: v.email ?? null,
      instagramHandle: v.instagram_handle ?? null,
      websiteUrl: v.website_url ?? null,
      address: v.address ?? null,
      quotedPricePaise: v.quoted_price_paise ?? 0,
      advancePaidPaise: v.advance_paid_paise ?? 0,
      status: v.status,
      notes: v.notes ?? null,
      inviteStatus: (v.invite_status === "active" ? "active" : v.invite_status === "invited" ? "invited" : "not_invited") as "not_invited" | "invited" | "active",
      inviteSentAt: v.invited_at ?? null,
      createdAt: v.created_at,
      userId: v.user_id ?? null,
    }));

    return NextResponse.json({ vendors });
  } catch {
    return NextResponse.json({ error: "Unable to fetch vendors." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as CreateVendorPayload;
    const name = payload.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Vendor name is required." }, { status: 400 });
    }
    if (!validateEmail(payload.email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const lookup = await getWeddingBySlug(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const { error } = await supabase.from("vendors").insert({
      wedding_id: weddingId,
      name,
      category: payload.category?.trim() || "Other",
      phone: normalizeText(payload.phone),
      email: normalizeText(payload.email),
      instagram_handle: normalizeText(payload.instagramHandle),
      website_url: normalizeText(payload.websiteUrl),
      address: normalizeText(payload.address),
      quoted_price_paise: safeRupeesToPaise(payload.quotedPriceRupees),
      advance_paid_paise: safeRupeesToPaise(payload.advancePaidRupees),
      notes: normalizeText(payload.notes),
      status: resolveStatus(payload.isConfirmed) ?? "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Unable to create vendor." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create vendor." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const { vendorId } = (await request.json()) as { vendorId?: string };
    if (!vendorId) {
      return NextResponse.json({ error: "Vendor id is required." }, { status: 400 });
    }

    const lookup = await getWeddingBySlug(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const { error } = await supabase
      .from("vendors")
      .delete()
      .eq("id", vendorId)
      .eq("wedding_id", weddingId);

    if (error) {
      return NextResponse.json({ error: error.message || "Unable to delete vendor." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to delete vendor." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json()) as UpdateVendorPayload;
    if (!payload.vendorId) {
      return NextResponse.json({ error: "Vendor id is required." }, { status: 400 });
    }
    if (payload.email !== undefined && !validateEmail(payload.email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const lookup = await getWeddingBySlug(request, weddingSlug);
    if ("error" in lookup) return lookup.error;
    const { supabase, weddingId } = lookup;

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("id", payload.vendorId)
      .eq("wedding_id", weddingId)
      .maybeSingle();
    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
    }

    const updates: Database["public"]["Tables"]["vendors"]["Update"] = {};
    if (payload.category !== undefined) updates.category = payload.category.trim() || "Other";
    if (payload.name !== undefined) updates.name = payload.name.trim() || "Vendor";
    if (payload.phone !== undefined) updates.phone = normalizeText(payload.phone);
    if (payload.email !== undefined) updates.email = normalizeText(payload.email);
    if (payload.instagramHandle !== undefined) updates.instagram_handle = normalizeText(payload.instagramHandle);
    if (payload.websiteUrl !== undefined) updates.website_url = normalizeText(payload.websiteUrl);
    if (payload.address !== undefined) updates.address = normalizeText(payload.address);
    if (payload.quotedPriceRupees !== undefined) updates.quoted_price_paise = safeRupeesToPaise(payload.quotedPriceRupees);
    if (payload.advancePaidRupees !== undefined) updates.advance_paid_paise = safeRupeesToPaise(payload.advancePaidRupees);
    if (payload.notes !== undefined) updates.notes = normalizeText(payload.notes);
    const statusUpdate = resolveStatus(payload.isConfirmed);
    if (statusUpdate) updates.status = statusUpdate;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }

    const { error } = await supabase.from("vendors").update(updates).eq("id", payload.vendorId);
    if (error) {
      return NextResponse.json({ error: error.message || "Unable to update vendor." }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to update vendor." }, { status: 500 });
  }
}
