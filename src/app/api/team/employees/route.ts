import { type NextRequest, NextResponse } from "next/server";

import { rotateCompanyEmployeeInvite } from "@/lib/company-employee-invites";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type CompanyEmployeeRole = Database["public"]["Enums"]["company_employee_role"];

type CreateEmployeePayload = {
  name?: string;
  phone?: string;
  email?: string;
  role?: CompanyEmployeeRole;
};

const VALID_ROLES = new Set<CompanyEmployeeRole>(["coordinator", "assistant", "viewer"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateEmployeePayload;
    const name = payload.name?.trim();
    const phone = payload.phone?.trim();
    const email = payload.email?.trim();
    const role = payload.role ?? "assistant";

    if (!phone) {
      return NextResponse.json({ error: "WhatsApp number is required." }, { status: 400 });
    }
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = createSupabaseRouteHandlerClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const nowIso = new Date().toISOString();
    const normalizedName = name || "Team member";
    const normalizedEmail = email || null;

    const { data: existingByPhone, error: existingByPhoneError } = await supabase
      .from("company_employees")
      .select("id")
      .eq("owner_user_id", user.id)
      .eq("phone", phone)
      .maybeSingle();
    if (existingByPhoneError) {
      throw existingByPhoneError;
    }

    let existingEmployeeId = existingByPhone?.id ?? null;
    if (!existingEmployeeId && normalizedEmail) {
      const { data: existingByEmail, error: existingByEmailError } = await supabase
        .from("company_employees")
        .select("id")
        .eq("owner_user_id", user.id)
        .ilike("email", normalizedEmail)
        .maybeSingle();
      if (existingByEmailError) {
        throw existingByEmailError;
      }
      existingEmployeeId = existingByEmail?.id ?? null;
    }

    let employeeId = existingEmployeeId;
    if (existingEmployeeId) {
      const { error: updateEmployeeError } = await supabase
        .from("company_employees")
        .update({
          name: normalizedName,
          phone,
          email: normalizedEmail,
          role,
          employment_status: "invited",
          invited_at: nowIso,
        })
        .eq("id", existingEmployeeId)
        .eq("owner_user_id", user.id);
      if (updateEmployeeError) {
        throw updateEmployeeError;
      }
    } else {
      const { data: insertedEmployee, error: insertEmployeeError } = await supabase
        .from("company_employees")
        .insert({
          owner_user_id: user.id,
          name: normalizedName,
          phone,
          email: normalizedEmail,
          role,
          employment_status: "invited",
          invited_at: nowIso,
        })
        .select("id")
        .single();
      if (insertEmployeeError) {
        throw insertEmployeeError;
      }
      employeeId = insertedEmployee.id;
    }

    if (!employeeId) {
      return NextResponse.json({ error: "Unable to issue invite." }, { status: 500 });
    }

    const { inviteUrl, expiresAt } = await rotateCompanyEmployeeInvite({
      supabase,
      employeeId,
      ownerUserId: user.id,
      deliveryChannel: "whatsapp",
      fallbackOrigin: request.nextUrl.origin,
    });

    return NextResponse.json(
      {
        ok: true,
        employeeId,
        inviteUrl,
        expiresAt,
        status: existingEmployeeId ? "reinvited" : "invited",
      },
      { status: existingEmployeeId ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to invite employee." }, { status: 500 });
  }
}
