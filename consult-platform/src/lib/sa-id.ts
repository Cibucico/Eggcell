/**
 * South African ID numbers: YYMMDD SSSS C A Z
 *   YYMMDD  date of birth
 *   SSSS    0000-4999 female, 5000-9999 male
 *   C       0 citizen, 1 permanent resident
 *   A       usually 8 (older IDs 9)
 *   Z       Luhn check digit
 */
export type SaIdCheck =
  | { ok: true; female: boolean; birthDate: Date }
  | { ok: false; reason: "format" | "date" | "checksum" };

export function normaliseSaId(input: string): string {
  return input.replace(/[\s-]/g, "");
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function checkSaId(input: string, today = new Date()): SaIdCheck {
  const id = normaliseSaId(input);
  if (!/^\d{13}$/.test(id) || !["0", "1"].includes(id[10])) return { ok: false, reason: "format" };

  const yy = Number(id.slice(0, 2));
  const mm = Number(id.slice(2, 4));
  const dd = Number(id.slice(4, 6));
  // Two-digit years: a year later than this year belongs to the 1900s.
  const thisYear = today.getUTCFullYear() % 100;
  const year = yy > thisYear ? 1900 + yy : 2000 + yy;
  const birthDate = new Date(Date.UTC(year, mm - 1, dd));
  if (
    mm < 1 ||
    mm > 12 ||
    birthDate.getUTCMonth() !== mm - 1 ||
    birthDate.getUTCDate() !== dd ||
    birthDate > today
  ) {
    return { ok: false, reason: "date" };
  }
  if (!luhnValid(id)) return { ok: false, reason: "checksum" };
  return { ok: true, female: Number(id.slice(6, 10)) < 5000, birthDate };
}
