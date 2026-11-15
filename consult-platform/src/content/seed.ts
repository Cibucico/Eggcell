/**
 * Starter content.
 *
 * Used in two places:
 *  1. Shown on the site when no database is connected (preview mode).
 *  2. Turned into `supabase/seed.sql` by `npm run seed:sql`, so a new client
 *     site starts with the same content and can edit it in the admin area.
 *
 * Everything here is SAMPLE content for a fictional consultancy. Replace it
 * with the client's real services, people and results before going live.
 */
import type {
  CaseStudy,
  CourseWithOutline,
  Service,
  TeamMember,
  Testimonial,
} from "@/lib/types";

export type SeedLesson = {
  id: string;
  title: string;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
  body: string;
  video_url: string | null;
};

export type SeedCourse = Omit<CourseWithOutline, "modules"> & {
  modules: {
    id: string;
    title: string;
    sort_order: number;
    lessons: SeedLesson[];
  }[];
};

const id = (group: number, n: number) =>
  `00000000-0000-4000-8000-${String(group).padStart(4, "0")}${String(n).padStart(8, "0")}`;

export const seedServices: Service[] = [
  {
    id: id(1, 1),
    slug: "business-strategy",
    title: "Business Strategy",
    summary:
      "A clear plan for where to compete, how to win and what to stop doing.",
    description:
      "We work with owners and executive teams to turn ambition into a strategy the whole business can act on. That means an honest look at your market and numbers, a small set of priorities, and a 12-month roadmap with owners and measures.\n\nYou leave with a strategy document your team understands and a quarterly rhythm for reviewing progress.",
    icon: "compass",
    deliverables: [
      "Market and competitor review",
      "Strategy workshop with your leadership team",
      "12-month roadmap with owners and measures",
      "Quarterly review sessions",
    ],
    price_from_cents: 4500000,
    duration_label: "4–8 weeks",
    featured: true,
    sort_order: 1,
  },
  {
    id: id(1, 2),
    slug: "funding-readiness",
    title: "Funding & Investor Readiness",
    summary:
      "Get your business ready to raise: the numbers, the story and the paperwork.",
    description:
      "Most funding applications fail on preparation, not on the idea. We build the financial model, pitch deck and data room that banks, development funders and investors expect to see, and we rehearse the hard questions with you.\n\nWe also help you choose the right kind of money for your stage: debt, equity, grants or a blend.",
    icon: "trending-up",
    deliverables: [
      "Three-year financial model",
      "Investor pitch deck",
      "Data room checklist and review",
      "Funder shortlist and pitch rehearsal",
    ],
    price_from_cents: 3500000,
    duration_label: "3–6 weeks",
    featured: true,
    sort_order: 2,
  },
  {
    id: id(1, 3),
    slug: "operations-improvement",
    title: "Operations Improvement",
    summary:
      "Find where time and money leak out of the business, and fix it.",
    description:
      "We map how work really flows through your business, measure where it stalls, and redesign the process with the people who do the work. The focus is on changes your team can sustain without us.",
    icon: "settings",
    deliverables: [
      "Process map of core operations",
      "Cost and bottleneck analysis",
      "Improvement plan with quick wins",
      "Implementation support for 90 days",
    ],
    price_from_cents: 3000000,
    duration_label: "6–12 weeks",
    featured: true,
    sort_order: 3,
  },
  {
    id: id(1, 4),
    slug: "compliance-governance",
    title: "Compliance & Governance",
    summary:
      "B-BBEE, POPIA and board governance handled properly, without the jargon.",
    description:
      "Compliance should protect the business, not paralyse it. We assess where you stand, close the gaps that carry real risk, and set up simple routines so you stay compliant as you grow.",
    icon: "shield-check",
    deliverables: [
      "Compliance gap assessment",
      "POPIA policies and data register",
      "B-BBEE scorecard planning",
      "Board and governance framework",
    ],
    price_from_cents: 2500000,
    duration_label: "4–6 weeks",
    featured: false,
    sort_order: 4,
  },
  {
    id: id(1, 5),
    slug: "leadership-development",
    title: "Leadership Development",
    summary:
      "Coaching and team programmes for managers stepping up to lead.",
    description:
      "Growing businesses outgrow their management habits. We coach individual leaders and run practical programmes for management teams on decision making, delegation, performance conversations and running effective meetings.",
    icon: "users",
    deliverables: [
      "Leadership assessment",
      "One-to-one executive coaching",
      "Management team programme",
      "Progress review after six months",
    ],
    price_from_cents: 1800000,
    duration_label: "3–6 months",
    featured: false,
    sort_order: 5,
  },
  {
    id: id(1, 6),
    slug: "market-entry",
    title: "Market Entry & Growth",
    summary:
      "Test a new market or product before you commit serious money to it.",
    description:
      "We size the opportunity, talk to real customers, and design a low-cost pilot so that your expansion decision rests on evidence. If the numbers work, we help you build the go-to-market plan.",
    icon: "globe",
    deliverables: [
      "Market sizing and customer research",
      "Pricing and positioning",
      "Pilot design and measurement",
      "Go-to-market plan",
    ],
    price_from_cents: 4000000,
    duration_label: "6–10 weeks",
    featured: false,
    sort_order: 6,
  },
];

