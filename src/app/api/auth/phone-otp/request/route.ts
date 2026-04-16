import { NextResponse } from "next/server"

import { maskPhoneNumber, normalizePhoneNumber } from "@/lib/auth/phone-number"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  isTwilioVerifyError,
  sendSmsVerification,
} from "@/lib/twilio/verify"

type RequestPayload = {
  phone?: string
}

export async function POST(request: Request) {
  let payload: RequestPayload

  try {
    payload = (await request.json()) as RequestPayload
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
  }

  const normalizedPhone = normalizePhoneNumber(payload.phone ?? "")
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 },
    )
  }

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
    const verification = await sendSmsVerification(normalizedPhone)
    if (verification.status !== "pending") {
      return NextResponse.json(
        { error: "Could not start OTP verification." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      challengeId: verification.sid ?? crypto.randomUUID(),
      phone: normalizedPhone,
      maskedPhone: maskPhoneNumber(normalizedPhone),
      expiresInSeconds: 600,
      status: verification.status,
      message: "OTP sent successfully.",
    })
  } catch (error) {
    if (isTwilioVerifyError(error)) {
      return NextResponse.json(
        {
          error:
            error.status === 429
              ? "Too many attempts. Please wait and try again."
              : "Unable to send OTP right now. Please try again.",
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
