import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCourseWithOutline } from "@/lib/data/content";
import { getCourseAccess } from "@/lib/data/member";
import { isSupabaseConfigured } from "@/lib/env";

/** Sends the learner to the first lesson they have not finished. */
export default function LearnIndex({ params }: PageProps<"/learn/[slug]">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading your course…</p>}>
      <Resume params={params} />
    </Suspense>
  );
}

async function Resume({ params }: { params: Promise<{ slug: string }> }): Promise<never> {
  const { slug } = await params;
  const course = await getCourseWithOutline(slug);
  if (!course) notFound();
  const lessons = course.modules.flatMap((m) => m.lessons);
  if (lessons.length === 0) redirect(`/training/${slug}`);

  const done = isSupabaseConfigured
    ? new Set((await getCourseAccess(course.id)).completedLessonIds)
    : new Set<string>();
  const next = lessons.find((l) => !done.has(l.id)) ?? lessons[0];
  redirect(`/learn/${slug}/${next.id}`);
}
