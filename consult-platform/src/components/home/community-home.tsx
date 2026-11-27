import { ArrowRight, CalendarDays, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { brand, TOOLKIT_CATEGORIES } from "@/config/brand";
import { EnquiryForm } from "@/components/forms/lead-forms";
import { categoryColor } from "@/components/toolkit/parts";
import { ButtonLink } from "@/components/ui/button";
import { Accent, Eyebrow, HeroPattern, Section, SectionHeading } from "@/components/ui/primitives";
import { getServices, getUpcomingLiveSessions, getToolkitArticles } from "@/lib/data/content";
import { formatSessionTime } from "@/lib/utils";

/**
 * Home page for community brands with a hero picture (iNkqubo): picture,
 * about, why we exist, toolkit path, meeting room and a contact form, in the
 * order the client sketched.
 */
export async function CommunityHome() {
  const { features } = brand;
  const [articles, sessions, services] = await Promise.all([
    features.toolkit ? getToolkitArticles() : Promise.resolve([]),
    features.meetingRoom ? getUpcomingLiveSessions() : Promise.resolve([]),
    getServices(),
  ]);
  const image = brand.hero.image!;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      {/* Deep plum ground, so the painting's dark background melts into the page. */}
      <section className="grain relative -mt-[4.75rem] overflow-hidden bg-deep pt-[4.75rem] text-deep-fg">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="glow -left-48 top-24 h-[30rem] w-[30rem] opacity-35" style={{ background: "var(--brand-palette-5)" }} />
          <div className="glow -right-48 top-64 h-[32rem] w-[32rem] opacity-30" style={{ background: "var(--brand-palette-3)" }} />
        </div>
        <div className="container-page relative flex flex-col items-center pb-20 pt-14 text-center sm:pt-20">
          <Eyebrow className="animate-rise">{brand.hero.eyebrow}</Eyebrow>
          <h1
            className="animate-rise mt-5 max-w-3xl text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            <Accent text={brand.hero.headline} />
          </h1>

          <div className="animate-rise relative mt-4 w-full max-w-[28rem] sm:max-w-[36rem]" style={{ animationDelay: "160ms" }}>
            {/* The painting fades softly into the page instead of sitting in a frame. */}
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              sizes="(min-width: 640px) 36rem, 100vw"
              className="aspect-square w-full object-cover"
              style={{
                maskImage: "radial-gradient(ellipse 50% 50% at 50% 45%, #000 40%, rgba(0,0,0,0.6) 62%, transparent 82%)",
                WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 45%, #000 40%, rgba(0,0,0,0.6) 62%, transparent 82%)",
              }}
            />
          </div>

          <p className="animate-rise -mt-6 max-w-2xl text-lg leading-relaxed text-deep-fg/80" style={{ animationDelay: "240ms" }}>
            {brand.hero.subheadline}
          </p>
          <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "300ms" }}>
            {features.toolkit && (
              <ButtonLink href="/toolkit" variant="accent" size="lg">
                Explore the {brand.toolkit?.label.toLowerCase() ?? "toolkit"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            )}
            {features.booking && (
              <ButtonLink href="/book" variant="inverse" size="lg">
                Book a consultation
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- About */}
      <Section tone="surface" id="about">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>About us</Eyebrow>
            <p className="font-heading mt-5 text-3xl font-medium leading-snug tracking-tight sm:text-4xl">
              {brand.about.paragraphs[0]}
            </p>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {brand.about.paragraphs.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary">
              More about us
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-4">
            {brand.about.values.map((value, i) => (
              <li key={value.title} className="rounded-brand border border-line bg-bg p-6">
                <p className="flex items-center gap-3">
                  <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--brand-palette-${(i % 5) + 2})` }} />
                  <span className="font-heading text-xl font-medium">{value.title}</span>
                </p>
                <p className="mt-2 leading-relaxed text-muted">{value.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* -------------------------------------------------------- Why we exist */}
      {brand.problem && (
        <Section tone="deep">
          <HeroPattern />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                <Accent text={brand.problem.headline} />
              </h2>
              <ul className="mt-8 space-y-5">
                {brand.problem.points.map((point) => (
                  <li key={point} className="flex gap-4 text-lg leading-relaxed text-deep-fg/85">
                    <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-brand border border-deep-fg/15 bg-deep-fg/[0.06] p-8 backdrop-blur sm:p-10">
              <p className="font-heading text-2xl leading-snug sm:text-3xl">{brand.problem.answer}</p>
              {features.toolkit && (
                <ButtonLink href="/toolkit" variant="accent" className="mt-8">
                  Start with the {brand.toolkit?.label.toLowerCase() ?? "toolkit"}
                </ButtonLink>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------- Toolkit */}
      {features.toolkit && (
        <Section>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={brand.toolkit?.label ?? "Toolkit"}
              title={brand.toolkit?.headline ?? "Toolkit"}
              intro={brand.toolkit?.intro}
            />
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {TOOLKIT_CATEGORIES.map((category, i) => {
              const count = articles.filter((a) => a.category === category.slug).length;
              return (
                <li key={category.slug}>
                  <Link
                    href={`/toolkit/${category.slug}`}
                    className="card-lift group flex h-full flex-col rounded-brand border border-line bg-bg p-7"
                  >
                    <span
                      aria-hidden
                      className="font-heading flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
                      style={{ background: categoryColor[category.slug] }}
                    >
                      {i + 1}
                    </span>
                    <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">Step {i + 1}</span>
                    <span className="mt-1 text-2xl font-medium tracking-tight">{category.label}</span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{category.description}</span>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {count > 0 ? `${count} ${count === 1 ? "guide" : "guides"}` : "Coming soon"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Section>
      )}

      {/* -------------------------------------------------------- Meeting room */}
      {features.meetingRoom && (
        <Section tone="surface">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Meeting room"
                title={brand.meetingRoom?.headline ?? "Meeting room"}
                intro={brand.meetingRoom?.intro}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/meeting-room" prefetch={false}>
                  <Video className="h-4 w-4" aria-hidden />
                  Enter the meeting room
                </ButtonLink>
                {features.womenOnly && (
                  <ButtonLink href="/register" variant="outline" prefetch={false}>
                    Join as a member
                  </ButtonLink>
                )}
              </div>
            </div>
            <div className="grid gap-4">
              {sessions.slice(0, 2).map((session) => (
                <Link
                  key={session.id}
                  href={`/live/${session.slug}`}
                  className="card-lift flex gap-5 rounded-brand border border-line bg-bg p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarDays className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                      {formatSessionTime(session.starts_at)}
                    </span>
                    <span className="mt-1 block text-lg font-semibold leading-snug">{session.title}</span>
                    <span className="mt-1 block text-sm text-muted">{session.summary}</span>
                  </span>
                </Link>
              ))}
              {sessions.length === 0 && (
                <div className="flex items-center gap-4 rounded-brand border border-dashed border-line p-6 text-muted">
                  <Users className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  New webinars and business clinics are announced here.
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------------------- Contact */}
      <Section id="contact">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading
              eyebrow="Contact us"
              title="Tell us where you _are_, and where you want to be"
              intro="Send us a message and we will reply within one business day."
            />
            {features.booking && (
              <p className="mt-6 text-muted">
                Prefer a set time?{" "}
                <Link href="/book" className="font-semibold text-primary underline underline-offset-4">
                  Book a consultation
                </Link>
                .
              </p>
            )}
            <p className="mt-6 text-sm text-muted">
              Email:{" "}
              <span className="select-all font-medium text-ink">{brand.contact.email}</span>
            </p>
          </div>
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
