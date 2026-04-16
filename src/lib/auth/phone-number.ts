const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/

export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const cleaned = trimmed.replace(/[^\d+]/g, "")
  const normalized = cleaned.startsWith("+") ? cleaned : `+${cleaned}`

  return E164_PHONE_REGEX.test(normalized) ? normalized : null
}

export function maskPhoneNumber(value: string) {
  if (value.length <= 4) return value

  const visiblePrefix = value.slice(0, 3)
  const visibleSuffix = value.slice(-2)

  return `${visiblePrefix}${"*".repeat(Math.max(0, value.length - 5))}${visibleSuffix}`
}
