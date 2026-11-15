import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AwaitingPayment } from "@/components/checkout/refresh";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMyOrder, type MyOrder } from "@/lib/data/checkout";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };

export default function CompletePage({ searchParams }: PageProps<"/checkout/complete">) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-brand border border-line bg-bg p-8 text-center">
        <Suspense fallback={<p className="text-muted">Checking your order…</p>}>
          <Status searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

function nextStep(order: MyOrder): { href: string; label: string } {
  if (order.kind === "course" && order.course) {
    return { href: `/learn/${order.course.slug}`, label: "Start learning" };
  }
  if (order.kind === "live_session") return { href: "/dashboard#live", label: "See my live sessions" };
  return { href: "/dashboard#bookings", label: "See my consultations" };
}

async function Status({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const orderId = typeof query.order === "string" ? query.order : "";
  await requireUser(`/checkout/complete?order=${orderId}`);
  const order = await getMyOrder(orderId);
  if (!order) notFound();

  if (order.status === "paid") {
    const step = nextStep(order);
    return (
      <>
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden />
        <h1 className="mt-4 text-3xl font-semibold">Thank you, your order is confirmed</h1>
        <p className="mt-3 text-muted">
          {order.description}
          {order.amount_cents > 0 && ` · ${formatMoney(order.amount_cents)} paid`}
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={step.href} size="lg" prefetch={false}>
            {step.label}
          </ButtonLink>
        </div>
      </>
    );
  }
  if (order.status === "pending") {
    return (
      <>
        <Clock className="mx-auto h-12 w-12 text-accent" aria-hidden />
        <h1 className="mt-4 text-3xl font-semibold">We are confirming your payment</h1>
        <p className="mt-3 text-muted">
          This usually takes a few seconds. Instant EFT payments can take a little longer.
        </p>
        <AwaitingPayment />
      </>
    );
  }
  return (
    <>
      <XCircle className="mx-auto h-12 w-12 text-danger" aria-hidden />
      <h1 className="mt-4 text-3xl font-semibold">This payment did not go through</h1>
      <p className="mt-3 text-muted">You have not been charged. You are welcome to try again.</p>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/dashboard" prefetch={false}>
          Back to my account
        </ButtonLink>
      </div>
    </>
  );
}
