import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { brand } from "@/config/brand";
import {
  CallToAction,
  CaseStudyCard,
  CourseCard,
  ServiceCard,
  TestimonialCard,
} from "@/components/site/cards";
import { ButtonLink } from "@/components/ui/button";
import { HeroPattern, Section, SectionHeading } from "@/components/ui/primitives";
import {
  getCaseStudies,
  getCourses,
  getServices,
  getTestimonials,
} from "@/lib/data/content";

export default async function HomePage() {
  const [services, courses, studies, testimonials] = await Promise.all([
    getServices(),
    brand.features.training ? getCourses() : Promise.resolve([]),
    brand.features.caseStudies ? getCaseStudies() : Promise.resolve([]),
    getTestimonials(),
  ]);
  const featuredServices = pickFeatured(services, 3);
  const featuredCourses = pickFeatured(courses, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-deep text-deep-fg">
        <HeroPattern />
        <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:py-28">
          <div>
            <p className="eyebrow mb-5">{brand.hero.eyebrow}</p>
            <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              {brand.hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-deep-fg/80">
              {brand.hero.subheadline}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {brand.features.booking ? (
                <ButtonLink href="/book" variant="accent" size="lg">
                  Book a consultation
                </ButtonLink>
              ) : (
                <ButtonLink href="/contact" variant="accent" size="lg">
                  Get in touch
                </ButtonLink>
              )}
              <ButtonLink href="/services" variant="inverse" size="lg">
                Explore our services
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-brand border border-deep-fg/15 bg-deep-fg/[0.04] p-6 backdrop-blur-sm">
            <p className="eyebrow mb-4">How we help</p>
            <ul className="space-y-4">
              {[
                ["Consulting", "Partner-led projects on strategy, funding and operations."],
                ...(brand.features.training
                  ? [["Training", "Practical online courses your team can apply the same week."]]
                  : []),
                ...(brand.features.investors
                  ? [["Partnership", "Opportunities for investors who share our mission."]]
                  : []),
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-deep-fg/70">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {brand.stats.length > 0 && (
          <div className="relative border-t border-deep-fg/10">
            <dl className="container-page grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
              {brand.stats.map((stat) => (
                <div key={stat.label} className="pr-6">
                  <dd className="font-heading text-3xl font-semibold text-accent sm:text-4xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1.5 text-sm text-deep-fg/70">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      <Section>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Consulting"
            title="Advice that ends in action"
            intro="Each engagement has a defined scope, a fixed set of deliverables and a partner accountable for the result."
          />
          <MoreLink href="/services">All services</MoreLink>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Section>

      {featuredCourses.length > 0 && (
        <Section tone="surface">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Training"
              title="Learn the methods we use with clients"
              intro="Self-paced online courses with exercises you complete on your own business. Finish a course and earn a certificate of completion."
            />
            <MoreLink href="/training">All courses</MoreLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Section>
      )}

      {studies.length > 0 && (
        <Section>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Results"
              title="Work we are proud of"
              intro="A few examples of what changed for clients after we worked together."
            />
            <MoreLink href="/case-studies">All case studies</MoreLink>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {studies.slice(0, 3).map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        </Section>
      )}

      {testimonials.length > 0 && (
        <Section tone="surface">
          <SectionHeading eyebrow="In their words" title="What clients say" align="center" />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      <CallToAction />
    </>
  );
}

function pickFeatured<T extends { featured: boolean }>(items: T[], count: number): T[] {
  const featured = items.filter((i) => i.featured);
  return (featured.length >= count ? featured : items).slice(0, count);
}

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}
