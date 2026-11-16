import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPaymentFields, pfEncode, sign, verifyItn } from "@/lib/payfast";

const PASSPHRASE = "test passphrase";
const md5 = (s: string) => createHash("md5").update(s).digest("hex");

/** Builds a notification body the way PayFast does: PHP urlencode, then a signature. */
function itnBody(fields: Record<string, string>, passphrase = PASSPHRASE): string {
  const query = Object.entries(fields)
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join("&");
  return `${query}&signature=${md5(`${query}&passphrase=${pfEncode(passphrase)}`)}`;
}

const goodItn = {
  m_payment_id: "0b8f7c9e-1c1e-4b7e-9d53-2f4a6c8e0a11",
  pf_payment_id: "1089250",
  payment_status: "COMPLETE",
  item_name: "Funding Ready: Prepare Your Business",
  amount_gross: "2499.00",
  amount_fee: "-57.48",
  amount_net: "2441.52",
  name_first: "Lebo",
  name_last: "",
  email_address: "lebo@example.test",
  merchant_id: "10000100",
};

const payfastSays = (text: string, ok = true) =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(text, { status: ok ? 200 : 500 })));

afterEach(() => vi.unstubAllGlobals());

describe("pfEncode", () => {
  it("matches PHP urlencode", () => {
    expect(pfEncode("a b")).toBe("a+b");
    expect(pfEncode("https://x.test/a?b=1&c=2")).toBe("https%3A%2F%2Fx.test%2Fa%3Fb%3D1%26c%3D2");
    expect(pfEncode("it's (50%) ~ok*!")).toBe("it%27s+%2850%25%29+%7Eok%2A%21");
    expect(pfEncode("Zoë")).toBe("Zo%C3%AB");
    expect(pfEncode("a-b_c.d")).toBe("a-b_c.d");
  });
});

describe("sign", () => {
  it("is the md5 of the query string plus passphrase", () => {
    expect(sign([["a", "1"], ["b", "x y"]], "secret")).toBe(md5("a=1&b=x+y&passphrase=secret"));
  });
  it("omits the passphrase when none is set", () => {
    expect(sign([["a", "1"]], "")).toBe(md5("a=1"));
  });
});

describe("buildPaymentFields", () => {
  const fields = buildPaymentFields({
    orderId: goodItn.m_payment_id,
    amountCents: 249900,
    itemName: "Funding Ready",
    buyerName: "Lebo Mokoena",
    buyerEmail: "lebo@example.test",
  });
  const map = new Map(fields);

  it("formats the amount in rand with two decimals", () => {
    expect(map.get("amount")).toBe("2499.00");
  });
  it("points PayFast at this site", () => {
    expect(map.get("notify_url")).toBe("https://example.test/api/payfast/itn");
    expect(map.get("return_url")).toContain(goodItn.m_payment_id);
  });
  it("puts the signature last and signs every other field in order", () => {
    expect(fields.at(-1)?.[0]).toBe("signature");
    expect(map.get("signature")).toBe(sign(fields.slice(0, -1), PASSPHRASE));
  });
  it("keeps PayFast's required field order", () => {
    expect(fields.map(([k]) => k)).toEqual([
      "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
      "name_first", "name_last", "email_address", "m_payment_id", "amount", "item_name", "signature",
    ]);
  });
  it("leaves out empty fields", () => {
    const single = buildPaymentFields({
      orderId: "x", amountCents: 100, itemName: "y", buyerName: "Cher", buyerEmail: "c@example.test",
    });
    expect(single.some(([k]) => k === "name_last")).toBe(false);
  });
});

describe("verifyItn", () => {
  it("accepts a genuine notification", async () => {
    payfastSays("VALID");
    const result = await verifyItn(itnBody(goodItn));
    expect(result).toEqual({
      ok: true,
      orderId: goodItn.m_payment_id,
      paymentId: "1089250",
      status: "COMPLETE",
      amountCents: 249900,
    });
  });

  it("rejects a tampered amount", async () => {
    payfastSays("VALID");
    const body = itnBody(goodItn).replace("amount_gross=2499.00", "amount_gross=1.00");
    expect(await verifyItn(body)).toEqual({ ok: false, reason: "bad signature" });
  });

  it("rejects a notification signed with the wrong passphrase", async () => {
    payfastSays("VALID");
    expect(await verifyItn(itnBody(goodItn, "guess"))).toEqual({ ok: false, reason: "bad signature" });
  });

  it("rejects a notification with no signature", async () => {
    payfastSays("VALID");
    const body = itnBody(goodItn).replace(/&signature=.*/, "");
    expect((await verifyItn(body)).ok).toBe(false);
  });

  it("rejects another merchant's notification", async () => {
    payfastSays("VALID");
    const result = await verifyItn(itnBody({ ...goodItn, merchant_id: "99999999" }));
    expect(result).toEqual({ ok: false, reason: "wrong merchant" });
  });

  it("rejects when PayFast does not confirm it sent the message", async () => {
    payfastSays("INVALID");
    expect(await verifyItn(itnBody(goodItn))).toEqual({ ok: false, reason: "not confirmed by PayFast" });
  });

  it("rejects when PayFast cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));
    expect((await verifyItn(itnBody(goodItn))).ok).toBe(false);
  });

  it("converts amounts to cents without rounding errors", async () => {
    payfastSays("VALID");
    const result = await verifyItn(itnBody({ ...goodItn, amount_gross: "1499.99" }));
    expect(result.ok && result.amountCents).toBe(149999);
  });
});
