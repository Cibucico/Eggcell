import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { CallToAction } from "@/components/site/cards";
import { PageHeader, Paragraphs, Section } from "@/components/ui/primitives";
import { getCaseStudies, getCaseStudy, slugParams } from "@/lib/data/content";

export async function generateStaticParams() {
  return slugParams(await getCaseStudies());
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const study = await getCaseStudy((await params).slug);
  if (!study) return {};
  return { title: study.title, description: study.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  if (!brand.features.caseStudies) notFound();
  const study = await getCaseStudy((await params).slug);
  if (!study) notFound();

  const parts = [
    ["The challenge", study.challenge],
    ["Our approach", study.approach],
    ["The outcome", study.outcome],
  ].filter(([, text]) => text.trim());

  return (
    <>
      <PageHeader eyebrow={study.industry} title={study.title} intro={study.summary}>
        {study.metrics.length > 0 && (
          <dl className="grid max-w-2xl grid-cols-3 gap-6 border-t border-deep-fg/15 pt-6">
            {study.metrics.map((m) => (
              <div key={m.label}>
                <dd className="font-heading text-3xl font-semibold text-accent">{m.value}</dd>
                <dt className="mt-1 text-sm text-deep-fg/70">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </PageHeader>
      <Section>
        <div className="mx-auto max-w-3xl">
          {parts.map(([heading, text]) => (
            <section key={heading} className="mb-10">
              <h2 className="text-2xl font-semibold">{heading}</h2>
              <Paragraphs text={text} className="mt-3 text-lg leading-relaxed text-muted" />
            </section>
          ))}
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All case studies
          </Link>
        </div>
      </Section>
      <CallToAction title="Facing something similar?" />
    </>
  );
}
