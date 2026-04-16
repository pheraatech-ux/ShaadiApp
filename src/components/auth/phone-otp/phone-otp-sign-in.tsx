"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PhoneInput } from "@/components/ui/phone-input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

type PhoneOtpStep = "phone" | "otp"

type RequestOtpResponse = {
  challengeId: string
  maskedPhone: string
  message?: string
}

type VerifyOtpResponse = {
  error?: string
  message?: string
  actionLink?: string
}

type PhoneOtpSignInProps = {
  onBack: () => void
}

const labelClass =
  "text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground"

export function PhoneOtpSignIn({ onBack }: PhoneOtpSignInProps) {
  const [step, setStep] = useState<PhoneOtpStep>("phone")
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [maskedPhone, setMaskedPhone] = useState<string>("")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [lastAutoSubmittedCode, setLastAutoSubmittedCode] = useState<string | null>(
    null,
  )

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setError(null)
    setStatusMessage(null)

    try {
      const response = await fetch("/api/auth/phone-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const payload = (await response.json()) as { error?: string } & RequestOtpResponse
      if (!response.ok) {
        setError(payload.error ?? "Could not start OTP sign in.")
        return
      }

      setChallengeId(payload.challengeId)
      setMaskedPhone(payload.maskedPhone)
      setOtpCode("")
      setStep("otp")
      setStatusMessage(
        payload.message ??
          "OTP sent successfully.",
      )
    } catch {
      setError("Could not start OTP sign in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const runVerifyOtp = useCallback(
    async (code: string) => {
      if (!challengeId || code.length !== 6) return
      setIsVerifying(true)
      setError(null)
      setStatusMessage(null)

      try {
        const response = await fetch("/api/auth/phone-otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, phone, code }),
        })

        const payload = (await response.json()) as VerifyOtpResponse
        if (!response.ok) {
          setError(payload.error ?? payload.message ?? "Could not verify OTP.")
          return
        }

        if (payload.actionLink) {
          try {
            const actionUrl = new URL(payload.actionLink)
            const callbackUrl = new URL("/auth/callback", window.location.origin)
            callbackUrl.searchParams.set("next", "/app/dashboard")
            actionUrl.searchParams.set("redirect_to", callbackUrl.toString())
            window.location.assign(actionUrl.toString())
            return
          } catch {
            window.location.assign(payload.actionLink)
            return
          }
        }

        setStatusMessage(payload.message ?? "OTP verified successfully.")
      } catch {
        setError("Could not verify OTP. Please try again.")
      } finally {
        setIsVerifying(false)
      }
    },
    [challengeId, phone],
  )

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await runVerifyOtp(otpCode)
  }

  function handleOtpChange(nextCode: string) {
    setOtpCode(nextCode)
    if (nextCode.length < 6) {
      setLastAutoSubmittedCode(null)
    }
  }

  useEffect(() => {
    if (step !== "otp" || !challengeId || isVerifying) return
    if (otpCode.length !== 6) return
    if (otpCode === lastAutoSubmittedCode) return

    setLastAutoSubmittedCode(otpCode)
    void runVerifyOtp(otpCode)
  }, [
    challengeId,
    isVerifying,
    lastAutoSubmittedCode,
    otpCode,
    runVerifyOtp,
    step,
  ])

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={step === "phone" ? onBack : () => setStep("phone")}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {step === "phone" ? "Back to sign in" : "Change phone number"}
      </button>

      {step === "phone" ? (
        <form className="space-y-5" onSubmit={submitPhone}>
          <div className="space-y-2">
            <label className={labelClass}>Phone Number</label>
            <PhoneInput value={phone} onChangeNumber={setPhone} />
            <p className="text-sm text-muted-foreground">
              Only numbers already linked to an account can continue.
            </p>
          </div>

          <Button
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl text-[15px] font-bold"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Checking number...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={verifyOtp}>
          <div className="space-y-2">
            <label className={labelClass}>Enter OTP</label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={otpCode}
              onChange={handleOtpChange}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-muted-foreground">
              {maskedPhone
                ? `Use the 6-digit code sent to ${maskedPhone}.`
                : "Use the 6-digit code sent to your phone."}
            </p>
          </div>

          <Button
            disabled={isVerifying || otpCode.length !== 6}
            className="h-12 w-full rounded-xl text-[15px] font-bold"
            type="submit"
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>
      )}

      {statusMessage && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
