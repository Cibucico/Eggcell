import { z } from "zod";
import type { ActionState } from "@/lib/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((v) => (v === "" ? null : v));

const name = z.string().trim().min(2, "Enter your full name").max(120);
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address"));
const phone = optionalText(40);
const consent = z.literal("on", "Tick the box to continue");
const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.uuid().nullable());

export const enquirySchema = z.object({
  name,
  email,
  phone,
  company: optionalText(160),
  subject: z.string().trim().max(200).default(""),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  service_id: optionalUuid,
  consent,
});

export const bookingSchema = z.object({
  name,
  email,
  phone,
  company: optionalText(160),
  service_id: optionalUuid,
  preferred_date: z.iso.date("Choose a date"),
  preferred_time: z.string().trim().min(1, "Choose a time").max(40),
  mode: z.enum(["online", "in_person"]),
  notes: optionalText(5000),
  consent,
});

export const investorSchema = z.object({
  name,
  email,
  phone,
  organisation: optionalText(160),
  investor_type: z.string().trim().min(1, "Choose an option").max(80),
  ticket_range: z.string().trim().max(80).default(""),
  message: optionalText(5000),
  consent,
});

export const registerSchema = z.object({
  full_name: name,
  email,
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(72, "Use 72 characters or fewer"),
  consent,
});

export const idNumberSchema = z.object({
  id_number: z.string().trim().min(1, "Enter your South African ID number").max(20),
});

export const genderSchema = z.object({
  gender: z.enum(["woman", "man", "other"], "Choose an option"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const profileSchema = z.object({
  full_name: name,
  phone,
  company: optionalText(160),
});

/** Converts a failed zod parse into the shape forms display. */
export function validationError(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
}

export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
