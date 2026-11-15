export type BrandTheme = {
  /** Main brand colour: header accents, primary buttons, links. */
  primary: string;
  /** Text colour used on top of `primary`. */
  primaryForeground: string;
  /** Darker shade of the brand colour for dark sections (hero, footer). */
  deep: string;
  /** Text colour used on top of `deep`. */
  deepForeground: string;
  /** Secondary highlight colour: badges, underlines, key numbers. */
  accent: string;
  accentForeground: string;
  /** Page background. */
  background: string;
  /** Slightly tinted background for alternating sections and cards. */
  surface: string;
  /** Main text colour. */
  ink: string;
  /** Secondary text colour. */
  muted: string;
  /** Border and divider colour. */
  line: string;
  /** Corner radius for cards and buttons, e.g. "0.5rem". */
  radius: string;
  /** Heading typeface. */
  headingFont: "serif" | "sans";
};

export type BrandConfig = {
  key: string;
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  /** One or two letters shown in the logo mark when no logo image is set. */
  monogram: string;
  /** Optional logo image in /public, e.g. "/brand/logo.svg". */
  logoSrc?: string;
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    addressLines: string[];
    hours: string;
  };
  social: {
    linkedin?: string;
    x?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  theme: BrandTheme;
  features: {
    training: boolean;
    investors: boolean;
    booking: boolean;
    caseStudies: boolean;
    googleSignIn: boolean;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
  };
  stats: { value: string; label: string }[];
  about: {
    headline: string;
    paragraphs: string[];
    values: { title: string; text: string }[];
  };
  investors: {
    headline: string;
    summary: string;
    highlights: { title: string; text: string }[];
    useOfFunds: { label: string; percent: number }[];
    disclaimer: string;
  };
  legal: {
    registrationNumber?: string;
    vatNumber?: string;
    informationOfficer: string;
    informationOfficerEmail: string;
    jurisdiction: string;
  };
  bookingTimes: string[];
};
