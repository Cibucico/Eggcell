export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  deliverables: string[];
  price_from_cents: number | null;
  duration_label: string | null;
  booking_deposit_cents: number;
  featured: boolean;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  slug: string;
  name: string;
  role_title: string;
  bio: string;
  photo_url: string | null;
  credentials: string[];
  linkedin_url: string | null;
  sort_order: number;
};

export type Metric = { label: string; value: string };

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  industry: string;
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  metrics: Metric[];
  sort_order: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_title: string;
  company: string;
  sort_order: number;
};

export type CourseFormat = "self_paced" | "live" | "hybrid";

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: string;
  duration_label: string;
  format: CourseFormat;
  price_cents: number;
  cover_url: string | null;
  outcomes: string[];
  featured: boolean;
  sort_order: number;
};

export type LessonOutline = {
  id: string;
  title: string;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
};

export type ModuleOutline = {
  id: string;
  title: string;
  sort_order: number;
  lessons: LessonOutline[];
};

export type CourseWithOutline = Course & { modules: ModuleOutline[] };

export type LiveSession = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  presenter: string;
  starts_at: string;
  duration_minutes: number;
  platform: string;
  price_cents: number;
  capacity: number | null;
  sort_order: number;
};

export type ToolkitCategory = "operations" | "marketing" | "finance";

export type ToolkitArticleSummary = {
  id: string;
  category: ToolkitCategory;
  slug: string;
  title: string;
  summary: string;
  reading_minutes: number;
  featured: boolean;
  sort_order: number;
  /** True when the article includes at least one video. */
  has_video?: boolean;
};

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";
export type LeadStatus = "new" | "in_progress" | "closed";
export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type EnrolmentStatus = "active" | "completed" | "refunded";
export type UserRole = "member" | "editor" | "admin";
export type OrderKind = "course" | "live_session" | "consultation";

export type VerificationStatus = "unverified" | "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  company: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
};

/** Result returned by every form server action. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };
