import { ArrowRight, ArrowUpRight, Video } from "lucide-react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { CommunityHome } from "@/components/home/community-home";
import {
  CallToAction,
  CaseStudyCard,
  CourseCard,
  ServiceCard,
  TestimonialCard,
} from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/button";
import { Accent, Eyebrow, HeroPattern, Section, SectionHeading } from "@/components/ui/primitives";
import {
  getCaseStudies,
  getCourses,
  getServices,
  getTestimonials,
  getUpcomingLiveSessions,
  type LiveSessionListing,
} from "@/lib/data/content";

export default async function HomePage() {
  if (brand.hero.image) return <CommunityHome />;
  const [services, courses, studies, testimonials, sessions] = await Promise.all([
    getServices(),
    brand.features.training ? getCourses() : Promise.resolve([]),
    brand.features.caseStudies ? getCaseStudies() : Promise.resolve([]),
    getTestimonials(),
    brand.features.training ? getUpcomingLiveSessions() : Promise.resolve([]),
  ]);
  const featuredServices = pickFeatured(services, 5);
  const featuredCourses = pickFeatured(courses, 3);
  const [lead, ...rest] = testimonials;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="grain relative -mt-[4.75rem] overflow-hidden bg-deep pt-[4.75rem] text-deep-fg">
        <HeroPattern />
        <div className="container-page relative pb-20 pt-20 sm:pt-28 lg:pb-28 lg:pt-32">
          <Eyebrow className="animate-rise">{brand.hero.eyebrow}</Eyebrow>
          <h1
            className="animate-rise mt-6 max-w-5xl text-5xl font-medium leading-[1] tracking-tight sm:text-6xl lg:text-[5.5rem]"
            style={{ animationDelay: "80ms" }}
          >
            <Accent text={brand.hero.headline} />
          </h1>
          <div
            className="animate-rise mt-12 grid gap-12 border-t border-deep-fg/10 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20"
            style={{ animationDelay: "160ms" }}
          >
            <div>
              <p className="max-w-xl text-lg leading-relaxed text-deep-fg/75">{brand.hero.subheadline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={brand.features.booking ? "/book" : "/contact"} variant="accent" size="lg">
                  {brand.features.booking ? "Book a free consultation" : "Get in touch"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/services" variant="inverse" size="lg">
                  Explore services
                </ButtonLink>
              </div>
            </div>
            {brand.stats.length > 0 && (
              <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-brand border border-deep-fg/10 bg-deep-fg/10">
                {brand.stats.map((stat) => (
                  <div key={stat.label} className="bg-deep/90 p-6">
                    <dd className="font-heading text-4xl font-medium text-accent">{stat.value}</dd>
                    <dt className="mt-2 text-sm leading-snug text-deep-fg/65">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Marquee */}
      <Marquee items={services.map((s) => s.title)} />

      {/* ------------------------------------------------------------ Services */}
      <Section>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Consulting"
            title="Advice that ends in _action_"
            intro="Each engagement has a defined scope, a fixed set of deliverables and a partner accountable for the result."
          />
          <MoreLink href="/services">All services</MoreLink>
        </div>
        {featuredServices.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            <div className="md:col-span-2 lg:row-span-2">
              <ServiceCard service={featuredServices[0]} feature />
            </div>
            {featuredServices.slice(1, 5).map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i + 1} />
            ))}
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------ Training */}
      {featuredCourses.length > 0 && (
        <Section tone="deep">
          <HeroPattern />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Training"
              title="Learn the methods we use with _clients_"
              intro="Interactive online courses, screen by screen, with exercises you complete on your own business. Finish and earn a verifiable certificate."
            />
            <MoreLink href="/training" inverse>
              All courses
            </MoreLink>
          </div>
          <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onDark />
            ))}
          </div>
          {sessions.length > 0 && <LiveStrip session={sessions[0]} />}
        </Section>
      )}

      {/* ------------------------------------------------------------- Results */}
      {studies.length > 0 && (
        <Section>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Results"
              title="Numbers our clients _feel_"
              intro="A few examples of what changed after we worked together."
            />
            <MoreLink href="/case-studies">All case studies</MoreLink>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {studies.slice(0, 3).map((study, i) => (
              <CaseStudyCard key={study.id} study={study} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* -------------------------------------------------------- Testimonials */}
      {lead && (
        <Section tone="surface">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <figure className="relative flex flex-col justify-between overflow-hidden rounded-brand bg-bg p-8 sm:p-12">
              <div aria-hidden className="glow -right-24 -top-24 h-72 w-72 bg-accent opacity-20" />
              <Eyebrow>In their words</Eyebrow>
              <blockquote className="font-heading relative mt-8 text-3xl font-medium leading-snug tracking-tight sm:text-4xl">
                “{lead.quote}”
              </blockquote>
              <figcaption className="relative mt-10 flex items-center gap-4">
                <span aria-hidden className="font-heading flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg italic text-primary-fg">
                  {lead.author_name[0]}
                </span>
                <span>
                  <span className="block font-semibold">{lead.author_name}</span>
                  <span className="text-sm text-muted">{lead.company}</span>
                </span>
              </figcaption>
            </figure>
            <div className="grid gap-5">
              {rest.slice(0, 2).map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </Section>
      )}

      <CallToAction />
    </>
  );
}

function pickFeatured<T extends { featured: boolean }>(items: T[], count: number): T[] {
  const featured = items.filter((i) => i.featured);
  const others = items.filter((i) => !i.featured);
  return [...featured, ...others].slice(0, count);
}

function MoreLink({ href, children, inverse = false }: { href: string; children: string; inverse?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
        inverse
          ? "border-deep-fg/20 text-deep-fg hover:border-accent hover:text-accent"
          : "border-ink/15 text-ink hover:border-primary hover:text-primary"
      }`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-line bg-accent py-5 text-accent-fg" aria-hidden>
      <div className="animate-marquee flex w-max gap-10">
        {row.map((item, i) => (
          <span key={i} className="font-heading flex items-center gap-10 whitespace-nowrap text-2xl italic">
            {item}
            <span className="h-1.5 w-1.5 rounded-full bg-accent-fg/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

function LiveStrip({ session }: { session: LiveSessionListing }) {
  const when = new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  }).format(new Date(session.starts_at));
  return (
    <Link
      href={`/live/${session.slug}`}
      className="card-lift group relative mt-5 flex flex-col gap-5 rounded-brand border border-deep-fg/10 bg-deep-fg/[0.05] p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
          <Video className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Next live session · {when} SAST</p>
          <p className="mt-1 text-xl font-medium">{session.title}</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-deep-fg/80 group-hover:text-accent">
        Save your seat
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}
