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
  /** Optional square logo mark in /public, e.g. "/brand/logo.svg". */
  logoSrc?: string;
  /**
   * Optional wide wordmark image shown in the header instead of the monogram
   * and name text. Shown on a light chip over dark backgrounds.
   */
  wordmark?: { src: string; width: number; height: number };
  /** Full logo with tagline, shown on the About page. */
  fullLogo?: { src: string; width: number; height: number };
  /** App icon (square PNG). Also used for the installable web app. */
  icons?: { s48: string; s180: string; s192: string; s512: string };
  contact: {
    email: string;
    /** Leave empty to hide. */
    phone: string;
    whatsapp?: string;
    /** Leave empty to hide. */
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
    /** Public services pages. */
    services: boolean;
    /** Paid online courses, lessons and certificates. */
    training: boolean;
    investors: boolean;
    booking: boolean;
    caseStudies: boolean;
    googleSignIn: boolean;
    /** Free knowledge library (operations, marketing, finance). */
    toolkit: boolean;
    /** Video meeting room for webinars and consultations. */
    meetingRoom: boolean;
    /** Chat answered by a person from the admin area. */
    liveChat: boolean;
    /** Sign-up is for women, with admin approval before members-only features. */
    womenOnly: boolean;
  };
  /**
   * How women-only sign-up checks gender before admin approval:
   * "declaration": she chooses her gender from a list (default).
   * "sa-id": she enters her South African ID number, which is checked.
   */
  womenVerification?: "declaration" | "sa-id";
  /**
   * "bar": logo left, links across the top, menu button on phones.
   * "centered": menu button left, logo centred, one call to action right.
   */
  headerLayout?: "bar" | "centered";
  /** Menu order as a list of paths; items whose feature is off are skipped. */
  navOrder?: string[];
  toolkit?: {
    /** Menu label, e.g. "Toolkit". */
    label: string;
    headline: string;
    intro: string;
  };
  meetingRoom?: {
    headline: string;
    intro: string;
  };
  /** Optional "why we exist" section: the problem and how the site answers it. */
  problem?: {
    headline: string;
    points: string[];
    answer: string;
  };
  /** Extra decorative colours from the brand palette. */
  palette?: string[];
  hero: {
    eyebrow: string;
    /** Wrap words in _underscores_ to set them in the accent italic. */
    headline: string;
    subheadline: string;
    /** Optional hero picture in /public. */
    image?: { src: string; alt: string; width: number; height: number };
  };
  stats: { value: string; label: string }[];
  about: {
    headline: string;
    paragraphs: string[];
    values: { title: string; text: string }[];
    /** Optional "who we serve" closing statement. */
    audience?: { title: string; text: string };
    /** Number the values (01, 02, 03) when they are a sequence. */
    numberedValues?: boolean;
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
