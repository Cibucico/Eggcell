import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { InvestorForm } from "@/components/forms/lead-forms";
import { PageHeader, Section, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Investors and partners",
  description: brand.investors.summary,
};

export default function InvestorsPage() {
  if (!brand.features.investors) notFound();
  const { investors, stats } = brand;
  return (
    <>
      <PageHeader eyebrow="Investors and partners" title={investors.headline} intro={investors.summary} />

      <Section>
        <SectionHeading eyebrow="The opportunity" title="Why partner with us" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {investors.highlights.map((h, i) => (
            <div key={h.title} className="rounded-brand border border-line bg-bg p-6">
              <span className="font-heading text-3xl font-semibold text-accent">0{i + 1}</span>
              <h3 className="mt-4 text-xl font-semibold">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{h.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2">
          {stats.length > 0 && (
            <div>
              <SectionHeading eyebrow="Traction" title="Where we are today" />
              <dl className="mt-8 grid grid-cols-2 gap-6">
                {stats.map((s) => (
                  <div key={s.label} className="border-t border-line pt-4">
                    <dd className="font-heading text-3xl font-semibold text-primary">{s.value}</dd>
                    <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {investors.useOfFunds.length > 0 && (
            <div>
              <SectionHeading eyebrow="Use of funds" title="How new capital would be used" />
              <ul className="mt-8 space-y-5">
                {investors.useOfFunds.map((item) => (
                  <li key={item.label}>
                    <div className="flex justify-between text-sm font-medium">
                      <span>{item.label}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.percent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <Section id="interest">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Get in touch"
            title="Register your interest"
            intro="Share a few details and we will contact you. Detailed financial information is provided after an introductory conversation."
          />
          <div className="mt-8 rounded-brand border border-line bg-bg p-6 sm:p-8">
            <InvestorForm />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted">{investors.disclaimer}</p>
        </div>
      </Section>
    </>
  );
}
