import { describe, expect, it } from "vitest";
import { checkSaId } from "@/lib/sa-id";

/** Builds a valid ID by computing the Luhn check digit. */
function makeId(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    let d = Number(first12[11 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return first12 + String((10 - (sum % 10)) % 10);
}

const today = new Date("2026-11-26T00:00:00Z");

describe("checkSaId", () => {
  it("accepts a valid female ID", () => {
    const id = makeId("900101012308");
    expect(checkSaId(id, today)).toMatchObject({ ok: true, female: true });
  });
  it("recognises a male ID", () => {
    const id = makeId("900101512308");
    expect(checkSaId(id, today)).toMatchObject({ ok: true, female: false });
  });
  it("reads the century from the two-digit year", () => {
    const r1 = checkSaId(makeId("050615012308"), today);
    const r2 = checkSaId(makeId("750615012308"), today);
    expect(r1.ok && r1.birthDate.getUTCFullYear()).toBe(2005);
    expect(r2.ok && r2.birthDate.getUTCFullYear()).toBe(1975);
  });
  it("accepts spaces and dashes", () => {
    const id = makeId("900101012308");
    expect(checkSaId(`${id.slice(0, 6)} ${id.slice(6, 10)} ${id.slice(10)}`, today).ok).toBe(true);
  });
  it("rejects a wrong check digit", () => {
    const id = makeId("900101012308");
    const wrong = id.slice(0, 12) + String((Number(id[12]) + 1) % 10);
    expect(checkSaId(wrong, today)).toEqual({ ok: false, reason: "checksum" });
  });
  it("rejects impossible dates and future births", () => {
    expect(checkSaId(makeId("900231012308"), today)).toEqual({ ok: false, reason: "date" });
    expect(checkSaId(makeId("901301012308"), today)).toEqual({ ok: false, reason: "date" });
    expect(checkSaId(makeId("261231012308"), today)).toEqual({ ok: false, reason: "date" });
  });
  it("rejects the wrong length and citizenship digit", () => {
    expect(checkSaId("12345", today)).toEqual({ ok: false, reason: "format" });
    expect(checkSaId(makeId("900101012328"), today)).toEqual({ ok: false, reason: "format" });
  });
});
