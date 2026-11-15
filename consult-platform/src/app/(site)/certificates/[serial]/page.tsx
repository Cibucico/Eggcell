import { BadgeCheck, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { PrintButton } from "@/components/training/print-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Certificate", robots: { index: false } };

type Certificate = { serial: string; recipient_name: string; course_title: string; issued_at: string };

export default function CertificatePage({ params, searchParams }: PageProps<"/certificates/[serial]">) {
  return (
    <div className="container-page py-12">
      <Suspense fallback={<p className="text-center text-muted">Checking certificate…</p>}>
        <CertificateView params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CertificateView({
  params,
  searchParams,
}: {
  params: Promise<{ serial: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ serial }, query] = await Promise.all([params, searchParams]);
  let certificate: Certificate | null = null;
  if (isSupabaseConfigured && /^[A-Za-z0-9]{6,32}$/.test(serial)) {
    const { data } = await createPublicClient().rpc("verify_certificate", { p_serial: serial });
    certificate = (data as Certificate[] | null)?.[0] ?? null;
  }

  if (!certificate) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          title="No certificate found with that number"
          text="Check the number and try again. If you believe this is a mistake, please contact us."
          action={<ButtonLink href="/certificates">Try another number</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {query.new === "1" && (
        <div className="no-print mb-6 flex items-center gap-3 rounded-brand border border-success/30 bg-success/10 px-5 py-4 text-success">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden />
          <p className="font-medium">Congratulations, you have completed the course. Here is your certificate.</p>
        </div>
      )}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-success">
          <BadgeCheck className="h-5 w-5" aria-hidden />
          Verified: issued by {brand.name}
        </p>
        <PrintButton />
      </div>

      <article className="relative border-[10px] border-double border-primary bg-bg px-8 py-14 text-center sm:px-16 sm:py-20">
        <p className="font-heading text-xl font-semibold text-primary">{brand.name}</p>
        <p className="eyebrow mt-10">Certificate of completion</p>
        <p className="mt-8 text-muted">This certifies that</p>
        <p className="font-heading mt-3 text-4xl font-semibold sm:text-5xl">{certificate.recipient_name}</p>
        <p className="mt-8 text-muted">has successfully completed the online course</p>
        <p className="font-heading mt-3 text-2xl font-semibold text-primary sm:text-3xl">
          {certificate.course_title}
        </p>
        <div className="mx-auto mt-12 h-px w-24 bg-accent" aria-hidden />
        <dl className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Date issued</dt>
            <dd className="mt-1 font-semibold">{formatDate(certificate.issued_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Certificate number</dt>
            <dd className="mt-1 font-mono font-semibold">{certificate.serial}</dd>
          </div>
        </dl>
        <p className="mx-auto mt-10 max-w-md text-xs text-muted">
          This certificate confirms completion of a short course. It is not a qualification
          registered on the National Qualifications Framework.
        </p>
      </article>
    </div>
  );
}
