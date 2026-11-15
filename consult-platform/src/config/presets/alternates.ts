import type { BrandConfig } from "../brand.types";
import { meridian } from "./meridian";

/**
 * Two further demo brands that reuse Meridian's content with a different
 * name and look. They exist to show the same product under different brands.
 */
export const umoja: BrandConfig = {
  ...meridian,
  key: "umoja",
  name: "Umoja Growth Partners",
  legalName: "Umoja Growth Partners (Pty) Ltd",
  monogram: "U",
  tagline: "Advisory and training for businesses on the rise",
  description:
    "Umoja Growth Partners helps African businesses plan, fund and run their next stage of growth, through hands-on consulting and practical online training.",
  contact: {
    ...meridian.contact,
    email: "hello@umojagrowth.example",
    addressLines: ["Umhlanga, Durban", "South Africa"],
  },
  legal: {
    ...meridian.legal,
    informationOfficerEmail: "privacy@umojagrowth.example",
  },
  about: {
    ...meridian.about,
    paragraphs: meridian.about.paragraphs.map((p) =>
      p.replace("Meridian Advisory", "Umoja Growth Partners"),
    ),
  },
  theme: {
    primary: "#1f5a44",
    primaryForeground: "#ffffff",
    deep: "#10382a",
    deepForeground: "#f3f6ef",
    accent: "#e2a23b",
    accentForeground: "#231603",
    background: "#fafbf7",
    surface: "#eef2e8",
    ink: "#16231d",
    muted: "#546359",
    line: "#d5dccd",
    radius: "0.875rem",
    headingFont: "serif",
  },
};

export const apex: BrandConfig = {
  ...meridian,
  key: "apex",
  name: "Apex Consulting Group",
  legalName: "Apex Consulting Group (Pty) Ltd",
  monogram: "A",
  tagline: "Sharper strategy. Stronger operations.",
  description:
    "Apex Consulting Group helps businesses plan, fund and run their next stage of growth, through hands-on consulting and practical online training.",
  contact: {
    ...meridian.contact,
    email: "hello@apexconsulting.example",
    addressLines: ["Century City, Cape Town", "South Africa"],
  },
  legal: {
    ...meridian.legal,
    informationOfficerEmail: "privacy@apexconsulting.example",
  },
  about: {
    ...meridian.about,
    paragraphs: meridian.about.paragraphs.map((p) =>
      p.replace("Meridian Advisory", "Apex Consulting Group"),
    ),
  },
  theme: {
    primary: "#2747d8",
    primaryForeground: "#ffffff",
    deep: "#10131c",
    deepForeground: "#eef0f6",
    accent: "#22c3a6",
    accentForeground: "#04211c",
    background: "#ffffff",
    surface: "#f3f4f8",
    ink: "#12141c",
    muted: "#585e6f",
    line: "#dfe1ea",
    radius: "0.125rem",
    headingFont: "sans",
  },
};
