import { ButtonLink } from "@/components/ui/button";
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
        <ButtonLink href={`/enrol/${course.slug}`} size="lg">
          {course.price_cents === 0 ? "Start for free" : "Enrol now"}
        </ButtonLink>
        {preview && (
          <ButtonLink href={`/learn/${course.slug}/${preview.id}`} variant="outline">
            Watch a free lesson
          </ButtonLink>
        )}
      </div>
    </>
  );
}

// Enrolment status is added in the accounts phase; until then every visitor
// sees the standard enrol button.
export async function EnrolPanel({ course }: { course: CourseWithOutline }) {
  return <EnrolPanelFallback course={course} />;
}
