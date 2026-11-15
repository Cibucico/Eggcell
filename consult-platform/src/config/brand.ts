import type { CSSProperties } from "react";
import type { BrandConfig } from "./brand.types";
import { apex, umoja } from "./presets/alternates";
import { meridian } from "./presets/meridian";

export const brands: Record<string, BrandConfig> = { meridian, umoja, apex };

/**
 * The active brand. One deployment serves one brand, chosen at build time
 * with NEXT_PUBLIC_BRAND. To onboard a client: add a preset, set the env var.
 */
export const brand: BrandConfig =
  brands[process.env.NEXT_PUBLIC_BRAND ?? ""] ?? meridian;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
    "--brand-heading-font":
      theme.headingFont === "serif"
        ? "var(--font-serif), Georgia, serif"
        : "var(--font-sans), system-ui, sans-serif",
  } as CSSProperties;
}

export type NavItem = { href: string; label: string };

export function mainNav(): NavItem[] {
  const items: NavItem[] = [{ href: "/services", label: "Services" }];
  if (brand.features.training) items.push({ href: "/training", label: "Training" });
  if (brand.features.caseStudies) items.push({ href: "/case-studies", label: "Results" });
  items.push({ href: "/about", label: "About" });
  if (brand.features.investors) items.push({ href: "/investors", label: "Investors" });
  items.push({ href: "/contact", label: "Contact" });
  return items;
}
