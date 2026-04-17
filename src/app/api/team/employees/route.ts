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

function duplicateEmployeeInviteMessage(insertError: { code?: string; message?: string } | null) {
  if (!insertError) {
    return null;
  }
  const isUniqueViolation =
    insertError.code === "23505" || /duplicate key|unique constraint/i.test(insertError.message ?? "");
  if (!isUniqueViolation) {
    return null;
  }
  const msg = insertError.message ?? "";
  if (msg.includes("idx_company_employees_owner_phone")) {
    return "A team member with this phone number already exists. Use “copy link” on their row to send a new invite, or use a different number.";
  }
  if (msg.includes("idx_company_employees_owner_email")) {
    return "A team member with this email already exists. Use “copy link” on their row to send a new invite, or use a different email.";
  }
  return "This phone or email is already used by a team member. Use “copy link” on their row to re-invite, or change the contact details.";
}

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
      const duplicateMessage = duplicateEmployeeInviteMessage(insertEmployeeError);
      if (duplicateMessage) {
        return NextResponse.json({ error: duplicateMessage }, { status: 409 });
      }
      throw insertEmployeeError;
    }

    const employeeId = insertedEmployee.id;
    if (!employeeId) {
      return NextResponse.json({ error: "Unable to issue invite." }, { status: 500 });
    }

    const { inviteUrl, expiresAt } = await rotateCompanyEmployeeInvite({
      supabase,
      employeeId,
      ownerUserId: user.id,
      deliveryChannel: "link",
      fallbackOrigin: request.nextUrl.origin,
      forceRotate: true,
    });

    return NextResponse.json(
      {
        ok: true,
        employeeId,
        inviteUrl,
        expiresAt,
        status: "invited",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to invite employee." }, { status: 500 });
  }
}
