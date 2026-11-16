import { slugify } from "@/lib/utils";
import type { Field, Resource } from "./resources";

type Row = Record<string, unknown>;
export type ParsedForm =
  | { ok: true; main: Row; companion: Row }
  | { ok: false; fieldErrors: Record<string, string> };

/** SAST has no daylight saving, so a fixed offset is correct all year. */
const SAST = "+02:00";

/** Turns a stored value into what the form control shows. */
export function toFormValue(field: Field, value: unknown, discountKind?: unknown): string {
  if (value === null || value === undefined) return "";
  switch (field.type) {
    case "money":
      return String(Number(value) / 100);
    case "list":
      return Array.isArray(value) ? value.join("\n") : "";
    case "metrics":
      return Array.isArray(value)
        ? value.map((m: { label?: string; value?: string }) => `${m.label ?? ""} | ${m.value ?? ""}`).join("\n")
        : "";
    case "datetime": {
      const d = new Date(String(value));
      if (Number.isNaN(d.getTime())) return "";
      // Shift to SAST, then read the wall-clock parts.
      return new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
    }
    case "number":
      // Rand discounts are stored in cents but edited in rand.
      if (field.name === "value" && discountKind === "amount") return String(Number(value) / 100);
      return String(value);
    default:
      return String(value);
  }
}

/** Validates a submitted form against the resource's fields and converts it for storage. */
export function parseResourceForm(resource: Resource, formData: FormData): ParsedForm {
  const main: Row = {};
  const companion: Row = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of resource.fields) {
    const raw = String(formData.get(field.name) ?? "").trim();
    const target = field.companion ? companion : main;
    const fail = (message: string) => {
      fieldErrors[field.name] = message;
    };
    if (field.required && raw === "" && field.type !== "boolean") {
      fail("This field is required");
      continue;
    }

    switch (field.type) {
      case "boolean":
        target[field.name] = formData.get(field.name) === "on";
        break;
      case "number":
      case "money": {
        if (raw === "") {
          target[field.name] = field.nullable ? null : 0;
          break;
        }
        const n = Number(raw.replace(/\s/g, "").replace(",", "."));
        if (!Number.isFinite(n) || n < 0) {
          fail("Enter a number, 0 or more");
          break;
        }
        const stored = field.type === "money" ? Math.round(n * 100) : Math.round(n);
        if (stored > 2_000_000_000) {
          fail("That number is too large");
          break;
        }
        target[field.name] = stored;
        break;
      }
      case "list":
        target[field.name] = raw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 40);
        break;
      case "metrics":
        target[field.name] = raw
          .split("\n")
          .map((line) => line.split("|").map((part) => part.trim()))
          .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
          .slice(0, 6)
          .map(([label, value]) => ({ label, value }));
        break;
      case "datetime": {
        if (raw === "") {
          target[field.name] = null;
          break;
        }
        const d = new Date(`${raw}${raw.length === 16 ? ":00" : ""}${SAST}`);
        if (Number.isNaN(d.getTime())) fail("Enter a valid date and time");
        else target[field.name] = d.toISOString();
        break;
      }
      case "url":
        if (raw === "") {
          target[field.name] = field.companion && field.name === "join_url" ? "" : null;
        } else if (!/^https:\/\/\S+$/i.test(raw) || raw.length > 2000) {
          fail("Enter a full link starting with https://");
        } else {
          target[field.name] = raw;
        }
        break;
      case "slug": {
        const source = raw || String(formData.get(resource.slugFrom ?? "") ?? "");
        const value = slugify(source).slice(0, 80);
        if (!value) fail("Enter a name using letters or numbers");
        else target[field.name] = value;
        break;
      }
      case "code": {
        const value = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (value.length < 3 || value.length > 32) fail("Use 3 to 32 letters and numbers");
        else target[field.name] = value;
        break;
      }
      case "select": {
        const allowed = (field.options ?? []).map((o) => o.value);
        if (!allowed.includes(raw)) fail("Choose one of the options");
        else target[field.name] = raw === "" && field.nullable ? null : raw;
        break;
      }
      default: {
        const max = field.max ?? 400;
        if (raw.length > max) fail(`Keep this under ${max} characters`);
        else target[field.name] = raw === "" && field.nullable ? null : raw;
      }
    }
  }

  // Discount rules that span two fields.
  if (resource.key === "discounts" && !fieldErrors.value) {
    const value = Number(main.value);
    if (main.kind === "percent" && (value < 1 || value > 100)) {
      fieldErrors.value = "A percentage must be between 1 and 100";
    } else if (main.kind === "amount") {
      if (value < 1) fieldErrors.value = "Enter the rand amount to take off";
      else main.value = value * 100;
    }
  }
  if (resource.key === "live-sessions" && main.duration_minutes === 0) {
    fieldErrors.duration_minutes = "Enter the length in minutes";
  }
  if ((resource.key === "live-sessions" || resource.key === "discounts") && !fieldErrors.capacity) {
    for (const name of ["capacity", "max_uses"]) {
      if (main[name] === 0) main[name] = null;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, main, companion };
}
