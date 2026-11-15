import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default function CancelledPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-brand border border-line bg-bg p-8 text-center">
        <h1 className="text-3xl font-semibold">Payment cancelled</h1>
        <p className="mt-3 text-muted">
          No money was taken. You can return and complete your purchase at any time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/training">Browse courses</ButtonLink>
          <ButtonLink href="/dashboard" variant="outline" prefetch={false}>
            My account
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
