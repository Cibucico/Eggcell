import "server-only";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { getCourseWithOutline, getLiveSession } from "@/lib/data/content";
import { createClient } from "@/lib/supabase/server";
import type { OrderKind } from "@/lib/types";
import { formatDate, formatSessionTime } from "@/lib/utils";

export const CHECKOUT_KINDS = { course: "course", live: "live_session", booking: "consultation" } as const;
export type CheckoutKind = keyof typeof CHECKOUT_KINDS;

export type CheckoutItem = {
  kind: OrderKind;
  itemId: string;
  title: string;
  detail: string;
  priceCents: number;
  /** Where to send the buyer if they already have this item, and after paying. */
  ownedHref: string;
  backHref: string;
};

/** Looks up what is being bought. Prices here are for display; the order is priced in the database. */
export async function getCheckoutItem(kind: string, ref: string): Promise<CheckoutItem | null> {
  if (kind === "course") {
    const course = await getCourseWithOutline(ref);
    if (!course) return null;
    return {
      kind: "course",
      itemId: course.id,
      title: course.title,
      detail: `Online course · ${course.duration_label}`,
      priceCents: course.price_cents,
      ownedHref: `/learn/${course.slug}`,
      backHref: `/training/${course.slug}`,
    };
  }
  if (kind === "live") {
    const session = await getLiveSession(ref);
    if (!session) return null;
    return {
      kind: "live_session",
      itemId: session.id,
      title: session.title,
      detail: `Live session · ${formatSessionTime(session.starts_at)}`,
      priceCents: session.price_cents,
      ownedHref: "/dashboard#live",
      backHref: `/live/${session.slug}`,
    };
  }
  if (kind === "booking") {
    if (!z.uuid().safeParse(ref).success) return null;
    const user = await getUser();
    if (!user) return null;
    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select("id, preferred_date, preferred_time, deposit_cents, deposit_paid_at, status, service:services(title)")
      .eq("id", ref)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data || data.deposit_cents === 0 || data.deposit_paid_at || data.status === "cancelled") return null;
    const service = data.service as unknown as { title: string } | null;
    return {
      kind: "consultation",
      itemId: data.id,
      title: `Consultation deposit${service ? `: ${service.title}` : ""}`,
      detail: `${formatDate(data.preferred_date)} at ${data.preferred_time}`,
      priceCents: data.deposit_cents,
      ownedHref: "/dashboard#bookings",
      backHref: "/dashboard#bookings",
    };
  }
  return null;
}

/** Previews a discount code. Returns null when the code is not valid for this item. */
export async function previewDiscount(
  code: string,
  kind: OrderKind,
  subtotalCents: number,
): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("quote_discount", {
    p_code: code,
    p_kind: kind,
    p_subtotal_cents: subtotalCents,
  });
  if (error || !data?.[0]) return null;
  return Number(data[0].discount_cents);
}

export type MyOrder = {
  id: string;
  kind: OrderKind;
  description: string;
  amount_cents: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  course: { slug: string } | null;
};

export async function getMyOrder(orderId: string): Promise<MyOrder | null> {
  if (!z.uuid().safeParse(orderId).success) return null;
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, kind, description, amount_cents, status, course:courses(slug)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as unknown as MyOrder | null) ?? null;
}
