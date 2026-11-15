import { CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { getCourseAccess } from "@/lib/data/member";
import { isSupabaseConfigured } from "@/lib/env";
import type { CourseWithOutline } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

function Price({ course }: { course: CourseWithOutline }) {
  return (
    <>
      <p className="font-heading text-3xl font-semibold">{formatPrice(course.price_cents)}</p>
      {course.price_cents > 0 && (
        <p className="mt-1 text-xs text-muted">Once-off payment, VAT included. Access does not expire.</p>
      )}
    </>
  );
}

const firstPreview = (course: CourseWithOutline) =>
  course.modules.flatMap((m) => m.lessons).find((l) => l.is_preview);

/** Shown instantly while the visitor's enrolment status loads. */
export function EnrolPanelFallback({ course }: { course: CourseWithOutline }) {
  const preview = firstPreview(course);
  return (
    <>
      <Price course={course} />
      <div className="mt-5 grid gap-3">
        <ButtonLink href={`/enrol/${course.slug}`} size="lg" prefetch={false}>
          {course.price_cents === 0 ? "Start for free" : "Enrol now"}
        </ButtonLink>
        {preview && (
          <ButtonLink href={`/learn/${course.slug}/${preview.id}`} variant="outline" prefetch={false}>
            Try a free lesson
          </ButtonLink>
        )}
      </div>
    </>
  );
}

/** Enrolled learners see "Continue" instead of the price. */
export async function EnrolPanel({ course }: { course: CourseWithOutline }) {
  if (!isSupabaseConfigured) return <EnrolPanelFallback course={course} />;
  const access = await getCourseAccess(course.id);
  if (!access.enrolled) return <EnrolPanelFallback course={course} />;

  const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const done = access.completedLessonIds.length;
  return (
    <>
      <p className="flex items-center gap-2 font-semibold text-success">
        <CheckCircle2 className="h-5 w-5" aria-hidden />
        You are enrolled
      </p>
      <p className="mt-1 text-sm text-muted">
        {done} of {total} lessons complete
      </p>
      <div className="mt-5 grid">
        <ButtonLink href={`/learn/${course.slug}`} size="lg" prefetch={false}>
          {done === 0 ? "Start the course" : done >= total ? "Review the course" : "Continue learning"}
        </ButtonLink>
      </div>
    </>
  );
}
