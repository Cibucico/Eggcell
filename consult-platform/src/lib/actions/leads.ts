"use server";

import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { getUser } from "@/lib/auth";
import { notifyTeam, sendEmail } from "@/lib/email";
import { isSupabaseConfigured, PREVIEW_MESSAGE } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { dateInSouthAfrica, formatDate, formatMoney } from "@/lib/utils";
import {
  bookingSchema,
  enquirySchema,
  formObject,
  investorSchema,
  validationError,
} from "@/lib/validation";

const GENERIC_ERROR =
  "Something went wrong and your message was not sent. Please try again, or email us directly.";

/**
 * Hidden field that real visitors never fill in. Bots that do are told the
 * submission worked, and nothing is saved.
 */
function isBot(formData: FormData): boolean {
  return String(formData.get("website") ?? "") !== "";
}

export async function submitEnquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = enquirySchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const success: ActionState = {
    status: "success",
    message: "Thank you. Your enquiry has been received and we will reply within one business day.",
  };
  if (isBot(formData)) return success;
  if (!isSupabaseConfigured) return { status: "error", message: PREVIEW_MESSAGE };

  const { consent: _consent, ...values } = parsed.data;
  const user = await getUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .insert({ ...values, consent: true, user_id: user?.id ?? null });
  if (error) {
    console.error("[enquiry] insert failed", error.message);
    return { status: "error", message: GENERIC_ERROR };
  }

  await notifyTeam(
    `New enquiry from ${values.name}`,
    [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.phone && `Phone: ${values.phone}`,
      values.company && `Company: ${values.company}`,
      values.subject && `Subject: ${values.subject}`,
      "",
      values.message,
    ],
    values.email,
  );
  return success;
}

export async function submitBooking(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);

  if (parsed.data.preferred_date <= dateInSouthAfrica()) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { preferred_date: "Choose a date from tomorrow onwards" },
    };
  }
  if (!brand.bookingTimes.includes(parsed.data.preferred_time)) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { preferred_time: "Choose one of the listed times" },
    };
  }

  const success: ActionState = {
    status: "success",
    message:
      "Thank you. Your request has been received. We will confirm the time by email within one business day.",
  };
  if (isBot(formData)) return success;
  if (!isSupabaseConfigured) return { status: "error", message: PREVIEW_MESSAGE };

  const { consent: _consent, ...values } = parsed.data;
  const user = await getUser();
  const supabase = await createClient();

  // A service can require a deposit, which is paid from the visitor's account.
  let depositCents = 0;
  if (values.service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("booking_deposit_cents")
      .eq("id", values.service_id)
      .maybeSingle();
    depositCents = service?.booking_deposit_cents ?? 0;
  }
  if (depositCents > 0 && !user) {
    return {
      status: "error",
      message: `A deposit of ${formatMoney(depositCents)} secures this consultation. Please sign in or create a free account first, then request your time again.`,
    };
  }

  const bookingId = crypto.randomUUID();
  const { error } = await supabase
    .from("bookings")
    .insert({ ...values, id: bookingId, consent: true, user_id: user?.id ?? null });
  if (error) {
    console.error("[booking] insert failed", error.message);
    return { status: "error", message: GENERIC_ERROR };
  }

  const when = `${formatDate(values.preferred_date)} at ${values.preferred_time}`;
  await Promise.all([
    notifyTeam(
      `Consultation request from ${values.name}`,
      [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        values.phone && `Phone: ${values.phone}`,
        values.company && `Company: ${values.company}`,
        `Requested: ${when} (${values.mode === "online" ? "online" : "in person"})`,
        values.notes && `\n${values.notes}`,
      ],
      values.email,
    ),
    sendEmail({
      to: values.email,
      subject: `We received your consultation request | ${brand.name}`,
      text: `Hello ${values.name},\n\nThank you for requesting a consultation with ${brand.name}.\n\nRequested time: ${when}\n\nThis time is not confirmed yet. We will email you within one business day to confirm it or suggest an alternative.\n\n${brand.name}${brand.contact.phone ? `\n${brand.contact.phone}` : ""}`,
    }),
  ]);
  if (depositCents > 0) redirect(`/checkout/booking/${bookingId}`);
  return success;
}

export async function submitInvestorInterest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!brand.features.investors) return { status: "error", message: GENERIC_ERROR };
  const parsed = investorSchema.safeParse(formObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const success: ActionState = {
    status: "success",
    message: "Thank you for your interest. We will contact you personally.",
  };
  if (isBot(formData)) return success;
  if (!isSupabaseConfigured) return { status: "error", message: PREVIEW_MESSAGE };

  const { consent: _consent, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("investor_leads").insert({ ...values, consent: true });
  if (error) {
    console.error("[investor] insert failed", error.message);
    return { status: "error", message: GENERIC_ERROR };
  }

  await notifyTeam(
    `Investor interest from ${values.name}`,
    [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.phone && `Phone: ${values.phone}`,
      values.organisation && `Organisation: ${values.organisation}`,
      `Type: ${values.investor_type}`,
      values.ticket_range && `Indicative amount: ${values.ticket_range}`,
      values.message && `\n${values.message}`,
    ],
    values.email,
  );
  return success;
}
