import { z } from "zod";
import { verifyItn } from "@/lib/payfast";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PayFast payment notification (ITN). This is the only place an order is
 * marked paid. PayFast retries until it receives a 200, so genuine
 * notifications we cannot process yet answer with an error status, and
 * anything that fails verification is rejected.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const itn = await verifyItn(raw);
  if (!itn.ok) {
    console.warn("[payfast] notification rejected:", itn.reason);
    return new Response("rejected", { status: 400 });
  }
  if (!z.uuid().safeParse(itn.orderId).success) {
    return new Response("unknown order", { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, amount_cents, status")
    .eq("id", itn.orderId)
    .maybeSingle();
  if (error) return new Response("temporarily unavailable", { status: 503 });
  if (!order) return new Response("unknown order", { status: 400 });

  if (itn.status === "COMPLETE") {
    if (itn.amountCents !== order.amount_cents) {
      console.error(
        `[payfast] amount mismatch on order ${order.id}: paid ${itn.amountCents}, expected ${order.amount_cents}`,
      );
      return new Response("amount mismatch", { status: 400 });
    }
    const { error: completeError } = await supabase.rpc("complete_order", {
      p_order_id: order.id,
      p_provider_payment_id: itn.paymentId,
    });
    if (completeError) {
      console.error("[payfast] could not complete order", order.id, completeError.message);
      return new Response("temporarily unavailable", { status: 503 });
    }
  } else if ((itn.status === "FAILED" || itn.status === "CANCELLED") && order.status === "pending") {
    await supabase
      .from("orders")
      .update({ status: itn.status === "FAILED" ? "failed" : "cancelled" })
      .eq("id", order.id)
      .eq("status", "pending");
  }
  return new Response("ok", { status: 200 });
}