export const seedTeam: TeamMember[] = [
  {
    id: id(2, 1),
    slug: "thandi-mokoena",
    name: "Thandi Mokoena",
    role_title: "Managing Partner, Strategy & Funding",
    bio: "Thandi has spent 15 years helping growing businesses plan and fund their next stage. She began her career in corporate finance before moving into advisory work with owner-managed companies across manufacturing, retail and services.",
    photo_url: null,
    credentials: ["CA(SA)", "MBA", "15 years in advisory"],
    linkedin_url: null,
    sort_order: 1,
  },
  {
    id: id(2, 2),
    slug: "david-naidoo",
    name: "David Naidoo",
    role_title: "Partner, Operations & Governance",
    bio: "David leads our operations and governance work. An industrial engineer by training, he has run plants and distribution networks and now helps leadership teams build businesses that run well without heroics.",
    photo_url: null,
    credentials: ["Pr.Eng", "Lean Six Sigma Black Belt", "Certified Director"],
    linkedin_url: null,
    sort_order: 2,
  },
];

export const seedCaseStudies: CaseStudy[] = [
  {
    id: id(3, 1),
    slug: "regional-logistics-turnaround",
    title: "Restoring margin at a regional logistics company",
    client_name: "Regional logistics company",
    industry: "Logistics",
    summary:
      "A family-owned fleet operator was growing revenue while profit fell. We found the cause and rebuilt the pricing model.",
    challenge:
      "Revenue had grown for three years while net margin halved. The owners suspected fuel costs, but had no route-level view of profitability.",
    approach:
      "We built a cost-to-serve model for every route and customer, which showed that a fifth of contracts were loss-making. We renegotiated or exited those contracts, restructured dispatch, and introduced a weekly margin review.",
    outcome:
      "Margin recovered within two quarters and the business secured asset finance for fleet renewal on the strength of the new reporting.",
    metrics: [
      { label: "Net margin", value: "+6 pts" },
      { label: "Loss-making routes", value: "−80%" },
      { label: "Payback", value: "5 months" },
    ],
    sort_order: 1,
  },
  {
    id: id(3, 2),
    slug: "agri-processor-growth-funding",
    title: "Raising growth funding for an agri-processor",
    client_name: "Agri-processing business",
    industry: "Agriculture",
    summary:
      "A profitable processor needed capital for a second line. We prepared the business for funders and ran the process.",
    challenge:
      "The founders had been turned down twice. Their financials were sound, but the application did not explain the growth case or the risks.",
    approach:
      "We rebuilt the financial model, wrote the investment memorandum, organised the data room, and approached a shortlist of development funders and banks suited to the deal size.",
    outcome:
      "The business received two offers and closed a blended debt facility, with the second processing line commissioned on schedule.",
    metrics: [
      { label: "Capital raised", value: "R18m" },
      { label: "Time to close", value: "14 weeks" },
      { label: "Jobs created", value: "40" },
    ],
    sort_order: 2,
  },
  {
    id: id(3, 3),
    slug: "professional-services-popia",
    title: "POPIA compliance for a professional services firm",
    client_name: "Professional services firm",
    industry: "Professional services",
    summary:
      "A 60-person firm holding sensitive client records needed to be compliant, and able to prove it to its own clients.",
    challenge:
      "Client data sat in email, shared drives and personal devices. A large client had made POPIA compliance a condition of contract renewal.",
    approach:
      "We mapped all personal information, wrote practical policies, trained every staff member, and set up an incident response routine.",
    outcome:
      "The firm passed its client's audit and renewed the contract. Compliance is now part of onboarding for new staff.",
    metrics: [
      { label: "Staff trained", value: "100%" },
      { label: "Audit findings", value: "0" },
      { label: "Delivery time", value: "6 weeks" },
    ],
    sort_order: 3,
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: id(4, 1),
    quote:
      "For the first time we can see which customers make us money. That one piece of work changed how we run the business.",
    author_name: "Operations Director",
    author_title: "Operations Director",
    company: "Regional logistics company",
    sort_order: 1,
  },
  {
    id: id(4, 2),
    quote:
      "We had been rejected twice. They rebuilt our case from the numbers up and stayed with us until the money was in the bank.",
    author_name: "Co-founder",
    author_title: "Co-founder",
    company: "Agri-processing business",
    sort_order: 2,
  },
  {
    id: id(4, 3),
    quote:
      "Practical, direct and never condescending. The course gave my managers a shared language for the finances.",
    author_name: "Chief Executive",
    author_title: "Chief Executive",
    company: "Manufacturing group",
    sort_order: 3,
  },
];

