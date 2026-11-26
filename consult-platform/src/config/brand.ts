import type { CSSProperties } from "react";
import type { BrandConfig } from "./brand.types";
import { apex, umoja } from "./presets/alternates";
import { inkqubo } from "./presets/inkqubo";
import { meridian } from "./presets/meridian";

export const brands: Record<string, BrandConfig> = { inkqubo, meridian, umoja, apex };

/**
 * The active brand. One deployment serves one brand, chosen at build time
 * with NEXT_PUBLIC_BRAND. To onboard a client: add a preset, set the env var.
 */
export const brand: BrandConfig =
  brands[process.env.NEXT_PUBLIC_BRAND ?? ""] ?? inkqubo;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/** CSS custom properties that drive the whole design from the brand theme. */
export function themeVars(theme = brand.theme): CSSProperties {
  return {
    "--brand-primary": theme.primary,
    "--brand-primary-fg": theme.primaryForeground,
    "--brand-deep": theme.deep,
    "--brand-deep-fg": theme.deepForeground,
    "--brand-accent": theme.accent,
    "--brand-accent-fg": theme.accentForeground,
    "--brand-bg": theme.background,
    "--brand-surface": theme.surface,
    "--brand-ink": theme.ink,
    "--brand-muted": theme.muted,
    "--brand-line": theme.line,
    "--brand-radius": theme.radius,
    "--brand-palette-1": brand.palette?.[0] ?? theme.accent,
    "--brand-palette-2": brand.palette?.[1] ?? theme.accent,
    "--brand-palette-3": brand.palette?.[2] ?? theme.primary,
    "--brand-palette-4": brand.palette?.[3] ?? theme.primary,
    "--brand-palette-5": brand.palette?.[4] ?? theme.deep,
    "--brand-heading-font":
      theme.headingFont === "serif"
        ? "var(--font-serif), Georgia, serif"
        : "var(--font-sans), system-ui, sans-serif",
  } as CSSProperties;
}

export type NavItem = { href: string; label: string; children?: NavItem[] };

/** The toolkit's three areas, in the order a new business usually needs them. */
export const TOOLKIT_CATEGORIES = [
  {
    slug: "operations",
    label: "Operations",
    description:
      "Set up the business properly and run it smoothly: registration, compliance and simple systems.",
  },
  {
    slug: "marketing",
    label: "Marketing",
    description:
      "Know your customer, shape your message and reach the right people without a big budget.",
  },
  {
    slug: "finance",
    label: "Finance",
    description:
      "Separate your money, keep simple records, price for profit and get ready for funding.",
  },
] as const;

export type ToolkitCategoryInfo = (typeof TOOLKIT_CATEGORIES)[number];

export function toolkitCategory(slug: string): ToolkitCategoryInfo | undefined {
  return TOOLKIT_CATEGORIES.find((c) => c.slug === slug);
}

export function mainNav(): NavItem[] {
  const f = brand.features;
  const all: (NavItem & { on: boolean })[] = [
    { href: "/services", label: "Services", on: f.services },
    {
      href: "/toolkit",
      label: brand.toolkit?.label ?? "Toolkit",
      on: f.toolkit,
      children: TOOLKIT_CATEGORIES.map((c) => ({ href: `/toolkit/${c.slug}`, label: c.label })),
    },
    { href: "/training", label: "Training", on: f.training },
    { href: "/case-studies", label: "Results", on: f.caseStudies },
    { href: "/about", label: "About", on: true },
    { href: "/meeting-room", label: "Meeting room", on: f.meetingRoom },
    { href: "/investors", label: "Investors", on: f.investors },
    { href: "/contact", label: "Contact", on: true },
  ];
  const enabled = all.filter((item) => item.on).map(({ on: _on, ...item }) => item);
  if (!brand.navOrder) return enabled;
  const rank = (href: string) => {
    const i = brand.navOrder!.indexOf(href);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...enabled].sort((a, b) => rank(a.href) - rank(b.href));
}
