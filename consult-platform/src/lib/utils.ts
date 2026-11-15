export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});
const zarCents = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
});

/** Formats cents as rand, dropping the cents when they are zero: "R 2 499". */
export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return cents % 100 === 0 ? zar.format(cents / 100) : zarCents.format(cents / 100);
}

export function formatMoney(cents: number): string {
  return cents % 100 === 0 ? zar.format(cents / 100) : zarCents.format(cents / 100);
}

const dateFmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Johannesburg",
});

export function formatDate(value: string | Date): string {
  // Date-only strings are parsed as UTC midnight; pin them to noon so the
  // displayed day never shifts.
  const d =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00Z`)
      : new Date(value);
  return dateFmt.format(d);
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFmt.format(new Date(value));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Only allow same-site relative paths as post-login redirect targets. */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}

/** Calendar date in South Africa as YYYY-MM-DD, optionally offset by whole days. */
export function dateInSouthAfrica(offsetDays = 0): string {
  const when = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(when);
}

const sessionFmt = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Johannesburg",
});

/** "Thursday, 21 January 2027 at 16:00 SAST" */
export function formatSessionTime(value: string | Date): string {
  return `${sessionFmt.format(new Date(value))} SAST`;
}
