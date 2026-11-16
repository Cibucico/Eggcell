import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { LessonForm } from "@/components/admin/lesson-form";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { parseBlocks } from "@/lib/blocks";
import { createClient } from "@/lib/supabase/server";

export default async function LessonEditPage({ params }: PageProps<"/admin/lessons/[id]">) {
  const { id } = await params;
  await requireStaff();
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: lesson }, { data: content }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, title, duration_minutes, is_preview, course:courses(id, slug, title)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("lesson_contents").select("blocks").eq("lesson_id", id).maybeSingle(),
  ]);
  if (!lesson) notFound();
  const course = lesson.course as unknown as { id: string; slug: string; title: string };

  return (
    <div className="max-w-4xl">
      <Link
        href={`/admin/courses/${course.id}`}
        prefetch={false}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {course.title}
      </Link>
      <AdminHeader
        title="Edit lesson"
        intro="Build the lesson screen by screen. Save, then use Preview to see it as a learner does (the course must be published)."
        action={
          <ButtonLink href={`/learn/${course.slug}/${lesson.id}`} variant="outline" target="_blank" prefetch={false}>
            Preview
          </ButtonLink>
        }
      />
      <LessonForm lesson={lesson} blocks={parseBlocks(content?.blocks)} />
    </div>
  );
}
