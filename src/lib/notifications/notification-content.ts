type NotificationData = Record<string, unknown> | null | undefined;

const QUOTE_DATA_KEYS = ["commentBody", "messageBody", "reminderBody"] as const;

/** Raw quote text from Knock workflow trigger data. */
export function getNotificationQuoteText(data: NotificationData): string | null {
  if (!data) return null;

  for (const key of QUOTE_DATA_KEYS) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/** @[Name](id) → @Name for display. */
export function stripMentionMarkup(text: string): string {
  return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripParagraphMatchingText(html: string, text: string): string {
  if (!html || !text) return html;

  if (typeof document !== "undefined") {
    const container = document.createElement("div");
    container.innerHTML = html;

    const normalizedTarget = text.trim();
    container.querySelectorAll("p, div, blockquote").forEach((node) => {
      if (node.textContent?.trim() === normalizedTarget) {
        node.remove();
      }
    });

    const cleaned = container.innerHTML.trim();
    return cleaned || html;
  }

  const escaped = escapeRegExp(text.trim());
  return html
    .replace(new RegExp(`<p[^>]*>\\s*${escaped}\\s*</p>`, "gi"), "")
    .replace(new RegExp(`<div[^>]*>\\s*${escaped}\\s*</div>`, "gi"), "")
    .trim();
}

/** Remove quoted content from Knock body HTML when we render it separately. */
export function getNotificationHeadlineHtml(
  bodyHtml: string | undefined,
  quoteRaw: string | null,
): string | undefined {
  if (!bodyHtml) return bodyHtml;
  if (!quoteRaw) return bodyHtml;

  const displayQuote = stripMentionMarkup(quoteRaw);
  let headline = stripParagraphMatchingText(bodyHtml, displayQuote);
  if (headline !== bodyHtml) return headline;

  headline = stripParagraphMatchingText(bodyHtml, quoteRaw);
  return headline || bodyHtml;
}
