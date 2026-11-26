/**
 * Starter content for iNkqubo Consultancy.
 *
 * The toolkit articles are STARTER TEXT written to show the structure: the
 * client will replace them with their own information and add videos in the
 * admin area. Consultation topics and webinars are examples too.
 *
 * Used when no database is connected, and turned into
 * supabase/seed.inkqubo.sql by `npm run seed:sql`.
 */
import type { Block } from "@/lib/blocks";
import type {
  CaseStudy,
  LiveSession,
  Service,
  TeamMember,
  Testimonial,
  ToolkitArticleSummary,
} from "@/lib/types";
import type { SeedCourse } from "./seed";

const id = (group: number, n: number) =>
  `00000000-0000-4000-8000-${String(group).padStart(4, "0")}${String(n).padStart(8, "0")}`;

/** Consultation topics offered on the booking and contact forms. */
export const seedServices: Service[] = [
  {
    id: id(21, 1),
    slug: "starting-your-business",
    title: "Starting your business",
    summary: "Turn an idea into a registered, structured business with a clear first-year plan.",
    description:
      "For women at the very beginning. We help you test the idea, choose the right business structure, register it properly and set out the first steps.",
    icon: "lightbulb",
    deliverables: ["Idea and customer check", "Registration guidance", "First-year action plan"],
    price_from_cents: null,
    duration_label: null,
    booking_deposit_cents: 0,
    featured: true,
    sort_order: 1,
  },
  {
    id: id(21, 2),
    slug: "operations",
    title: "Operations",
    summary: "Simple systems for how work gets done, so the business runs without chaos.",
    description:
      "We look at how you deliver your product or service, where time and money leak out, and set up routines and tools that fit your size.",
    icon: "settings",
    deliverables: ["Process review", "Simple systems and checklists", "Compliance check"],
    price_from_cents: null,
    duration_label: null,
    booking_deposit_cents: 0,
    featured: true,
    sort_order: 2,
  },
  {
    id: id(21, 3),
    slug: "marketing",
    title: "Marketing",
    summary: "Find the right customers and reach them without a big budget.",
    description:
      "We help you understand who buys from you and why, shape your message, and choose the few marketing channels worth your time.",
    icon: "target",
    deliverables: ["Customer profile", "Message and offer", "Low-cost marketing plan"],
    price_from_cents: null,
    duration_label: null,
    booking_deposit_cents: 0,
    featured: true,
    sort_order: 3,
  },
  {
    id: id(21, 4),
    slug: "finance",
    title: "Finance",
    summary: "Understand your numbers, price for profit and get ready for funding.",
    description:
      "We help you separate business and personal money, keep simple records, price properly and prepare the documents funders ask for.",
    icon: "trending-up",
    deliverables: ["Record-keeping set-up", "Pricing review", "Funding readiness"],
    price_from_cents: null,
    duration_label: null,
    booking_deposit_cents: 0,
    featured: true,
    sort_order: 4,
  },
];

/** The client asked for no team section. */
export const seedTeam: TeamMember[] = [];
export const seedCaseStudies: CaseStudy[] = [];
export const seedTestimonials: Testimonial[] = [];
export const seedCourses: SeedCourse[] = [];

export const seedLiveSessions: (LiveSession & { join_url: string })[] = [
  {
    id: id(22, 1),
    slug: "business-clinic-marketing",
    title: "Business Clinic: Marketing on a Small Budget",
    summary:
      "A live session on finding customers without spending much, with time for your own questions.",
    description:
      "We cover the free and low-cost ways to reach customers: WhatsApp Business, Google Business Profile, referrals and simple social media routines.\n\nBring your questions. Raise your hand in the meeting room and we will bring you in.",
    presenter: "iNkqubo Consultancy",
    starts_at: "2027-01-28T18:00:00+02:00",
    duration_minutes: 60,
    platform: "iNkqubo meeting room",
    price_cents: 0,
    capacity: 50,
    sort_order: 1,
    join_url: "",
  },
  {
    id: id(22, 2),
    slug: "finance-basics-for-women-founders",
    title: "Finance Basics for Women Founders",
    summary: "Separate your money, keep simple records and price for profit.",
    description:
      "A practical webinar on the money habits every business needs from the first month. No finance background needed.\n\nWomen from across South Africa join this session. Come ready to meet others building businesses.",
    presenter: "iNkqubo Consultancy",
    starts_at: "2027-02-11T18:00:00+02:00",
    duration_minutes: 75,
    platform: "iNkqubo meeting room",
    price_cents: 0,
    capacity: null,
    sort_order: 2,
    join_url: "",
  },
];

type SeedArticle = ToolkitArticleSummary & { blocks: Block[] };

const text = (markdown: string): Block => ({ type: "text", markdown });
const section = (title: string): Block => ({ type: "slide", title });

