import { BarChart3, BookOpen, Check, Clock, Lock, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { EnrolPanel, EnrolPanelFallback } from "@/components/training/enrol-panel";
import { CourseCover } from "@/components/site/cards";
import { Badge, PageHeader, Paragraphs, Section } from "@/components/ui/primitives";
import {
  countLessons,
  getCourseWithOutline,
  getCourses,
  slugParams,
  totalMinutes,
} from "@/lib/data/content";
import { formatDuration } from "@/lib/utils";

export async function generateStaticParams() {
  return slugParams(await getCourses());
}

export async function generateMetadata({
  params,
}: PageProps<"/training/[slug]">): Promise<Metadata> {
  const course = await getCourseWithOutline((await params).slug);
  if (!course) return {};
  return { title: course.title, description: course.summary };
}

const formatLabels = { self_paced: "Self-paced", live: "Live cohort", hybrid: "Hybrid" } as const;

export default async function CoursePage({ params }: PageProps<"/training/[slug]">) {
  if (!brand.features.training) notFound();
  const course = await getCourseWithOutline((await params).slug);
  if (!course) notFound();

  const lessons = countLessons(course);
  const minutes = totalMinutes(course);

  return (
    <>
      <PageHeader eyebrow="Online course" title={course.title} intro={course.summary}>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-deep-fg/80">
          <li className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" aria-hidden />
            {course.level}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" aria-hidden />
            {course.duration_label || formatDuration(minutes)}
          </li>
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" aria-hidden />
            {lessons} {lessons === 1 ? "lesson" : "lessons"}
          </li>
          <li className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-accent" aria-hidden />
            {formatLabels[course.format]}
          </li>
        </ul>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {course.outcomes.length > 0 && (
              <div className="rounded-brand border border-line bg-surface p-6">
                <h2 className="text-xl font-semibold">What you will be able to do</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h2 className="mt-12 text-2xl font-semibold">About this course</h2>
            <Paragraphs text={course.description} className="mt-4 leading-relaxed text-muted" />

            <h2 className="mt-12 text-2xl font-semibold">Course content</h2>
            <div className="mt-5 space-y-4">
              {course.modules.map((module, index) => (
                <details
                  key={module.id}
                  open={index === 0}
                  className="group rounded-brand border border-line bg-bg"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-semibold">
                    <span>
                      <span className="mr-3 text-accent">{String(index + 1).padStart(2, "0")}</span>
                      {module.title}
                    </span>
                    <span className="shrink-0 text-xs font-normal text-muted">
                      {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                  </summary>
                  <ul className="border-t border-line">
                    {module.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-sm last:border-b-0"
                      >
                        <span className="flex items-center gap-3">
                          {lesson.is_preview ? (
                            <PlayCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                          ) : (
                            <Lock className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                          )}
                          {lesson.title}
                          {lesson.is_preview && <Badge tone="accent">Free preview</Badge>}
                        </span>
                        <span className="shrink-0 text-xs text-muted">
                          {formatDuration(lesson.duration_minutes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>

          <aside className="h-fit overflow-hidden rounded-brand border border-line bg-bg lg:sticky lg:top-24">
            <CourseCover course={course} />
            <div className="p-6">
              <Suspense fallback={<EnrolPanelFallback course={course} />}>
                <EnrolPanel course={course} />
              </Suspense>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
