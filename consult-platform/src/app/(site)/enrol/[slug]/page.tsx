import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { SubmitButton } from "@/components/forms/fields";
import { Section } from "@/components/ui/primitives";
import { enrolInFreeCourse } from "@/lib/actions/learning";
import { requireUser } from "@/lib/auth";
import { getCourseWithOutline } from "@/lib/data/content";
import { getCourseAccess } from "@/lib/data/member";

export const metadata: Metadata = { title: "Enrol", robots: { index: false } };

export default function EnrolPage({ params }: PageProps<"/enrol/[slug]">) {
  return (
    <Section>
      <div className="mx-auto max-w-xl">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Enrol params={params} />
        </Suspense>
      </div>
    </Section>
  );
}

async function Enrol({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseWithOutline(slug);
  if (!course) notFound();
  await requireUser(`/enrol/${slug}`);

  const access = await getCourseAccess(course.id);
  if (access.enrolled) redirect(`/learn/${slug}`);
  if (course.price_cents > 0) redirect(`/checkout/${slug}`);

  return (
    <div className="rounded-brand border border-line bg-bg p-8 text-center">
      <p className="eyebrow">Free course</p>
      <h1 className="mt-3 text-3xl font-semibold">{course.title}</h1>
      <p className="mt-3 text-muted">{course.summary}</p>
      <form action={enrolInFreeCourse} className="mt-8 flex justify-center">
        <input type="hidden" name="slug" value={course.slug} />
        <SubmitButton pendingText="Enrolling…">Enrol and start learning</SubmitButton>
      </form>
    </div>
  );
}