export const seedToolkit: SeedArticle[] = [
  // ------------------------------------------------------------ Operations
  {
    id: id(23, 1),
    category: "operations",
    slug: "register-your-business",
    title: "Register your business and stay compliant",
    summary: "The registrations a new South African business needs, and the ones that come later.",
    reading_minutes: 6,
    featured: true,
    sort_order: 1,
    blocks: [
      text(
        "Registering properly makes your business real in the eyes of customers, banks and funders. Most of it can be done online.",
      ),
      section("Start with these"),
      text(
        "- **Register a company with CIPC.** A private company (Pty) Ltd keeps your personal assets separate from the business.\n- **Open a business bank account** in the company's name.\n- **Register with SARS** for income tax. New companies are usually registered automatically when CIPC registration is done; confirm this on SARS eFiling.",
      ),
      section("When the business grows"),
      text(
        "- **VAT** becomes compulsory once your turnover passes the threshold set by SARS. Check sars.gov.za for the current amount.\n- **UIF and PAYE** apply as soon as you employ someone.\n- **B-BBEE**: a small business can usually confirm its status with a sworn affidavit, which many corporate and government buyers ask for.",
      ),
      {
        type: "callout",
        tone: "important",
        title: "Protect personal information",
        text: "If you keep customer names, numbers or ID details, the Protection of Personal Information Act (POPIA) applies. Keep only what you need and store it safely.",
      },
      {
        type: "exercise",
        title: "Your next step",
        text: "Write down which of the registrations above you already have, and the date you will complete the next one.",
      },
    ],
  },
  {
    id: id(23, 2),
    category: "operations",
    slug: "simple-systems",
    title: "Simple systems that save you time",
    summary: "Write down how the work gets done, so it gets done the same way every time.",
    reading_minutes: 5,
    featured: false,
    sort_order: 2,
    blocks: [
      text(
        "A system is simply the way a task is done, written down. Systems let you serve more customers without working longer hours, and let someone else help you.",
      ),
      section("The five processes every business has"),
      text(
        "1. **Getting customers**: how people hear about you and ask to buy.\n2. **Delivering**: making the product or providing the service.\n3. **Getting paid**: quotes, invoices and following up.\n4. **Paying others**: suppliers, rent, staff.\n5. **Admin**: records, compliance and planning.",
      ),
      {
        type: "callout",
        tone: "tip",
        title: "Start small",
        text: "A one-page checklist for each process is enough. Improve it each time something goes wrong.",
      },
      {
        type: "exercise",
        title: "Your next step",
        text: "Choose the process that causes you the most stress and write its steps as a checklist this week.",
      },
    ],
  },

  // ------------------------------------------------------------- Marketing
  {
    id: id(23, 3),
    category: "marketing",
    slug: "know-your-customer",
    title: "Know your customer before you market",
    summary: "Marketing works when you know exactly who you are talking to.",
    reading_minutes: 5,
    featured: true,
    sort_order: 1,
    blocks: [
      text(
        "Trying to sell to everyone usually means selling to no one. Start by describing the one customer you most want to serve.",
      ),
      section("Describe your customer"),
      text(
        "- Who is she or he? Age, location, work, family.\n- What problem do they have that you solve?\n- Where do they spend time, online and in person?\n- What makes them trust a business enough to buy?",
      ),
      section("Turn it into a message"),
      text(
        "Write one sentence: *I help [customer] to [result] without [the thing they worry about].* Use it on your social media, flyers and when you introduce yourself.",
      ),
      {
        type: "exercise",
        title: "Your next step",
        text: "Speak to three real customers this week. Ask why they bought from you and write down their exact words.",
      },
    ],
  },
  {
    id: id(23, 4),
    category: "marketing",
    slug: "marketing-on-a-small-budget",
    title: "Marketing on a small budget",
    summary: "Free and low-cost ways to reach customers in your area and online.",
    reading_minutes: 6,
    featured: false,
    sort_order: 2,
    blocks: [
      text("You do not need a big budget to be seen. You need consistency."),
      section("Free tools worth setting up"),
      text(
        "- **WhatsApp Business**: a business profile, catalogue and quick replies.\n- **Google Business Profile**: shows your business on Google Maps and search.\n- **One social media platform** where your customers already are. Post on it every week.",
      ),
      section("Word of mouth"),
      text(
        "Happy customers are your best marketing. Ask for a review after every sale, and thank people who refer others to you.",
      ),
      {
        type: "exercise",
        title: "Your next step",
        text: "Set up one free tool from the list above and ask three customers for a review.",
      },
    ],
  },

  // --------------------------------------------------------------- Finance
  {
    id: id(23, 5),
    category: "finance",
    slug: "separate-business-and-personal-money",
    title: "Separate your business and personal money",
    summary: "The first money habit every business needs, and how to pay yourself.",
    reading_minutes: 5,
    featured: true,
    sort_order: 1,
    blocks: [
      text(
        "When business and personal money share one account, you cannot tell whether the business is making a profit. Separating them is the first step to growing.",
      ),
      section("Three habits"),
      text(
        "1. **Use a business bank account** for every business payment in and out.\n2. **Pay yourself a fixed amount** each month instead of taking money when you need it.\n3. **Keep every slip and invoice**, even as photos on your phone.",
      ),
      {
        type: "callout",
        tone: "tip",
        title: "Why funders care",
        text: "Banks and funders ask for bank statements. A clean business account shows them your business is real and well run.",
      },
      {
        type: "exercise",
        title: "Your next step",
        text: "Decide on the fixed amount you will pay yourself each month and write it down.",
      },
    ],
  },
  {
    id: id(23, 6),
    category: "finance",
    slug: "price-for-profit",
    title: "Price for profit",
    summary: "Know your costs, then set a price that pays you and grows the business.",
    reading_minutes: 6,
    featured: false,
    sort_order: 2,
    blocks: [
      text(
        "Many businesses are busy but not profitable, because the price does not cover all the costs. Pricing starts with knowing your costs.",
      ),
      section("Work out your costs"),
      text(
        "- **Direct costs**: materials and anything spent on each item or job.\n- **Running costs**: rent, data, transport, your own salary, spread across the month.\n- **Profit**: the amount left to grow the business. It is not optional.",
      ),
      section("A simple formula"),
      text(
        "Price = direct cost per item + share of running costs per item + profit. Then compare with what customers pay elsewhere, and explain clearly why yours is worth it.",
      ),
      {
        type: "exercise",
        title: "Your next step",
        text: "Work out the full cost of your best-selling product or service. Is your price covering it?",
      },
    ],
  },
];
