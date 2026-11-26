import { serviceIconNames } from "@/components/ui/icon";
import { brand } from "@/config/brand";
import type { BrandConfig } from "@/config/brand.types";

type BrandFeatures = BrandConfig["features"];

/**
 * Describes the content the admin area can manage. One entry here gives a
 * table a list page, a create/edit form, validation and delete, so adding a
 * new kind of content is a matter of describing its fields.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "slug"
  | "number"
  | "money"
  | "boolean"
  | "select"
  | "list"
  | "metrics"
  | "datetime"
  | "url"
  | "code"
  | "blocks";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Show this field as a column on the list page. */
  column?: boolean;
  /** Value for a new record. */
  initial?: string | number | boolean;
  /** Blank number/money fields are saved as empty rather than 0. */
  nullable?: boolean;
  /** Stored in a companion table keyed by this record's id instead of the main table. */
  companion?: boolean;
  max?: number;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  /** "staff" = admins and editors; "admin" = admins only. */
  access: "staff" | "admin";
  titleField: string;
  orderBy: { column: string; ascending: boolean };
  /** Cache tag refreshed on the public site after a change. */
  tag?: string;
  /** Slug source: when the slug is left blank it is made from this field. */
  slugFrom?: string;
  companion?: { table: string; key: string };
  fields: Field[];
  /** Only offered when this brand feature is on (any of them, if several). */
  features?: (keyof BrandFeatures)[];
  /** Follow-up link shown on the edit page, e.g. to a course's lessons. */
  extraLink?: { label: string; href: (id: string) => string };
};

const published: Field = {
  name: "published",
  label: "Published",
  type: "boolean",
  hint: "Only published items are visible on the website.",
  column: true,
  initial: false,
};
const sortOrder: Field = {
  name: "sort_order",
  label: "Display order",
  type: "number",
  hint: "Lower numbers appear first.",
  initial: 0,
};
const slug: Field = {
  name: "slug",
  label: "Web address name",
  type: "slug",
  hint: "Lowercase letters, numbers and hyphens. Leave blank to create it from the title.",
};

