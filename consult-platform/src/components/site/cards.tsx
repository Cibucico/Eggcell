import Link from "next/link";
import { ArrowUpRight, Clock, PlayCircle } from "lucide-react";
import { brand } from "@/config/brand";
import { Accent, Badge, HeroPattern } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/icon";
import type { CaseStudy, Course, Service, Testimonial } from "@/lib/types";
import { cn, formatMoney, formatPrice } from "@/lib/utils";
import { CoverArt } from "./cover-art";

function priceLabel(service: Service) {
  return service.price_from_cents != null ? `From ${formatMoney(service.price_from_cents)}` : "Priced per project";
}

export function ServiceCard({
  service,
  index,
  feature = false,
}: {
  service: Service;
  index?: number;
  feature?: boolean;
}) {
  if (feature) {
    return (
      <Link
        href={`/services/${service.slug}`}
        className="card-lift grain group relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-brand bg-deep p-8 text-deep-fg"
      >
        <div aria-hidden className="glow -right-20 -top-20 h-72 w-72 bg-primary opacity-70" />
        <div className="relative flex items-start justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg">
            <ServiceIcon name={service.icon} className="h-6 w-6" />
          </span>
          <ArrowUpRight className="h-6 w-6 text-deep-fg/50 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" aria-hidden />
        </div>
        <div className="relative mt-auto">
          <p className="eyebrow">Most requested</p>
          <h3 className="mt-3 text-4xl font-medium leading-tight tracking-tight">{service.title}</h3>
          <p className="mt-3 max-w-md text-deep-fg/75">{service.summary}</p>
          {service.deliverables.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {service.deliverables.slice(0, 3).map((d) => (
                <li key={d} className="rounded-full border border-deep-fg/15 bg-deep-fg/5 px-3 py-1 text-xs">
                  {d}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-sm font-semibold text-accent">{priceLabel(service)}</p>
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={`/services/${service.slug}`}
      className="card-lift group flex h-full flex-col rounded-brand border border-line bg-bg p-7"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-fg">
          <ServiceIcon name={service.icon} className="h-5 w-5" />
        </span>
        {index != null && (
          <span className="font-heading text-sm italic text-muted">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <h3 className="mt-8 text-2xl font-medium leading-snug tracking-tight">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.summary}</p>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted">{priceLabel(service)}</span>
        <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}

const formatLabels = { self_paced: "Self-paced", live: "Live cohort", hybrid: "Hybrid" } as const;

export function CourseCard({ course, onDark = false }: { course: Course; onDark?: boolean }) {
  return (
    <Link
      href={`/training/${course.slug}`}
      className={cn(
        "card-lift group flex h-full flex-col overflow-hidden rounded-brand border",
        onDark ? "border-deep-fg/10 bg-deep-fg/[0.04] text-deep-fg backdrop-blur" : "border-line bg-bg",
      )}
    >
      <div className="relative">
        <CourseCover course={course} />
        <span className="absolute left-4 top-4 rounded-full bg-bg/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
          {formatPrice(course.price_cents)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className={cn("text-xs font-medium uppercase tracking-wider", onDark ? "text-deep-fg/60" : "text-muted")}>
          {course.level} · {formatLabels[course.format]}
        </p>
        <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight">{course.title}</h3>
        <p className={cn("mt-2 flex-1 text-sm leading-relaxed", onDark ? "text-deep-fg/70" : "text-muted")}>
          {course.summary}
        </p>
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className={cn("flex items-center gap-1.5", onDark ? "text-deep-fg/70" : "text-muted")}>
            <Clock className="h-4 w-4" aria-hidden />
            {course.duration_label}
          </span>
          <ArrowUpRight className="h-5 w-5 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </Link>
  );
}

/** Course image, or generated brand artwork when none has been uploaded. */
export function CourseCover({ course, className }: { course: Course; className?: string }) {
  if (course.cover_url) {
    return (
      // Cover images are hosted wherever the client uploads them, so a plain
      // <img> avoids having to allow-list every possible host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={course.cover_url}
        alt=""
        loading="lazy"
        className={cn("aspect-[16/9] w-full object-cover", className)}
      />
    );
  }
  return (
    <div className={cn("relative aspect-[16/9] w-full overflow-hidden", className)}>
      <CoverArt seed={course.slug} className="absolute inset-0 h-full w-full" />
      <PlayCircle className="absolute bottom-4 right-4 h-8 w-8 text-deep-fg/80" aria-hidden />
    </div>
  );
}

export function CaseStudyCard({ study, index }: { study: CaseStudy; index?: number }) {
  const lead = study.metrics[0];
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="card-lift group flex h-full flex-col rounded-brand border border-line bg-bg p-7"
    >
      <div className="flex items-center justify-between">
        <Badge tone="primary">{study.industry}</Badge>
        {index != null && <span className="font-heading text-sm italic text-muted">Case {String(index + 1).padStart(2, "0")}</span>}
      </div>
      {lead && (
        <p className="font-heading mt-8 text-6xl font-medium tracking-tight text-primary">
          {lead.value}
          <span className="mt-1 block font-sans text-sm font-normal tracking-normal text-muted">{lead.label}</span>
        </p>
      )}
      <h3 className="mt-6 text-xl font-medium leading-snug tracking-tight">{study.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{study.summary}</p>
      {study.metrics.length > 1 && (
        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
          {study.metrics.slice(1, 3).map((m) => (
            <div key={m.label}>
              <dd className="font-heading text-xl font-medium">{m.value}</dd>
              <dt className="text-xs text-muted">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </Link>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-brand border border-line bg-bg p-7">
      <span aria-hidden className="font-heading text-6xl leading-none text-accent">
        “
      </span>
      <blockquote className="font-heading -mt-4 flex-1 text-xl leading-snug">{testimonial.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 text-sm">
        <span
          aria-hidden
          className="font-heading flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 italic text-primary"
        >
          {testimonial.author_name[0]}
        </span>
        <span>
          <span className="block font-semibold">{testimonial.author_name}</span>
          {testimonial.company && <span className="text-muted">{testimonial.company}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function CallToAction({
  title = "Ready to talk about _your_ business?",
  text = "Book a free 30-minute consultation. We will listen, ask questions, and tell you honestly whether we can help.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="px-3 py-10 sm:px-5">
      <div className="grain relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-deep px-6 py-16 text-center text-deep-fg sm:px-12 sm:py-24">
        <HeroPattern />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            <Accent text={title} />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-deep-fg/75">{text}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {brand.features.booking && (
              <ButtonLink href="/book" variant="accent" size="lg">
                Book a consultation
              </ButtonLink>
            )}
            <ButtonLink href="/contact" variant="inverse" size="lg">
              Send an enquiry
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
