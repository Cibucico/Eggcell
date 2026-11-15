import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  seedCaseStudies,
  seedCourses,
  seedLiveSessions,
  seedServices,
  seedTeam,
  seedTestimonials,
} from "@/content/seed";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  CaseStudy,
  Course,
  CourseWithOutline,
  LiveSession,
  ModuleOutline,
  Service,
  TeamMember,
  Testimonial,
} from "@/lib/types";

/**
 * Public content. Every function is cached and shared between visitors, and
 * tagged so that an edit in the admin area refreshes it straight away.
 * With no database connected, the starter content is served instead.
 */

const SERVICE_COLS =
  "id, slug, title, summary, description, icon, deliverables, price_from_cents, duration_label, featured, sort_order";
const TEAM_COLS = "id, slug, name, role_title, bio, photo_url, credentials, linkedin_url, sort_order";
const CASE_COLS =
  "id, slug, title, client_name, industry, summary, challenge, approach, outcome, metrics, sort_order";
const TESTIMONIAL_COLS = "id, quote, author_name, author_title, company, sort_order";
const COURSE_COLS =
  "id, slug, title, summary, description, level, duration_label, format, price_cents, cover_url, outcomes, featured, sort_order";

function fail(what: string, message: string): never {
  throw new Error(`Could not load ${what}: ${message}`);
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("services");
  if (!isSupabaseConfigured) return seedServices;
  const { data, error } = await createPublicClient()
    .from("services")
    .select(SERVICE_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) fail("services", error.message);
  return data as Service[];
}

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("team_members");
  if (!isSupabaseConfigured) return seedTeam;
  const { data, error } = await createPublicClient()
    .from("team_members")
    .select(TEAM_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) fail("team", error.message);
  return data as TeamMember[];
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("case_studies");
  if (!isSupabaseConfigured) return seedCaseStudies;
  const { data, error } = await createPublicClient()
    .from("case_studies")
    .select(CASE_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) fail("case studies", error.message);
  return (data as CaseStudy[]).map((c) => ({
    ...c,
    metrics: Array.isArray(c.metrics) ? c.metrics : [],
  }));
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const all = await getCaseStudies();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("testimonials");
  if (!isSupabaseConfigured) return seedTestimonials;
  const { data, error } = await createPublicClient()
    .from("testimonials")
    .select(TESTIMONIAL_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) fail("testimonials", error.message);
  return data as Testimonial[];
}

export async function getCourses(): Promise<Course[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");
  if (!isSupabaseConfigured) {
    return seedCourses.map(({ modules: _modules, ...course }) => course);
  }
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) fail("courses", error.message);
  return data as Course[];
}

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

/** A course with its public outline: module and lesson titles, no lesson bodies. */
export async function getCourseWithOutline(slug: string): Promise<CourseWithOutline | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("courses");
  if (!isSupabaseConfigured) {
    const course = seedCourses.find((c) => c.slug === slug);
    if (!course) return null;
    return {
      ...course,
      modules: course.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map(({ blocks: _blocks, ...lesson }) => lesson),
      })),
    };
  }
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(
      `${COURSE_COLS}, modules:course_modules(id, title, sort_order, lessons(id, title, duration_minutes, is_preview, sort_order))`,
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) fail("course", error.message);
  if (!data) return null;
  const course = data as unknown as CourseWithOutline;
  const modules: ModuleOutline[] = [...(course.modules ?? [])]
    .sort(bySort)
    .map((m) => ({ ...m, lessons: [...(m.lessons ?? [])].sort(bySort) }));
  return { ...course, modules };
}

const LIVE_COLS =
  "id, slug, title, summary, description, presenter, starts_at, duration_minutes, platform, capacity, sort_order";

export type LiveSessionListing = LiveSession & { places_left: number | null };

/**
 * Published live sessions that have not finished yet, soonest first.
 * Cached briefly so "places left" stays reasonably current.
 */
export async function getUpcomingLiveSessions(): Promise<LiveSessionListing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("live_sessions");
  if (!isSupabaseConfigured) {
    return seedLiveSessions.map(({ join_url: _join, ...session }) => ({
      ...session,
      places_left: session.capacity,
    }));
  }
  const supabase = createPublicClient();
  // Include sessions that started up to six hours ago so one in progress still shows.
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const [sessions, taken] = await Promise.all([
    supabase
      .from("live_sessions")
      .select(LIVE_COLS)
      .eq("published", true)
      .gte("starts_at", since)
      .order("starts_at"),
    supabase.rpc("live_session_places_taken"),
  ]);
  if (sessions.error) fail("live sessions", sessions.error.message);
  const counts = new Map<string, number>(
    ((taken.data ?? []) as { session_id: string; taken: number }[]).map((row) => [
      row.session_id,
      Number(row.taken),
    ]),
  );
  const now = Date.now();
  return (sessions.data as LiveSession[])
    .filter((s) => new Date(s.starts_at).getTime() + s.duration_minutes * 60_000 > now)
    .map((s) => ({
      ...s,
      places_left: s.capacity == null ? null : Math.max(0, s.capacity - (counts.get(s.id) ?? 0)),
    }));
}

export async function getLiveSession(slug: string): Promise<LiveSessionListing | null> {
  const sessions = await getUpcomingLiveSessions();
  return sessions.find((s) => s.slug === slug) ?? null;
}

export function countLessons(course: CourseWithOutline): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function totalMinutes(course: CourseWithOutline): number {
  return course.modules.reduce(
    (n, m) => n + m.lessons.reduce((x, l) => x + l.duration_minutes, 0),
    0,
  );
}

/**
 * Dynamic routes must prerender at least one path. When there is no content
 * yet, this placeholder is prerendered and resolves to the not-found page.
 */
export function slugParams(items: { slug: string }[]): { slug: string }[] {
  return items.length > 0 ? items.map(({ slug }) => ({ slug })) : [{ slug: "not-available" }];
}
