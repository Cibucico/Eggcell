"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CHECKOUT_KINDS, getCheckoutItem, type CheckoutKind } from "@/lib/data/checkout";
import { isSupabaseConfigured } from "@/lib/env";
import { isPayfastConfigured } from "@/lib/payfast";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_ERRORS = [
  "DISCOUNT_INVALID",
  "ALREADY_OWNED",
  "SESSION_FULL",
  "SESSION_ENDED",
  "NOTHING_TO_PAY",
  "ITEM_NOT_FOUND",
];

/**
 * Creates the order and sends the buyer on to pay. The price and any
 * discount are worked out in the database from the item itself; nothing the
 * browser sends can change the amount.
 */
export async function startCheckout(formData: FormData) {
  const kind = String(formData.get("kind") ?? "");
  const ref = String(formData.get("ref") ?? "");
  const code = String(formData.get("code") ?? "").trim().slice(0, 32);
  if (!(kind in CHECKOUT_KINDS) || !isSupabaseConfigured) redirect("/");
  const here = `/checkout/${kind}/${encodeURIComponent(ref)}`;
  const withCode = (params: string) =>
    `${here}?${params}${code ? `&code=${encodeURIComponent(code)}` : ""}`;

  const user = await requireUser(here);
  const item = await getCheckoutItem(kind, ref);
  if (!item) redirect(here);

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    redirect(withCode("error=UNAVAILABLE"));
  }
  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_user_id: user.id,
    p_kind: CHECKOUT_KINDS[kind as CheckoutKind],
    p_item_id: item.itemId,
    p_code: code || null,
  });
  if (error || !orderId) {
    const known = ORDER_ERRORS.find((e) => error?.message.includes(e));
    if (known === "ALREADY_OWNED") redirect(item.ownedHref);
    if (!known) console.error("[checkout] create_order failed", error?.message);
    redirect(withCode(`error=${known ?? "FAILED"}`));
  }

  const { data: order } = await supabase
    .from("orders")
    .select("amount_cents")
    .eq("id", orderId)
    .single();

  // Fully discounted: nothing to pay, so deliver straight away.
  if (order && order.amount_cents === 0) {
    const { error: completeError } = await supabase.rpc("complete_order", {
      p_order_id: orderId,
      p_provider_payment_id: "no-charge",
    });
    if (completeError) redirect(withCode("error=FAILED"));
    updateTag("live_sessions");
    redirect(`/checkout/complete?order=${orderId}`);
  }

  if (!isPayfastConfigured) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    redirect(withCode("error=UNAVAILABLE"));
  }
  redirect(`/checkout/pay/${orderId}`);
}
