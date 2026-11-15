import { Check, Clock, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/icon";
import { PageHeader, Paragraphs, Section } from "@/components/ui/primitives";
import { getService, getServices, slugParams } from "@/lib/data/content";
import { formatMoney } from "@/lib/utils";

export async function generateStaticParams() {
  return slugParams(await getServices());
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return { title: service.title, description: service.summary };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = await getService((await params).slug);
  if (!service) notFound();

  return (
    <>
      <PageHeader eyebrow="Consulting service" title={service.title} intro={service.summary} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-brand bg-primary/10 text-primary">
              <ServiceIcon name={service.icon} className="h-6 w-6" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold">How we approach it</h2>
            <Paragraphs text={service.description} className="mt-4 text-lg leading-relaxed text-muted" />

            {service.deliverables.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl font-semibold">What you receive</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-brand border border-line bg-surface px-4 py-3.5 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="h-fit rounded-brand border border-line bg-bg p-6 lg:sticky lg:top-24">
            <dl className="space-y-5">
              <div className="flex gap-3">
                <Wallet className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Investment</dt>
                  <dd className="font-heading text-xl font-semibold">
                    {service.price_from_cents != null
                      ? `From ${formatMoney(service.price_from_cents)}`
                      : "Priced per project"}
                  </dd>
                  <dd className="text-xs text-muted">Excluding VAT. Fixed quote after scoping.</dd>
                </div>
              </div>
              {service.duration_label && (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-accent" aria-hidden />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Typical duration</dt>
                    <dd className="font-heading text-xl font-semibold">{service.duration_label}</dd>
                  </div>
                </div>
              )}
            </dl>
            <div className="mt-6 grid gap-3">
              {brand.features.booking && (
                <ButtonLink href={`/book?service=${service.slug}`}>Book a consultation</ButtonLink>
              )}
              <ButtonLink href={`/contact?service=${service.slug}`} variant="outline">
                Ask a question
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
