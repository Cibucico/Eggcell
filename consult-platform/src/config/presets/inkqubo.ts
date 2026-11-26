import type { BrandConfig } from "../brand.types";

/**
 * iNkqubo Consultancy: a platform for women in business.
 *
 * About text comes from the client's "About Us" document. Contact details and
 * legal details are placeholders until the client provides them; search this
 * file for "PLACEHOLDER".
 */
export const inkqubo: BrandConfig = {
  key: "inkqubo",
  name: "iNkqubo Consultancy",
  legalName: "iNkqubo Consultancy",
  tagline: "From where you are, to where you want to be.",
  description:
    "A space for women to rise, build and lead. iNkqubo Consultancy connects, equips and empowers women in business across South Africa.",
  monogram: "i",
  logoSrc: "/brand/inkqubo/icon-192.png",
  wordmark: { src: "/brand/inkqubo/wordmark.png", width: 677, height: 162 },
  fullLogo: { src: "/brand/inkqubo/logo.png", width: 718, height: 760 },
  icons: {
    s48: "/brand/inkqubo/icon-48.png",
    s180: "/brand/inkqubo/icon-180.png",
    s192: "/brand/inkqubo/icon-192.png",
    s512: "/brand/inkqubo/icon-512.png",
  },
  contact: {
    // PLACEHOLDER: replace with the client's business email once set up.
    email: "hello@inkqubo.example",
    phone: "",
    addressLines: [],
    hours: "Monday to Friday, 08:00 to 17:00",
  },
  social: {},
  // The client's palette: #FFB6C1, #FF69B4, #FF1493, #DB7093, #C71585.
  // The deep tone and text colours are darker shades of the same pinks so
  // that text stays readable.
  theme: {
    primary: "#c71585",
    primaryForeground: "#ffffff",
    deep: "#4a0830",
    deepForeground: "#fff0f6",
    accent: "#ff1493",
    accentForeground: "#2b0618",
    background: "#fff7fa",
    surface: "#ffe8ef",
    ink: "#3b0d27",
    muted: "#7d4c64",
    line: "#ffd0dc",
    radius: "1.25rem",
    headingFont: "serif",
  },
  palette: ["#ffb6c1", "#ff69b4", "#ff1493", "#db7093", "#c71585"],
  features: {
    services: false,
    training: false,
    investors: true,
    booking: true,
    caseStudies: false,
    googleSignIn: false,
    toolkit: true,
    meetingRoom: true,
    liveChat: true,
    womenOnly: true,
  },
  headerLayout: "centered",
  // For now members choose their gender at sign-up; switch to "sa-id" to
  // require a South African ID number instead.
  womenVerification: "declaration",
  navOrder: ["/about", "/toolkit", "/meeting-room", "/investors", "/contact"],
  toolkit: {
    label: "Toolkit",
    headline: "Business know-how, _free_ to read and watch",
    intro:
      "Practical guidance on the three things every business runs on: operations, marketing and finance. Read the notes, watch the videos, then talk to us when you are ready.",
  },
  meetingRoom: {
    headline: "Meet, learn and _connect_, wherever you are",
    intro:
      "Our online meeting room brings women together from across South Africa for webinars, business clinics and consultations. Raise your hand, ask questions and meet other women building businesses.",
  },
  // From the client's notes on the problem the platform solves.
  problem: {
    headline: "Why we _exist_",
    points: [
      "Problems in business are hard to solve alone, without someone to offer another perspective.",
      "Women still have limited access to opportunity and remain marginalised in entrepreneurship.",
      "Women's initiatives, especially in townships, need knowledge, support and room to grow.",
    ],
    answer:
      "Because of this site, a woman starting a business is guided in a clear structure: from operations, to marketing, to finance, with people to ask along the way.",
  },
  hero: {
    eyebrow: "For women in business",
    headline: "A space for women to _rise_, build and lead",
    subheadline:
      "We connect, equip and empower women in business, through accessible business knowledge, expert guidance and meaningful connections.",
    // The client supplied this painting. Confirm the licence allows
    // commercial use before launch.
    image: {
      src: "/brand/inkqubo/hero.jpg",
      alt: "Painting of a woman in a bright orange, red and teal head wrap with gold hoop earrings.",
      width: 626,
      height: 626,
    },
  },
  stats: [],
  about: {
    headline: "A space for women to _rise_, build and lead",
    paragraphs: [
      "We believe women deserve more than a seat at the table; they deserve the opportunity to build the table.",
      "Born from the need to create greater entrepreneurial opportunities for women in South Africa, we are a platform dedicated to connecting, equipping and empowering women in business.",
      "We exist to challenge the barriers that have historically marginalised women in entrepreneurship and create a space where knowledge, opportunity and collaboration thrive.",
    ],
    values: [
      {
        title: "Our Mission",
        text: "To empower women to build, grow and sustain successful businesses through accessible business knowledge, expert guidance and meaningful connections.",
      },
      {
        title: "Our Vision",
        text: "To become a leading network of empowered women entrepreneurs across South Africa, shaping a more inclusive entrepreneurial landscape where women are seen, heard, supported and positioned to thrive.",
      },
      {
        title: "Our Purpose",
        text: "We bring women together through business education, consultation, collaboration and networking, because when women have access to the right knowledge, resources and connections, possibilities become limitless.",
      },
    ],
    audience: {
      title: "Who we serve",
      text: "From aspiring businesswomen and start-up founders to established entrepreneurs and business owners, we create space for every woman ready to turn her ambition into impact.",
    },
  },
  investors: {
    headline: "Back the women building South Africa's _next_ businesses",
    summary:
      "iNkqubo is building a network that gives women entrepreneurs the knowledge, guidance and connections they need to start, grow and sustain their businesses.",
    highlights: [
      {
        title: "Knowledge for everyone",
        text: "A free business toolkit on operations, marketing and finance, in text and video.",
      },
      {
        title: "Guidance when it counts",
        text: "One-to-one consultations, online or in person, for women at every stage of business.",
      },
      {
        title: "A network that connects",
        text: "An online meeting room where women across South Africa learn and build together.",
      },
    ],
    useOfFunds: [],
    disclaimer:
      "This page is for information only and is not an offer to sell securities or a solicitation of investment. Any investment will be made only through formal agreements after due diligence.",
  },
  legal: {
    informationOfficer: "the Information Officer",
    // PLACEHOLDER: replace with the client's privacy contact.
    informationOfficerEmail: "privacy@inkqubo.example",
    jurisdiction: "the Republic of South Africa",
  },
  bookingTimes: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
};
