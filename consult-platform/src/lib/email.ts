import "server-only";
import { brand } from "@/config/brand";

type Email = { to: string; subject: string; text: string; replyTo?: string };

/**
 * Sends a transactional email through Resend. If RESEND_API_KEY or EMAIL_FROM
 * is not set the email is skipped (and logged), so the site keeps working
 * before email is configured. Never throws: a failed notification must not
 * fail the visitor's form submission, which is already saved.
 */
export async function sendEmail({ to, subject, text, replyTo }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] Not configured; skipped "${subject}"`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status} for "${subject}"`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Failed to send "${subject}"`, err);
    return false;
  }
}

/** Notifies the consultancy's own inbox about a new lead. */
export function notifyTeam(subject: string, lines: (string | null | undefined)[], replyTo?: string) {
  const to = process.env.NOTIFY_EMAIL ?? brand.contact.email;
  return sendEmail({
    to,
    subject: `[${brand.name}] ${subject}`,
    text: lines.filter(Boolean).join("\n"),
    replyTo,
  });
}
