import Link from "next/link";
import { ArrowRight, Clock, PlayCircle, Quote } from "lucide-react";
import { brand } from "@/config/brand";
import { Badge } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/icon";
import type { CaseStudy, Course, Service, Testimonial } from "@/lib/types";
import { formatMoney, formatPrice } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-brand border border-line bg-bg p-6 transition-colors hover:border-primary"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-brand bg-primary/10 text-primary">
        <ServiceIcon name={service.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-xl font-semibold">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
        <span className="text-muted">
          {service.price_from_cents != null
            ? `From ${formatMoney(service.price_from_cents)}`
            : "Priced per project"}
        </span>
        <span className="flex items-center gap-1 font-semibold text-primary">
          Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

const formatLabels = { self_paced: "Self-paced", live: "Live cohort", hybrid: "Hybrid" } as const;

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/training/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-brand border border-line bg-bg transition-colors hover:border-primary"
    >
      <CourseCover course={course} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{course.level}</Badge>
          <Badge>{formatLabels[course.format]}</Badge>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug">{course.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{course.summary}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <Clock className="h-4 w-4" aria-hidden />
            {course.duration_label}
          </span>
          <span className="font-heading text-base font-semibold text-ink">
            {formatPrice(course.price_cents)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Course image, or a branded placeholder when none has been uploaded. */
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
        className={`aspect-[16/9] w-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`relative flex aspect-[16/9] w-full items-end overflow-hidden bg-deep p-5 text-deep-fg ${className ?? ""}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, var(--brand-accent), transparent 45%), radial-gradient(circle at 10% 90%, var(--brand-primary), transparent 55%)",
        }}
      />
      <PlayCircle className="absolute right-5 top-5 h-7 w-7 text-accent" />
      <span className="eyebrow relative">{brand.name}</span>
    </div>
  );
}

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group flex h-full flex-col rounded-brand border border-line bg-bg p-6 transition-colors hover:border-primary"
    >
      <p className="eyebrow">{study.industry}</p>
      <h3 className="mt-3 text-xl font-semibold leading-snug">{study.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{study.summary}</p>
      {study.metrics.length > 0 && (
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
          {study.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <dd className="font-heading text-xl font-semibold text-primary">{m.value}</dd>
              <dt className="mt-0.5 text-xs text-muted">{m.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </Link>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-brand border border-line bg-bg p-6">
      <Quote className="h-6 w-6 text-accent" aria-hidden />
      <blockquote className="mt-4 flex-1 font-heading text-lg leading-relaxed">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-5 border-t border-line pt-4 text-sm">
        <span className="font-semibold">{testimonial.author_name}</span>
        {testimonial.company && <span className="block text-muted">{testimonial.company}</span>}
      </figcaption>
    </figure>
  );
}

export function CallToAction({
  title = "Ready to talk about your business?",
  text = "Book a free 30-minute consultation. We will listen, ask questions, and tell you honestly whether we can help.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-primary text-primary-fg">
      <div className="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-primary-fg/80">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {brand.features.booking && (
            <ButtonLink href="/book" variant="accent" size="lg">
              Book a consultation
            </ButtonLink>
          )}
          <ButtonLink
            href="/contact"
            size="lg"
            className="border border-primary-fg/30 bg-transparent hover:bg-primary-fg/10"
          >
            Send an enquiry
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
