import { NextRequest, NextResponse } from "next/server"

import { normalizePhoneNumber } from "@/lib/auth/phone-number"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  checkSmsVerification,
  isTwilioVerifyError,
} from "@/lib/twilio/verify"

type VerifyPayload = {
  challengeId?: string
  phone?: string
  code?: string
}

const OTP_CODE_REGEX = /^\d{6}$/

export async function POST(request: NextRequest) {
  let payload: VerifyPayload

  try {
    payload = (await request.json()) as VerifyPayload
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
  }

  if (!payload.challengeId) {
    return NextResponse.json({ error: "Missing challenge identifier." }, { status: 400 })
  }

  const normalizedPhone = normalizePhoneNumber(payload.phone ?? "")
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    )
  }

  if (!OTP_CODE_REGEX.test(payload.code ?? "")) {
    return NextResponse.json({ error: "Enter a valid 6-digit code." }, { status: 400 })
  }
  const otpCode = payload.code ?? ""

  let admin
  try {
    admin = getSupabaseAdminClient()
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Server is missing OTP configuration.",
      },
      { status: 503 },
    )
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", normalizedPhone)
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: "Could not validate this number right now." },
      { status: 500 },
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: "No account is linked to this phone number." },
      { status: 404 },
    )
  }

  try {
    const verification = await checkSmsVerification(normalizedPhone, otpCode)
    if (verification.status === "approved" && verification.valid) {
      const { data: authUserData, error: authUserError } =
        await admin.auth.admin.getUserById(data.id)

      if (authUserError || !authUserData.user?.email) {
        return NextResponse.json(
          {
            error:
              "OTP verified but we could not find the account email for session creation.",
          },
          { status: 500 },
        )
      }

      const { data: magicLinkData, error: magicLinkError } =
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email: authUserData.user.email,
          options: {
            redirectTo: `${request.nextUrl.origin}/auth/callback?next=/app/dashboard`,
          },
        })

      if (magicLinkError || !magicLinkData.properties.action_link) {
        return NextResponse.json(
          { error: "OTP verified but could not create a sign-in session." },
          { status: 500 },
        )
      }

      return NextResponse.json({
        status: verification.status,
        message: "Phone verified. Completing sign in...",
        actionLink: magicLinkData.properties.action_link,
      })
    }

    return NextResponse.json(
      { error: "Invalid or expired OTP. Please try again." },
      { status: 401 },
    )
  } catch (error) {
    if (isTwilioVerifyError(error)) {
      return NextResponse.json(
        {
          error:
            error.status === 429
              ? "Too many attempts. Please wait and try again."
              : "Unable to verify OTP right now. Please try again.",
          twilioCode: error.code ?? null,
        },
        { status: error.status === 429 ? 429 : 502 },
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "OTP provider is not configured correctly.",
      },
      { status: 503 },
    )
  }

}
