import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { CallToAction } from "@/components/site/cards";
import { Badge, PageHeader, Section, SectionHeading } from "@/components/ui/primitives";
import { getTeam } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "About us",
  description: `Who we are, how we work and the people behind ${brand.name}.`,
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <>
      <PageHeader eyebrow="About us" title={brand.about.headline} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {brand.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="space-y-6">
            {brand.about.values.map((value, i) => (
              <li key={value.title} className="flex gap-4 border-t border-line pt-5">
                <span className="font-heading text-2xl font-semibold text-accent">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{value.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

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
      <CallToAction />
    </>
  );
}
