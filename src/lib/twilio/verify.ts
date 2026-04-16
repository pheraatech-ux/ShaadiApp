const TWILIO_VERIFY_BASE_URL = "https://verify.twilio.com/v2"

type TwilioVerifyErrorPayload = {
  message?: string
  code?: number
}

class TwilioVerifyError extends Error {
  status: number
  code?: number

  constructor(message: string, status: number, code?: number) {
    super(message)
    this.name = "TwilioVerifyError"
    this.status = status
    this.code = code
  }
}

function getTwilioVerifyEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error(
      "Missing Twilio Verify env vars. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
    )
  }

  return { accountSid, authToken, verifyServiceSid }
}

function toBasicAuth(username: string, password: string) {
  return Buffer.from(`${username}:${password}`).toString("base64")
}

async function twilioVerifyPost(
  endpoint: string,
  body: URLSearchParams,
): Promise<Record<string, unknown>> {
  const { accountSid, authToken } = getTwilioVerifyEnv()
  const response = await fetch(`${TWILIO_VERIFY_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${toBasicAuth(accountSid, authToken)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  const json = (await response.json()) as Record<string, unknown> &
    TwilioVerifyErrorPayload

  if (!response.ok) {
    throw new TwilioVerifyError(
      json.message ?? "Twilio Verify request failed.",
      response.status,
      json.code,
    )
  }

  return json
}

export async function sendSmsVerification(to: string) {
  const { verifyServiceSid } = getTwilioVerifyEnv()
  const payload = await twilioVerifyPost(
    `/Services/${verifyServiceSid}/Verifications`,
    new URLSearchParams({
      To: to,
      Channel: "sms",
    }),
  )

  return {
    sid: typeof payload.sid === "string" ? payload.sid : null,
    status: typeof payload.status === "string" ? payload.status : null,
  }
}

export async function checkSmsVerification(to: string, code: string) {
  const { verifyServiceSid } = getTwilioVerifyEnv()
  const payload = await twilioVerifyPost(
    `/Services/${verifyServiceSid}/VerificationCheck`,
    new URLSearchParams({
      To: to,
      Code: code,
    }),
  )

  return {
    status: typeof payload.status === "string" ? payload.status : null,
    valid: payload.valid === true,
  }
}

export function isTwilioVerifyError(error: unknown): error is TwilioVerifyError {
  return error instanceof TwilioVerifyError
}
