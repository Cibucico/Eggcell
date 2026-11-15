import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PayfastRedirect } from "@/components/checkout/auto-submit";
import { requireProfile } from "@/lib/auth";
import { getMyOrder } from "@/lib/data/checkout";
import { buildPaymentFields, isPayfastConfigured, payfastProcessUrl, payfastSandbox } from "@/lib/payfast";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Redirecting to PayFast", robots: { index: false } };

export default function PayPage({ params }: PageProps<"/checkout/pay/[orderId]">) {
  return (
    <div className="container-page py-20 text-center">
      <Suspense fallback={<p className="text-muted">Preparing your payment…</p>}>
        <Pay params={params} />
      </Suspense>
    </div>
  );
}

async function Pay({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const profile = await requireProfile(`/checkout/pay/${orderId}`);
  const order = await getMyOrder(orderId);
  if (!order || !isPayfastConfigured) notFound();
  if (order.status === "paid") redirect(`/checkout/complete?order=${order.id}`);
  if (order.status !== "pending") redirect("/dashboard");

  const fields = buildPaymentFields({
    orderId: order.id,
    amountCents: order.amount_cents,
    itemName: order.description,
    buyerName: profile.full_name,
    buyerEmail: profile.email,
  });

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold">Taking you to PayFast</h1>
      <p className="mt-3 text-muted">
        {order.description} · {formatMoney(order.amount_cents)}
      </p>
      {payfastSandbox && (
        <p className="mt-3 text-sm font-medium text-danger">
          Test mode: this goes to the PayFast sandbox and no real money is taken.
        </p>
      )}
      <div className="mt-8 flex justify-center">
        <PayfastRedirect action={payfastProcessUrl} fields={fields} />
      </div>
      <p className="mt-4 text-xs text-muted">If nothing happens, press the button.</p>
    </div>
  );
}
