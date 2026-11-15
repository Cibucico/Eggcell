import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/config/brand";

/**
 * PayFast (payfast.io) redirect integration.
 *
 * Flow: we send the buyer to PayFast with a signed form; PayFast later calls
 * our notify URL (the "ITN") server to server, which is the only thing that
 * marks an order paid. The buyer's return to the site proves nothing.
 *
 * Not yet exercised against PayFast itself: it needs a merchant account (or
 * sandbox credentials) and a public notify URL. Test in the sandbox before
 * taking real payments.
 */

const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";
const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
const sandbox = process.env.PAYFAST_SANDBOX !== "false";

export const isPayfastConfigured = Boolean(merchantId && merchantKey);
export const payfastSandbox = sandbox;

const host = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
export const payfastProcessUrl = `https://${host}/eng/process`;
const payfastValidateUrl = `https://${host}/eng/query/validate`;

/** PHP-style urlencode, which is what PayFast signs: spaces become "+". */
export function pfEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
}

function md5(text: string): string {
  return createHash("md5").update(text).digest("hex");
}

export function sign(pairs: [string, string][], secret: string): string {
  let query = pairs.map(([k, v]) => `${k}=${pfEncode(v.trim())}`).join("&");
  if (secret) query += `&passphrase=${pfEncode(secret.trim())}`;
  return md5(query);
}

export type PaymentRequest = {
  orderId: string;
  amountCents: number;
  itemName: string;
  buyerName: string;
  buyerEmail: string;
};

/** Fields for the form posted to PayFast, in the order PayFast requires. */
export function buildPaymentFields(req: PaymentRequest): [string, string][] {
  const [first, ...rest] = req.buyerName.trim().split(/\s+/);
  const candidates: [string, string][] = [
    ["merchant_id", merchantId],
    ["merchant_key", merchantKey],
    ["return_url", `${siteUrl}/checkout/complete?order=${req.orderId}`],
    ["cancel_url", `${siteUrl}/checkout/cancelled?order=${req.orderId}`],
    ["notify_url", `${siteUrl}/api/payfast/itn`],
    ["name_first", (first ?? "").slice(0, 100)],
    ["name_last", rest.join(" ").slice(0, 100)],
    ["email_address", req.buyerEmail.slice(0, 100)],
    ["m_payment_id", req.orderId],
    ["amount", (req.amountCents / 100).toFixed(2)],
    ["item_name", req.itemName.slice(0, 100)],
  ];
  // Empty values are left out of both the form and the signature.
  const fields = candidates.filter(([, v]) => v.trim() !== "");
  return [...fields, ["signature", sign(fields, passphrase)]];
}

export type ItnResult =
  | { ok: true; orderId: string; paymentId: string; status: string; amountCents: number }
  | { ok: false; reason: string };

/**
 * Checks a notification really came from PayFast and was not altered:
 * 1. the signature matches our passphrase,
 * 2. the merchant is ours,
 * 3. PayFast itself confirms it sent this exact message.
 * The caller still has to compare the amount with the order.
 */
export async function verifyItn(rawBody: string): Promise<ItnResult> {
  if (!isPayfastConfigured) return { ok: false, reason: "not configured" };

  const pairs: [string, string][] = rawBody
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const i = part.indexOf("=");
      const key = i === -1 ? part : part.slice(0, i);
      const value = i === -1 ? "" : part.slice(i + 1);
      return [decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, " "))];
    });
  const data = new Map(pairs);
  const received = data.get("signature") ?? "";

  const signed: [string, string][] = [];
  for (const pair of pairs) {
    if (pair[0] === "signature") break;
    signed.push(pair);
  }
  const expected = sign(signed, passphrase);
  const a = Buffer.from(expected);
  const b = Buffer.from(received.toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad signature" };

  if (data.get("merchant_id") !== merchantId) return { ok: false, reason: "wrong merchant" };

  try {
    const paramString = signed.map(([k, v]) => `${k}=${pfEncode(v.trim())}`).join("&");
    const res = await fetch(payfastValidateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paramString,
      signal: AbortSignal.timeout(10_000),
    });
    const text = (await res.text()).trim();
    if (!res.ok || !text.startsWith("VALID")) return { ok: false, reason: "not confirmed by PayFast" };
  } catch {
    return { ok: false, reason: "could not reach PayFast to confirm" };
  }

  const amount = Number(data.get("amount_gross"));
  const orderId = data.get("m_payment_id") ?? "";
  if (!orderId || !Number.isFinite(amount)) return { ok: false, reason: "missing fields" };
  return {
    ok: true,
    orderId,
    paymentId: data.get("pf_payment_id") ?? "",
    status: data.get("payment_status") ?? "",
    amountCents: Math.round(amount * 100),
  };
}
