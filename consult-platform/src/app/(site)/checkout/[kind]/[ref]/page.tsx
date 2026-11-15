import { Construction, Lock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { buttonClass } from "@/components/ui/button";
import { startCheckout } from "@/lib/actions/checkout";
import { requireUser } from "@/lib/auth";
import { getCheckoutItem, previewDiscount } from "@/lib/data/checkout";
import { getCourseAccess, isRegisteredForLiveSession } from "@/lib/data/member";
import { isSupabaseConfigured } from "@/lib/env";
import { isPayfastConfigured } from "@/lib/payfast";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

const ERRORS: Record<string, string> = {
  DISCOUNT_INVALID: "That discount code is not valid for this purchase.",
  SESSION_FULL: "Sorry, this session is now fully booked.",
  SESSION_ENDED: "This session has already taken place.",
  NOTHING_TO_PAY: "There is nothing left to pay on this booking.",
  ITEM_NOT_FOUND: "This item is no longer available.",
  UNAVAILABLE: "Online payment is not available yet. Please contact us to complete your purchase.",
  FAILED: "We could not start your payment. Please try again.",
};

export default function CheckoutPage({ params, searchParams }: PageProps<"/checkout/[kind]/[ref]">) {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 mb-8 text-4xl font-semibold">Review your order</h1>
        <Suspense fallback={<p className="text-muted">Loading your order…</p>}>
          <Checkout params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Checkout({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; ref: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ kind, ref }, query] = await Promise.all([params, searchParams]);
  if (!isSupabaseConfigured) redirect("/login");
  await requireUser(`/checkout/${kind}/${ref}`);
  const item = await getCheckoutItem(kind, ref);
  if (!item) notFound();

  if (item.kind === "course" && (await getCourseAccess(item.itemId)).enrolled) redirect(item.ownedHref);
  if (item.kind === "live_session" && (await isRegisteredForLiveSession(item.itemId))) {
    redirect(item.ownedHref);
  }

  const code = typeof query.code === "string" ? query.code.trim().slice(0, 32) : "";
  const error = typeof query.error === "string" ? ERRORS[query.error] : undefined;
  const discount = code ? await previewDiscount(code, item.kind, item.priceCents) : 0;
  const codeRejected = Boolean(code) && discount === null;
  const discountCents = discount ?? 0;
  const total = item.priceCents - discountCents;
  const canPay = total === 0 || isPayfastConfigured;

  return (
    <div className="space-y-6">
      {error && <FormMessage state={{ status: "error", message: error }} />}

      <section className="rounded-brand border border-line bg-bg p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-1 text-sm text-muted">{item.detail}</p>
        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Price</dt>
            <dd>{formatMoney(item.priceCents)}</dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount ({code.toUpperCase()})</dt>
              <dd>−{formatMoney(discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
            <dt>Total</dt>
            <dd className="font-heading">{formatMoney(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-right text-xs text-muted">VAT included where applicable</p>
      </section>

      <section className="rounded-brand border border-line bg-bg p-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
              Discount code
            </label>
            <input
              id="code"
              name="code"
              defaultValue={code}
              autoComplete="off"
              maxLength={32}
              aria-invalid={codeRejected}
              className="w-full rounded-brand border border-line bg-bg px-3.5 py-2.5 text-sm uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-danger"
            />
          </div>
          <button type="submit" className={buttonClass("outline")}>
            Apply
          </button>
        </form>
        {codeRejected && (
          <p className="mt-2 text-xs font-medium text-danger">
            That code is not valid for this purchase.
          </p>
        )}
      </section>

      {canPay ? (
        <form action={startCheckout} className="space-y-4">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="ref" value={ref} />
          <input type="hidden" name="code" value={codeRejected ? "" : code} />
          <SubmitButton pendingText="One moment…" className="w-full">
            <Lock className="h-4 w-4" aria-hidden />
            {total === 0 ? "Complete order" : `Pay ${formatMoney(total)} with PayFast`}
          </SubmitButton>
          {total > 0 && (
            <p className="flex items-start gap-2 text-xs text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              You will be taken to PayFast to pay securely by card, Instant EFT or another method.
              {" "}
              {brand.name} never sees or stores your card details.
            </p>
          )}
        </form>
      ) : (
        <section className="flex gap-4 rounded-brand border border-accent/60 bg-accent/10 p-6">
          <Construction className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal">
              Online payment is still under construction
            </h2>
            <p className="mt-1 text-sm text-muted">
              We are finishing the setup of card and EFT payments. To complete this purchase now,
              please{" "}
              <Link href="/contact" className="font-semibold text-primary underline underline-offset-2">
                contact us
              </Link>{" "}
              and we will arrange it with you directly.
            </p>
          </div>
        </section>
      )}

      <p className="text-sm">
        <Link href={item.backHref} className="text-muted underline-offset-4 hover:text-ink hover:underline">
          ← Back
        </Link>
      </p>
    </div>
  );
}
