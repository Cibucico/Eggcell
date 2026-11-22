import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders a heading string, setting any _underscored_ words in the accent
 * italic. Lets copy in the brand config carry emphasis without markup.
 */
export function Accent({ text }: { text: string }) {
  return (
    <>
      {text.split(/(_[^_]+_)/).map((part, i) =>
        part.startsWith("_") && part.endsWith("_") && part.length > 2 ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "deep";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-20 sm:py-28",
        tone === "surface" && "bg-surface",
        tone === "deep" && "grain overflow-hidden bg-deep text-deep-fg",
        className,
      )}
    >
      <div className="container-page relative">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow inline-flex items-center gap-2", className)}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
        <Accent text={title} />
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed opacity-75">{intro}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="grain relative -mt-[4.75rem] overflow-hidden bg-deep pt-[4.75rem] text-deep-fg">
      <HeroPattern />
      <div className="container-page relative pb-16 pt-16 sm:pb-24 sm:pt-24">
        {eyebrow && <Eyebrow className="animate-rise mb-6">{eyebrow}</Eyebrow>}
        <h1
          className="animate-rise max-w-4xl text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          <Accent text={title} />
        </h1>
        {intro && (
          <p
            className="animate-rise mt-7 max-w-2xl text-lg leading-relaxed text-deep-fg/75 sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            {intro}
          </p>
        )}
        {children && (
          <div className="animate-rise mt-10" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Decorative layer for dark sections: two soft colour fields and a set of
 * concentric arches on the right. Purely visual.
 */
export function HeroPattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="glow -right-32 -top-40 h-[34rem] w-[34rem] bg-primary opacity-60" />
      <div className="glow -bottom-56 left-1/4 h-[30rem] w-[30rem] bg-accent opacity-25" />
      <svg
        className="absolute -right-24 top-1/2 hidden h-[44rem] w-[44rem] -translate-y-1/2 text-deep-fg/10 md:block"
        viewBox="0 0 400 400"
        fill="none"
      >
        {[190, 160, 130, 100, 70].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeWidth="0.75" />
        ))}
        <circle cx="200" cy="10" r="4" fill="var(--brand-accent)" />
        <circle cx="330" cy="200" r="3" fill="var(--brand-accent)" opacity="0.7" />
      </svg>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-brand border border-line bg-bg p-6", className)}>{children}</div>
  );
}

const badgeTones = {
  neutral: "bg-surface text-muted border-line",
  accent: "bg-accent/15 text-ink border-accent/40",
  success: "bg-success/10 text-success border-success/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  primary: "bg-primary/10 text-primary border-primary/25",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-brand border border-dashed border-line px-6 py-12 text-center">
      <p className="font-heading text-lg font-semibold">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Splits plain text on blank lines into paragraphs. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {text
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}
