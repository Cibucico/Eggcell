import type { BrandConfig } from "../brand.types";

/**
 * Default demo brand: a fictional consultancy.
 * Copy this file to create a new client brand, then select it with
 * NEXT_PUBLIC_BRAND=<key>.
 */
export const meridian: BrandConfig = {
  key: "meridian",
  name: "Meridian Advisory",
  legalName: "Meridian Advisory (Pty) Ltd",
  tagline: "Strategy, funding and training for growing businesses",
  description:
    "Meridian Advisory helps South African businesses plan, fund and run their next stage of growth, through hands-on consulting and practical online training.",
  monogram: "M",
  contact: {
    email: "hello@meridianadvisory.example",
    phone: "+27 11 000 0000",
    whatsapp: "27110000000",
    addressLines: ["Sandton, Johannesburg", "South Africa"],
    hours: "Monday to Friday, 08:00 to 17:00",
  },
  social: {
    linkedin: "https://www.linkedin.com/",
  },
  theme: {
    primary: "#14324f",
    primaryForeground: "#ffffff",
    deep: "#0b1f33",
    deepForeground: "#f4f1ea",
    accent: "#c8963e",
    accentForeground: "#1c1405",
    background: "#fbfaf7",
    surface: "#f3f0e9",
    ink: "#14202b",
    muted: "#55616d",
    line: "#ddd8cc",
    radius: "0.375rem",
    headingFont: "serif",
  },
  features: {
    training: true,
    investors: true,
    booking: true,
    caseStudies: true,
    googleSignIn: false,
  },
  hero: {
    eyebrow: "Business consulting and training",
    headline: "Clear advice for the decisions that shape your business",
    subheadline:
      "We help owners and leadership teams set strategy, raise funding and build operations that scale. Then we teach your people to do it themselves.",
  },
  stats: [
    { value: "15+", label: "Years advising growing businesses" },
    { value: "120", label: "Engagements delivered" },
    { value: "R240m", label: "Funding raised for clients" },
    { value: "1,800", label: "Managers trained" },
  ],
  about: {
    headline: "Senior advisers who stay until the work is done",
    paragraphs: [
      "Meridian Advisory was founded on a simple observation: growing businesses rarely lack ideas. They lack time, structure and someone experienced to think alongside.",
      "We keep the firm deliberately small. Every engagement is led by a partner, and the people you meet at the start are the people who do the work.",
      "Our training programmes come from the same place. They are the frameworks we use with clients, taught in plain language so your team can apply them without us.",
    ],
    values: [
      {
        title: "Evidence before opinion",
        text: "We start with your numbers and your customers, and we show our working.",
      },
      {
        title: "Plain language",
        text: "If a recommendation cannot be explained simply, it is not ready.",
      },
      {
        title: "Built to last",
        text: "We design changes your team can run without us, and we teach them how.",
      },
    ],
  },
  investors: {
    headline: "Partner with us to scale advisory and training across Africa",
    summary:
      "We are building a platform that makes senior business advice and practical management training affordable for the small and medium businesses that create most of the continent's jobs.",
    highlights: [
      {
        title: "Proven demand",
        text: "A consulting practice with repeat clients and a growing base of paying learners.",
      },
      {
        title: "Scalable model",
        text: "Online training turns consulting expertise into recurring, high-margin revenue.",
      },
      {
        title: "Experienced team",
        text: "Partners with decades of combined experience in finance, operations and governance.",
      },
    ],
    useOfFunds: [
      { label: "Course development", percent: 40 },
      { label: "Technology platform", percent: 25 },
      { label: "Sales and marketing", percent: 25 },
      { label: "Working capital", percent: 10 },
    ],
    disclaimer:
      "This page is for information only and is not an offer to sell securities or a solicitation of investment. Any investment will be made only through formal agreements after due diligence.",
  },
  legal: {
    registrationNumber: "0000/000000/07",
    informationOfficer: "The Managing Partner",
    informationOfficerEmail: "privacy@meridianadvisory.example",
    jurisdiction: "the Republic of South Africa",
  },
  bookingTimes: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
};
