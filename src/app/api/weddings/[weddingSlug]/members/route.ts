import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type CompanyRole = Database["public"]["Enums"]["company_employee_role"];
type WeddingRole = Database["public"]["Enums"]["wedding_member_role"];

type LinkWeddingMemberPayload = {
  employeeId?: string;
  phone?: string;
  email?: string;
  role?: CompanyRole;
};

const VALID_COMPANY_ROLES = new Set<CompanyRole>(["coordinator", "assistant", "viewer"]);

function normalizePhone(value?: string) {
  return (value ?? "").trim();
}

function normalizeEmail(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function mapCompanyRoleToWeddingRole(role: CompanyRole): WeddingRole {
  if (role === "coordinator") return "coordinator";
  return "viewer";
}

async function resolveAdminWeddingContext(request: NextRequest, weddingSlug: string) {
  const supabase = createSupabaseRouteHandlerClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("id")
    .eq("slug", weddingSlug)
    .maybeSingle();
  if (weddingError || !wedding) {
    return { error: NextResponse.json({ error: "Wedding not found." }, { status: 404 }) };
  }

  const { data: currentMembership, error: membershipError } = await supabase
    .from("wedding_members")
    .select("id")
    .eq("wedding_id", wedding.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", ["owner", "lead"])
    .maybeSingle();
  if (membershipError || !currentMembership) {
    return {
      error: NextResponse.json(
        { error: "Only wedding admins can add team members to this wedding." },
        { status: 403 },
      ),
    };
  }

  return { supabase, userId: user.id, weddingId: wedding.id };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const scoped = await resolveAdminWeddingContext(request, weddingSlug);
    if ("error" in scoped) return scoped.error;

    const admin = getSupabaseAdminClient();
    const { data: companyEmployees, error: employeeError } = await admin
      .from("company_employees")
      .select("id, user_id, name, phone, email, role, employment_status")
      .eq("owner_user_id", scoped.userId)
      .order("created_at", { ascending: false });
    if (employeeError) {
      return NextResponse.json(
        { error: employeeError.message || "Unable to load company members." },
        { status: 400 },
      );
    }

    const linkedUserIds = (companyEmployees ?? [])
      .map((employee) => employee.user_id)
      .filter(Boolean) as string[];
    const { data: weddingMemberRows } =
      linkedUserIds.length > 0
        ? await admin
            .from("wedding_members")
            .select("user_id")
            .eq("wedding_id", scoped.weddingId)
            .in("user_id", linkedUserIds)
            .eq("status", "active")
        : { data: [] as { user_id: string | null }[] };
    const assignedUserIdSet = new Set(
      (weddingMemberRows ?? []).map((row) => row.user_id).filter(Boolean) as string[],
    );

    const candidates = (companyEmployees ?? [])
      .filter((employee) => employee.user_id && employee.employment_status === "active")
      .map((employee) => ({
        id: employee.id,
        userId: employee.user_id,
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
        alreadyAssigned: assignedUserIdSet.has(employee.user_id as string),
      }));

    return NextResponse.json({ ok: true, candidates }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to load candidate members." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ weddingSlug: string }> },
) {
  try {
    const { weddingSlug } = await context.params;
    const payload = (await request.json().catch(() => ({}))) as LinkWeddingMemberPayload;
    const phone = normalizePhone(payload.phone);
    const email = normalizeEmail(payload.email);
    const employeeId = (payload.employeeId ?? "").trim();
    const requestedRole = payload.role;
    if (requestedRole && !VALID_COMPANY_ROLES.has(requestedRole)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (!employeeId && !phone && !email) {
      return NextResponse.json(
        { error: "Employee id, phone, or email is required to match an existing company member." },
        { status: 400 },
      );
    }

    const scoped = await resolveAdminWeddingContext(request, weddingSlug);
    if ("error" in scoped) return scoped.error;

    const admin = getSupabaseAdminClient();
    let employeeQuery = admin
      .from("company_employees")
      .select("id, user_id, owner_user_id, name, role, employment_status, phone, email")
      .eq("owner_user_id", scoped.userId)
      .limit(1);
    if (employeeId) {
      employeeQuery = employeeQuery.eq("id", employeeId);
    } else if (email) {
      employeeQuery = employeeQuery.eq("email", email);
    } else {
      employeeQuery = employeeQuery.eq("phone", phone);
    }

    const { data: employee, error: employeeError } = await employeeQuery.maybeSingle();
    if (employeeError || !employee) {
      return NextResponse.json(
        {
          error:
            "This person is not in your company team yet. Add them to company team first, then assign to wedding.",
        },
        { status: 400 },
      );
    }
    if (!employee.user_id || employee.employment_status !== "active") {
      return NextResponse.json(
        {
          error:
            "This team member has not completed invite signup yet. They can be assigned after becoming active.",
        },
        { status: 400 },
      );
    }

    // Explicit wedding role override from UI should win; fallback to employee company role.
    const resolvedRole: CompanyRole = requestedRole ?? employee.role ?? "assistant";
    const weddingRole = mapCompanyRoleToWeddingRole(resolvedRole);
    const { error: upsertError } = await admin.from("wedding_members").upsert(
      {
        wedding_id: scoped.weddingId,
        user_id: employee.user_id,
        display_name: employee.name,
        role: weddingRole,
        status: "active",
        invited_email: employee.email,
      },
      {
        onConflict: "wedding_id,user_id",
        ignoreDuplicates: false,
      },
    );

    if (upsertError) {
      return NextResponse.json(
        { error: upsertError.message || "Unable to assign member to wedding." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to add wedding member." }, { status: 500 });
  }
}
