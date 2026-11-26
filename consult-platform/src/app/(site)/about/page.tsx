import type { Metadata } from "next";
import { brand } from "@/config/brand";
import Image from "next/image";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/forms/lead-forms";
import { Badge, Eyebrow, PageHeader, Section, SectionHeading } from "@/components/ui/primitives";
import { getServices, getTeam } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "About us",
  description: `Who we are and why ${brand.name} exists.`,
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default async function AboutPage() {
  const [team, services] = await Promise.all([getTeam(), getServices()]);
  return (
    <>
      <PageHeader eyebrow="About us" title={brand.about.headline} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {brand.about.paragraphs.map((p, i) => (
              <p key={p} className={i === 0 ? "font-heading text-2xl leading-snug text-ink sm:text-3xl" : undefined}>
                {p}
              </p>
            ))}
          </div>
          {brand.fullLogo ? (
            <div className="mx-auto w-full max-w-xs rounded-brand bg-white p-8 shadow-[0_20px_50px_-30px_var(--brand-primary)]">
              <Image
                src={brand.fullLogo.src}
                width={brand.fullLogo.width}
                height={brand.fullLogo.height}
                alt={`${brand.name} logo: ${brand.tagline}`}
                className="h-auto w-full"
              />
            </div>
          ) : (
            <ValuesList />
          )}
        </div>
      </Section>

      {brand.fullLogo && (
        <Section tone="surface">
          <ul className="grid gap-5 md:grid-cols-3">
            {brand.about.values.map((value, i) => (
              <li key={value.title} className="rounded-brand border border-line bg-bg p-7">
                <span aria-hidden className="block h-1.5 w-12 rounded-full" style={{ background: `var(--brand-palette-${(i % 5) + 2})` }} />
                <h2 className="mt-6 text-2xl font-medium tracking-tight">{value.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{value.text}</p>
              </li>
            ))}
          </ul>
          {brand.about.audience && (
            <div className="mx-auto mt-16 max-w-3xl text-center">
              <Eyebrow>{brand.about.audience.title}</Eyebrow>
              <p className="font-heading mt-5 text-2xl leading-snug sm:text-3xl">{brand.about.audience.text}</p>
            </div>
          )}
        </Section>
      )}

      {team.length > 0 && (
        <Section tone="surface">
          <SectionHeading eyebrow="The team" title="The people you will work with" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {team.map((member) => (
              <article key={member.id} className="rounded-brand border border-line bg-bg p-6 sm:flex sm:gap-6">
                {member.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photo_url}
                    alt={`Portrait of ${member.name}`}
                    loading="lazy"
                    className="h-24 w-24 shrink-0 rounded-brand object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="font-heading flex h-24 w-24 shrink-0 items-center justify-center rounded-brand bg-deep text-2xl font-semibold text-accent"
                  >
                    {initials(member.name)}
                  </div>
                )}
                <div className="mt-5 sm:mt-0">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role_title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>
                  {member.credentials.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {member.credentials.map((c) => (
                        <li key={c}>
                          <Badge>{c}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      LinkedIn profile
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}
      <Section id="contact">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading
            eyebrow="Contact us"
            title="Let's _talk_"
            intro="Send us a message and we will reply within one business day."
          />
          <div className="rounded-brand border border-line bg-bg p-6 sm:p-8">
            <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
              <EnquiryForm services={services.map(({ id, slug, title }) => ({ id, slug, title }))} />
            </Suspense>
          </div>
        </div>
      </Section>
    </>
  );
}

function ValuesList() {
  return (
    <ul className="space-y-6">
      {brand.about.values.map((value, i) => (
        <li key={value.title} className="flex gap-4 border-t border-line pt-5">
          {brand.about.numberedValues !== false && (
            <span className="font-heading text-2xl font-semibold text-accent">0{i + 1}</span>
          )}
          <div>
            <h3 className="text-lg font-semibold">{value.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{value.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