export const resources: Resource[] = [
  {
    key: "services",
    table: "services",
    label: "Services",
    singular: "service",
    access: "staff",
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    tag: "services",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, max: 160 },
      slug,
      { name: "summary", label: "Summary", type: "textarea", hint: "One or two sentences for cards and search results.", max: 400 },
      { name: "description", label: "Full description", type: "textarea", hint: "Leave a blank line between paragraphs.", max: 8000 },
      {
        name: "icon",
        label: "Icon",
        type: "select",
        initial: "briefcase",
        options: serviceIconNames.map((value) => ({ value, label: value.replace(/-/g, " ") })),
      },
      { name: "deliverables", label: "What the client receives", type: "list", hint: "One item per line." },
      { name: "price_from_cents", label: "Starting price (R)", type: "money", nullable: true, hint: "Leave blank to show “Priced per project”.", column: true },
      { name: "duration_label", label: "Typical duration", type: "text", hint: "For example: 4–8 weeks", max: 80 },
      { name: "booking_deposit_cents", label: "Consultation deposit (R)", type: "money", initial: 0, hint: "Taken online when a consultation for this service is booked. 0 for none." },
      { name: "featured", label: "Show on the home page", type: "boolean", initial: false },
      sortOrder,
      { ...published, initial: true },
    ],
  },
  {
    key: "team",
    table: "team_members",
    label: "Team",
    singular: "team member",
    access: "staff",
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    tag: "team_members",
    slugFrom: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true, max: 120 },
      slug,
      { name: "role_title", label: "Role", type: "text", column: true, max: 160 },
      { name: "bio", label: "Biography", type: "textarea", max: 4000 },
      { name: "photo_url", label: "Photo link", type: "url", hint: "A link to a square photo. Leave blank to show initials." },
      { name: "credentials", label: "Qualifications", type: "list", hint: "One per line." },
      { name: "linkedin_url", label: "LinkedIn link", type: "url" },
      sortOrder,
      { ...published, initial: true },
    ],
  },
  {
    key: "case-studies",
    features: ["caseStudies"],
    table: "case_studies",
    label: "Case studies",
    singular: "case study",
    access: "staff",
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    tag: "case_studies",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, max: 200 },
      slug,
      { name: "client_name", label: "Client", type: "text", hint: "Use a description if the client is confidential.", max: 160 },
      { name: "industry", label: "Industry", type: "text", column: true, max: 80 },
      { name: "summary", label: "Summary", type: "textarea", max: 600 },
      { name: "challenge", label: "The challenge", type: "textarea", max: 6000 },
      { name: "approach", label: "Our approach", type: "textarea", max: 6000 },
      { name: "outcome", label: "The outcome", type: "textarea", max: 6000 },
      { name: "metrics", label: "Key numbers", type: "metrics", hint: "One per line as: Label | Value. For example: Net margin | +6 pts" },
      sortOrder,
      { ...published, initial: true },
    ],
  },
  {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    access: "staff",
    titleField: "author_name",
    orderBy: { column: "sort_order", ascending: true },
    tag: "testimonials",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true, max: 1200 },
      { name: "author_name", label: "Name", type: "text", required: true, column: true, max: 120 },
      { name: "author_title", label: "Job title", type: "text", max: 160 },
      { name: "company", label: "Company", type: "text", column: true, max: 160 },
      sortOrder,
      { ...published, initial: true },
    ],
  },
  {
    key: "courses",
    features: ["training"],
    table: "courses",
    label: "Courses",
    singular: "course",
    access: "staff",
    titleField: "title",
    orderBy: { column: "sort_order", ascending: true },
    tag: "courses",
    slugFrom: "title",
    extraLink: { label: "Edit modules and lessons", href: (id) => `/admin/courses/${id}` },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, max: 200 },
      slug,
      { name: "summary", label: "Summary", type: "textarea", max: 400 },
      { name: "description", label: "Full description", type: "textarea", hint: "Leave a blank line between paragraphs.", max: 8000 },
      { name: "level", label: "Level", type: "text", initial: "All levels", max: 60 },
      { name: "duration_label", label: "Length", type: "text", hint: "For example: 6 hours", max: 60 },
      {
        name: "format",
        label: "Format",
        type: "select",
        initial: "self_paced",
        options: [
          { value: "self_paced", label: "Self-paced" },
          { value: "live", label: "Live cohort" },
          { value: "hybrid", label: "Hybrid" },
        ],
      },
      { name: "price_cents", label: "Price (R)", type: "money", initial: 0, hint: "0 makes the course free.", column: true },
      { name: "cover_url", label: "Cover image link", type: "url", hint: "A wide image (16:9). Leave blank for the branded placeholder." },
      { name: "outcomes", label: "What learners will be able to do", type: "list", hint: "One per line." },
      { name: "featured", label: "Show on the home page", type: "boolean", initial: false },
      sortOrder,
      published,
    ],
  },
  {
    key: "live-sessions",
    features: ["training", "meetingRoom"],
    table: "live_sessions",
    label: brand.features.meetingRoom ? "Webinars and meetings" : "Live sessions",
    singular: "live session",
    access: "staff",
    titleField: "title",
    orderBy: { column: "starts_at", ascending: false },
    tag: "live_sessions",
    slugFrom: "title",
    companion: { table: "live_session_links", key: "session_id" },
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, max: 200 },
      slug,
      { name: "summary", label: "Summary", type: "textarea", max: 400 },
      { name: "description", label: "Full description", type: "textarea", max: 6000 },
      { name: "presenter", label: "Presenter", type: "text", max: 120 },
      { name: "starts_at", label: "Date and time", type: "datetime", required: true, hint: "South African time.", column: true },
      { name: "duration_minutes", label: "Length (minutes)", type: "number", required: true, initial: 60 },
      { name: "platform", label: "Platform", type: "text", initial: "Zoom", hint: "Zoom, Microsoft Teams, Google Meet…", max: 40 },
      { name: "price_cents", label: "Price (R)", type: "money", initial: 0, hint: "0 makes the session free to register." },
      { name: "capacity", label: "Places available", type: "number", nullable: true, hint: "Leave blank for unlimited." },
      {
        name: "join_url",
        label: "External meeting link",
        type: "url",
        companion: true,
        hint: brand.features.meetingRoom
          ? "Optional. Paste a Teams, Google Meet or Zoom link to hold this session there instead of in the site's meeting room. Only registered members see it."
          : "The Zoom, Teams or Meet link. Only people who have registered can see it.",
      },
      { name: "passcode", label: "Passcode", type: "text", companion: true, max: 60 },
      { name: "recording_url", label: "Recording link", type: "url", companion: true, hint: "Add after the session so registered people can watch again." },
      published,
    ],
  },
  {
    key: "toolkit",
    features: ["toolkit"],
    table: "toolkit_articles",
    label: "Toolkit articles",
    singular: "toolkit article",
    access: "staff",
    titleField: "title",
    orderBy: { column: "category", ascending: true },
    tag: "toolkit_articles",
    slugFrom: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, max: 200 },
      slug,
      {
        name: "category",
        label: "Area",
        type: "select",
        initial: "operations",
        column: true,
        options: [
          { value: "operations", label: "Operations" },
          { value: "marketing", label: "Marketing" },
          { value: "finance", label: "Finance" },
        ],
      },
      { name: "summary", label: "Summary", type: "textarea", hint: "One or two sentences shown in the list.", max: 400 },
      {
        name: "blocks",
        label: "Content",
        type: "blocks",
        hint: "Add text, videos (YouTube or Vimeo links), highlight boxes, quizzes and exercises. A 'New screen' block becomes a section heading.",
      },
      { name: "reading_minutes", label: "Reading time (minutes)", type: "number", initial: 5 },
      { name: "featured", label: "Show on the home page", type: "boolean", initial: false },
      { ...sortOrder, hint: "Reading order within its area. Lower numbers come first." },
      published,
    ],
  },
  {
    key: "discounts",
    features: ["training", "booking"],
    table: "discount_codes",
    label: "Discount codes",
    singular: "discount code",
    access: "admin",
    titleField: "code",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { name: "code", label: "Code", type: "code", required: true, column: true, hint: "3 to 32 letters and numbers, for example LAUNCH20." },
      { name: "description", label: "Internal note", type: "text", max: 200 },
      {
        name: "kind",
        label: "Type",
        type: "select",
        initial: "percent",
        options: [
          { value: "percent", label: "Percentage off" },
          { value: "amount", label: "Rand amount off" },
        ],
      },
      { name: "value", label: "Value", type: "number", required: true, column: true, hint: "Percentage (1 to 100), or the amount off in rand." },
      {
        name: "applies_to",
        label: "Valid for",
        type: "select",
        nullable: true,
        options: [
          { value: "", label: "Everything" },
          { value: "course", label: "Courses only" },
          { value: "live_session", label: "Live sessions only" },
          { value: "consultation", label: "Consultation deposits only" },
        ],
      },
      { name: "max_uses", label: "Maximum uses", type: "number", nullable: true, hint: "Leave blank for unlimited." },
      { name: "expires_at", label: "Expires", type: "datetime", nullable: true, hint: "South African time. Leave blank for no expiry." },
      { name: "active", label: "Active", type: "boolean", initial: true, column: true },
    ],
  },
];

/** Resources that apply to this brand's features. */
export const activeResources = resources.filter(
  (r) => !r.features || r.features.some((f) => brand.features[f]),
);

export function getResource(key: string): Resource | undefined {
  return activeResources.find((r) => r.key === key);
}