export const seedCourses: SeedCourse[] = [
  {
    id: id(5, 1),
    slug: "funding-ready",
    title: "Funding Ready: Prepare Your Business to Raise Capital",
    summary:
      "A step-by-step programme for founders who want to approach banks, funders or investors with confidence.",
    description:
      "This course takes you through everything a funder will ask for. You will build your own financial model, write your pitch and assemble your data room as you go, so that you finish with an application you can actually submit.\n\nIt is designed for owners of established small and medium businesses. No finance background is needed.",
    level: "Intermediate",
    duration_label: "6 hours",
    format: "self_paced",
    price_cents: 249900,
    cover_url: null,
    outcomes: [
      "Choose the right type of funding for your stage",
      "Build a three-year financial model",
      "Write a pitch deck funders want to read",
      "Assemble a complete data room",
    ],
    featured: true,
    sort_order: 1,
    modules: [
      {
        id: id(6, 1),
        title: "Understanding your funding options",
        sort_order: 1,
        lessons: [
          {
            id: id(7, 1),
            title: "Debt, equity and grants: what each really costs",
            duration_minutes: 18,
            is_preview: true,
            sort_order: 1,
            video_url: null,
            body: "## What you will learn\n\nEvery kind of funding has a price. Debt costs interest and needs security. Equity costs ownership and control. Grants cost time and reporting effort.\n\n## The three questions\n\nBefore approaching anyone, answer these:\n\n- How much do you need, and what exactly will it pay for?\n- When will the business be able to repay or return it?\n- What are you prepared to give up in exchange?\n\n## Exercise\n\nWrite a one-page funding brief answering the three questions above. You will use it throughout the course.",
          },
          {
            id: id(7, 2),
            title: "Who funds businesses like yours in South Africa",
            duration_minutes: 22,
            is_preview: false,
            sort_order: 2,
            video_url: null,
            body: "## The funding landscape\n\nSouth African businesses can draw on commercial banks, development finance institutions, enterprise and supplier development programmes, private investors and grant schemes.\n\n## Matching funder to need\n\nEach funder has a mandate: a deal size, a sector focus and a stage they prefer. Applying outside a funder's mandate is the most common reason for rejection.\n\n## Exercise\n\nList five funders whose mandate matches your funding brief.",
          },
        ],
      },
      {
        id: id(6, 2),
        title: "Building your financial case",
        sort_order: 2,
        lessons: [
          {
            id: id(7, 3),
            title: "The three-year financial model",
            duration_minutes: 35,
            is_preview: false,
            sort_order: 1,
            video_url: null,
            body: "## Why funders want a model\n\nA model shows that you understand what drives your revenue and costs, and that the business can service the funding.\n\n## Structure\n\n- Assumptions sheet\n- Income statement\n- Cash flow\n- Balance sheet\n- Funding and repayment schedule\n\n## Exercise\n\nComplete the assumptions sheet for your own business.",
          },
          {
            id: id(7, 4),
            title: "Stress-testing your numbers",
            duration_minutes: 20,
            is_preview: false,
            sort_order: 2,
            video_url: null,
            body: "## Expect the hard questions\n\nFunders will ask what happens if sales come in 20% lower or a major customer pays late.\n\n## Exercise\n\nRun three scenarios through your model: base case, slow sales and delayed payment. Note the lowest cash balance in each.",
          },
        ],
      },
      {
        id: id(6, 3),
        title: "Pitching and closing",
        sort_order: 3,
        lessons: [
          {
            id: id(7, 5),
            title: "Writing the pitch deck",
            duration_minutes: 28,
            is_preview: false,
            sort_order: 1,
            video_url: null,
            body: "## Ten slides\n\nProblem, solution, market, business model, traction, team, competition, financials, the ask, and use of funds.\n\n## Exercise\n\nDraft all ten slides using your funding brief and model.",
          },
          {
            id: id(7, 6),
            title: "The data room and due diligence",
            duration_minutes: 24,
            is_preview: false,
            sort_order: 2,
            video_url: null,
            body: "## What goes in a data room\n\nCompany documents, tax clearance, financial statements, management accounts, key contracts, and compliance certificates.\n\n## Exercise\n\nUse the checklist to assemble your data room and mark any gaps.",
          },
        ],
      },
    ],
  },
  {
    id: id(5, 2),
    slug: "finance-for-managers",
    title: "Finance for Non-Financial Managers",
    summary:
      "Read financial statements, build a budget and make decisions using the numbers.",
    description:
      "Managers make financial decisions every day, often without being taught how the numbers fit together. This course explains the income statement, balance sheet and cash flow in plain language and shows you how to use them.",
    level: "Beginner",
    duration_label: "4 hours",
    format: "self_paced",
    price_cents: 149900,
    cover_url: null,
    outcomes: [
      "Read the three main financial statements",
      "Build and defend a departmental budget",
      "Tell profit from cash",
      "Use margins and ratios to make decisions",
    ],
    featured: true,
    sort_order: 2,
    modules: [
      {
        id: id(6, 4),
        title: "Reading the numbers",
        sort_order: 1,
        lessons: [
          {
            id: id(7, 7),
            title: "The income statement in plain language",
            duration_minutes: 20,
            is_preview: true,
            sort_order: 1,
            video_url: null,
            body: "## Revenue to profit\n\nThe income statement tells the story of a period: what you sold, what it cost to deliver, what it cost to run the business, and what was left.\n\n## Exercise\n\nTake your own department's latest report and identify gross profit and operating profit.",
          },
          {
            id: id(7, 8),
            title: "Why profitable businesses run out of cash",
            duration_minutes: 25,
            is_preview: false,
            sort_order: 2,
            video_url: null,
            body: "## Profit is not cash\n\nA sale on 60-day terms is profit today and cash in two months. Stock you bought is cash out today and a cost only when it sells.\n\n## Exercise\n\nCalculate how many days it takes your business to turn a sale into cash.",
          },
        ],
      },
      {
        id: id(6, 5),
        title: "Using the numbers",
        sort_order: 2,
        lessons: [
          {
            id: id(7, 9),
            title: "Building a budget you can defend",
            duration_minutes: 30,
            is_preview: false,
            sort_order: 1,
            video_url: null,
            body: "## Start from drivers\n\nA good budget starts from what drives the numbers: volumes, prices, headcount and rates.\n\n## Exercise\n\nBuild next quarter's budget for your area from its drivers.",
          },
        ],
      },
    ],
  },
  {
    id: id(5, 3),
    slug: "popia-essentials",
    title: "POPIA Essentials for Small Business",
    summary:
      "A short, free introduction to what the Protection of Personal Information Act requires of you.",
    description:
      "A practical overview of POPIA for owners and managers: what counts as personal information, the eight conditions for lawful processing, and the first five steps every business should take.",
    level: "Beginner",
    duration_label: "1 hour",
    format: "self_paced",
    price_cents: 0,
    cover_url: null,
    outcomes: [
      "Know what counts as personal information",
      "Understand the eight conditions for lawful processing",
      "Take the first five compliance steps",
    ],
    featured: true,
    sort_order: 3,
    modules: [
      {
        id: id(6, 6),
        title: "POPIA in practice",
        sort_order: 1,
        lessons: [
          {
            id: id(7, 10),
            title: "What POPIA covers and who it applies to",
            duration_minutes: 15,
            is_preview: true,
            sort_order: 1,
            video_url: null,
            body: "## The short version\n\nIf your business collects, stores or uses information about identifiable people or companies, POPIA applies to you.\n\n## Personal information\n\nNames, contact details, ID numbers, employment history, financial details and opinions about a person all count.",
          },
          {
            id: id(7, 11),
            title: "The first five steps to take",
            duration_minutes: 20,
            is_preview: false,
            sort_order: 2,
            video_url: null,
            body: "## Five steps\n\n- Appoint and register your Information Officer\n- Map the personal information you hold\n- Publish a privacy notice\n- Secure the information\n- Decide how you will respond to a breach\n\n## Exercise\n\nComplete the one-page data map template for your business.",
          },
        ],
      },
    ],
  },
];
