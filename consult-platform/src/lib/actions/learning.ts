"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getCourseWithOutline } from "@/lib/data/content";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const uuid = z.uuid();
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Enrols the signed-in user in a free course. Paid courses go through checkout. */
export async function enrolInFreeCourse(formData: FormData) {
  const courseSlug = slug.parse(formData.get("slug"));
  if (!isSupabaseConfigured) redirect(`/training/${courseSlug}`);
  await requireUser(`/enrol/${courseSlug}`);
  const course = await getCourseWithOutline(courseSlug);
  if (!course) redirect("/training");
  if (course.price_cents > 0) redirect(`/checkout/${courseSlug}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("enrol_free", { p_course_id: course.id });
  if (error) throw new Error(`Could not enrol: ${error.message}`);
  redirect(`/learn/${courseSlug}`);
}

/**
 * Marks a lesson complete and moves the learner on: to the next lesson, or to
 * their certificate once the whole course is done.
 */
export async function completeLesson(formData: FormData) {
  const courseSlug = slug.parse(formData.get("slug"));
  const lessonId = uuid.parse(formData.get("lesson_id"));
  const user = await requireUser(`/learn/${courseSlug}/${lessonId}`);
  const course = await getCourseWithOutline(courseSlug);
  if (!course) redirect("/training");

  const lessons = course.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) redirect(`/learn/${courseSlug}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, course_id: course.id },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    );
  // Row level security rejects this for anyone who is not enrolled.
  if (error) redirect(`/training/${courseSlug}`);

  const { data: serial } = await supabase.rpc("issue_certificate", { p_course_id: course.id });
  if (typeof serial === "string" && serial) redirect(`/certificates/${serial}?new=1`);

  const next = lessons[index + 1];
  redirect(next ? `/learn/${courseSlug}/${next.id}` : `/learn/${courseSlug}`);
}

const LIVE_ERRORS: Record<string, string> = {
  SESSION_FULL: "full",
  SESSION_ENDED: "ended",
  SESSION_NOT_FOUND: "missing",
};

export async function registerForLiveSession(formData: FormData) {
  const sessionSlug = slug.parse(formData.get("slug"));
  const sessionId = uuid.parse(formData.get("session_id"));
  if (!isSupabaseConfigured) redirect(`/live/${sessionSlug}`);
  await requireUser(`/live/${sessionSlug}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("register_for_live_session", { p_session_id: sessionId });
  if (error) {
    const reason = Object.entries(LIVE_ERRORS).find(([key]) => error.message.includes(key))?.[1];
    redirect(`/live/${sessionSlug}?error=${reason ?? "failed"}`);
  }
  updateTag("live_sessions");
  redirect(`/live/${sessionSlug}?registered=1`);
}

export async function cancelLiveRegistration(formData: FormData) {
  const sessionSlug = slug.parse(formData.get("slug"));
  const sessionId = uuid.parse(formData.get("session_id"));
  const user = await requireUser(`/live/${sessionSlug}`);
  const supabase = await createClient();
  await supabase
    .from("live_registrations")
    .delete()
    .eq("user_id", user.id)
    .eq("session_id", sessionId);
  updateTag("live_sessions");
  redirect(`/live/${sessionSlug}`);
}
