import "server-only";
import { starter } from "@/content";
import { getUser } from "@/lib/auth";
import { parseBlocks, type Block } from "@/lib/blocks";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, EnrolmentStatus, LiveSession } from "@/lib/types";

/**
 * Data that belongs to the signed-in user. Every query runs with the user's
 * own session, so the database's row level security decides what comes back.
 */

export type MyCourse = {
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  status: EnrolmentStatus;
  total_lessons: number;
  completed_lessons: number;
};

export async function getMyCourses(): Promise<MyCourse[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const [enrolments, progress] = await Promise.all([
    supabase
      .from("enrolments")
      .select("status, created_at, course:courses(id, slug, title, summary, lessons(count))")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .order("created_at", { ascending: false }),
    supabase.from("lesson_progress").select("course_id").eq("user_id", user.id),
  ]);
  if (enrolments.error) throw new Error(`Could not load your courses: ${enrolments.error.message}`);

  const done = new Map<string, number>();
  for (const row of progress.data ?? []) {
    done.set(row.course_id, (done.get(row.course_id) ?? 0) + 1);
  }
  type Row = {
    status: EnrolmentStatus;
    course: { id: string; slug: string; title: string; summary: string; lessons: { count: number }[] } | null;
  };
  return (enrolments.data as unknown as Row[])
    .filter((row) => row.course)
    .map((row) => ({
      course_id: row.course!.id,
      slug: row.course!.slug,
      title: row.course!.title,
      summary: row.course!.summary,
      status: row.status,
      total_lessons: row.course!.lessons[0]?.count ?? 0,
      completed_lessons: done.get(row.course!.id) ?? 0,
    }));
}

/** Whether the signed-in user may take this course, and which lessons they have finished. */
export async function getCourseAccess(
  courseId: string,
): Promise<{ signedIn: boolean; enrolled: boolean; completedLessonIds: string[] }> {
  const user = await getUser();
  if (!user) return { signedIn: false, enrolled: false, completedLessonIds: [] };
  const supabase = await createClient();
  const [enrolment, progress] = await Promise.all([
    supabase
      .from("enrolments")
      .select("status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .in("status", ["active", "completed"])
      .maybeSingle(),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("course_id", courseId),
  ]);
  return {
    signedIn: true,
    enrolled: Boolean(enrolment.data),
    completedLessonIds: (progress.data ?? []).map((row) => row.lesson_id),
  };
}

/**
 * The content of a lesson, or null when the viewer is not entitled to it.
 * Entitlement (free preview, or enrolled) is enforced by the database.
 * In preview mode the sample lessons are all open.
 */
export async function getLessonBlocks(lessonId: string): Promise<Block[] | null> {
  if (!isSupabaseConfigured) {
    const lesson = starter.seedCourses
      .flatMap((c) => c.modules)
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lessonId);
    return lesson ? lesson.blocks : null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_contents")
    .select("blocks")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw new Error(`Could not load the lesson: ${error.message}`);
  return data ? parseBlocks(data.blocks) : null;
}

export type MyBooking = {
  id: string;
  preferred_date: string;
  preferred_time: string;
  mode: "online" | "in_person";
  status: BookingStatus;
  meeting_link: string | null;
  deposit_cents: number;
  deposit_paid_at: string | null;
  service: { title: string } | null;
};

export async function getMyBookings(): Promise<MyBooking[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, preferred_date, preferred_time, mode, status, meeting_link, deposit_cents, deposit_paid_at, service:services(title)")
    .eq("user_id", user.id)
    .order("preferred_date", { ascending: false })
    .limit(20);
  if (error) throw new Error(`Could not load your bookings: ${error.message}`);
  return data as unknown as MyBooking[];
}

export type MyCertificate = { serial: string; course_title: string; issued_at: string };

export async function getMyCertificates(): Promise<MyCertificate[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("serial, course_title, issued_at")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });
  if (error) throw new Error(`Could not load your certificates: ${error.message}`);
  return data;
}

export type MyLiveSession = LiveSession & {
  join_url: string | null;
  passcode: string | null;
  recording_url: string | null;
};

export async function getMyLiveSessions(): Promise<MyLiveSession[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_registrations")
    .select(
      "session:live_sessions(id, slug, title, summary, description, presenter, starts_at, duration_minutes, platform, price_cents, capacity, sort_order, link:live_session_links(join_url, passcode, recording_url))",
    )
    .eq("user_id", user.id);
  if (error) throw new Error(`Could not load your live sessions: ${error.message}`);

  type Link = { join_url: string; passcode: string | null; recording_url: string | null };
  type Row = { session: (LiveSession & { link: Link | Link[] | null }) | null };
  return (data as unknown as Row[])
    .filter((row) => row.session)
    .map(({ session }) => {
      const { link, ...rest } = session!;
      const l = Array.isArray(link) ? link[0] : link;
      return {
        ...rest,
        join_url: l?.join_url || null,
        passcode: l?.passcode ?? null,
        recording_url: l?.recording_url ?? null,
      };
    })
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function isRegisteredForLiveSession(sessionId: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_registrations")
    .select("session_id")
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .maybeSingle();
  return Boolean(data);
}
