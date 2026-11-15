import { ArrowRight, CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SubmitButton } from "@/components/forms/fields";
import { LessonPlayer } from "@/components/training/lesson-player";
import { ButtonLink } from "@/components/ui/button";
import { completeLesson } from "@/lib/actions/learning";
import { toSlides } from "@/lib/blocks";
import { getCourseWithOutline } from "@/lib/data/content";
import { getCourseAccess, getLessonBlocks } from "@/lib/data/member";
import { isSupabaseConfigured } from "@/lib/env";
import type { CourseWithOutline } from "@/lib/types";
import { cn, formatDuration, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Lesson", robots: { index: false } };

export default function LessonPage({ params }: PageProps<"/learn/[slug]/[lessonId]">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading lesson…</p>}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const course = await getCourseWithOutline(slug);
  if (!course) notFound();
  const lessons = course.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = lessons[index];
  const nextLesson = lessons[index + 1];

  const [access, blocks] = await Promise.all([
    isSupabaseConfigured
      ? getCourseAccess(course.id)
      : Promise.resolve({ signedIn: false, enrolled: false, completedLessonIds: [] as string[] }),
    getLessonBlocks(lesson.id),
  ]);
  const completed = new Set(access.completedLessonIds);
  const enrolHref = `/enrol/${course.slug}`;

  let finish: React.ReactNode;
  if (access.enrolled) {
    finish = (
      <form action={completeLesson}>
        <input type="hidden" name="slug" value={course.slug} />
        <input type="hidden" name="lesson_id" value={lesson.id} />
        <SubmitButton pendingText="Saving…">
          {completed.has(lesson.id)
            ? nextLesson
              ? "Next lesson"
              : "Finish"
            : nextLesson
              ? "Complete and continue"
              : "Complete course"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </SubmitButton>
      </form>
    );
  } else if (!isSupabaseConfigured && nextLesson) {
    finish = (
      <ButtonLink href={`/learn/${course.slug}/${nextLesson.id}`}>
        Next lesson
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    );
  } else {
    finish = (
      <ButtonLink href={enrolHref} prefetch={false}>
        {course.price_cents === 0 ? "Enrol free to continue" : `Enrol for ${formatPrice(course.price_cents)}`}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </ButtonLink>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[20rem_1fr]">
      <Outline
        course={course}
        currentId={lesson.id}
        completed={completed}
        unlocked={access.enrolled || !isSupabaseConfigured}
      />
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-10">
        <p className="eyebrow">
          Lesson {index + 1} of {lessons.length}
        </p>
        <h1 className="mt-2 mb-8 text-3xl font-semibold sm:text-4xl">{lesson.title}</h1>
        {blocks ? (
          <LessonPlayer slides={toSlides(blocks)} finish={finish} />
        ) : (
          <div className="rounded-brand border border-line bg-surface p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-2xl font-semibold">This lesson is for enrolled learners</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Enrol in {course.title} to unlock every lesson and earn a certificate of completion.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={enrolHref} prefetch={false}>
                {course.price_cents === 0 ? "Enrol for free" : `Enrol for ${formatPrice(course.price_cents)}`}
              </ButtonLink>
              {!access.signedIn && (
                <ButtonLink
                  href={`/login?next=${encodeURIComponent(`/learn/${course.slug}/${lesson.id}`)}`}
                  variant="outline"
                  prefetch={false}
                >
                  Sign in
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

function Outline({
  course,
  currentId,
  completed,
  unlocked,
}: {
  course: CourseWithOutline;
  currentId: string;
  completed: Set<string>;
  unlocked: boolean;
}) {
  const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const percent = total === 0 ? 0 : Math.round((completed.size / total) * 100);
  return (
    <aside className="no-print border-b border-line bg-surface lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <details className="group lg:hidden">
        <summary className="cursor-pointer px-5 py-3 text-sm font-semibold">Course contents</summary>
        <OutlineBody course={course} currentId={currentId} completed={completed} unlocked={unlocked} percent={percent} />
      </details>
      <div className="hidden lg:block">
        <OutlineBody course={course} currentId={currentId} completed={completed} unlocked={unlocked} percent={percent} />
      </div>
    </aside>
  );
}

function OutlineBody({
  course,
  currentId,
  completed,
  unlocked,
  percent,
}: {
  course: CourseWithOutline;
  currentId: string;
  completed: Set<string>;
  unlocked: boolean;
  percent: number;
}) {
  return (
    <div className="p-5">
      <Link href={`/training/${course.slug}`} className="font-heading text-lg font-semibold leading-snug hover:text-primary">
        {course.title}
      </Link>
      {unlocked && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">{percent}% complete</p>
        </div>
      )}
      <ol className="mt-6 space-y-6">
        {course.modules.map((module, i) => (
          <li key={module.id}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {String(i + 1).padStart(2, "0")} · {module.title}
            </p>
            <ul className="mt-2 space-y-0.5">
              {module.lessons.map((lesson) => {
                const current = lesson.id === currentId;
                const Icon = completed.has(lesson.id)
                  ? CheckCircle2
                  : unlocked
                    ? Circle
                    : lesson.is_preview
                      ? PlayCircle
                      : Lock;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${course.slug}/${lesson.id}`}
                      prefetch={false}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex items-start gap-2.5 rounded-brand px-2.5 py-2 text-sm",
                        current ? "bg-bg font-semibold text-primary shadow-sm" : "hover:bg-bg/60",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          completed.has(lesson.id) ? "text-success" : "text-muted",
                        )}
                        aria-hidden
                      />
                      <span className="flex-1">{lesson.title}</span>
                      <span className="shrink-0 text-xs font-normal text-muted">
                        {formatDuration(lesson.duration_minutes)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
