import { ArrowDown, ArrowLeft, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminHeader, Feedback, inputClass, Panel } from "@/components/admin/ui";
import { buttonClass, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import {
  addLesson,
  addModule,
  deleteLesson,
  deleteModule,
  moveItem,
  renameModule,
} from "@/lib/actions/admin";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/utils";

type Lesson = { id: string; title: string; duration_minutes: number; is_preview: boolean; sort_order: number };
type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] };

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

function MoveButtons({
  courseId,
  itemId,
  table,
  first,
  last,
}: {
  courseId: string;
  itemId: string;
  table: "lessons" | "course_modules";
  first: boolean;
  last: boolean;
}) {
  const button = "flex h-8 w-8 items-center justify-center rounded-brand text-muted hover:bg-surface hover:text-ink disabled:opacity-30";
  return (
    <form action={moveItem} className="flex">
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="table" value={table} />
      <button type="submit" name="direction" value="up" disabled={first} aria-label="Move up" className={button}>
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
      <button type="submit" name="direction" value="down" disabled={last} aria-label="Move down" className={button}>
        <ArrowDown className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

export default async function CourseStructurePage({ params, searchParams }: PageProps<"/admin/courses/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  await requireStaff();
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, slug, title, published, modules:course_modules(id, title, sort_order, lessons(id, title, duration_minutes, is_preview, sort_order))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();
  const modules = ([...(course.modules ?? [])] as Module[])
    .sort(bySort)
    .map((m) => ({ ...m, lessons: [...m.lessons].sort(bySort) }));

  return (
    <div className="max-w-4xl">
      <Link
        href={`/admin/content/courses/${course.id}`}
        prefetch={false}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Course details
      </Link>
      <AdminHeader
        title={course.title}
        intro="Modules group lessons into chapters. Open a lesson to build its screens."
        action={
          course.published ? (
            <ButtonLink href={`/training/${course.slug}`} variant="outline" prefetch={false}>
              View on website
            </ButtonLink>
          ) : (
            <Badge>Not published</Badge>
          )
        }
      />
      <Feedback query={query} />

      <div className="space-y-6">
        {modules.map((module, mi) => (
          <Panel key={module.id}>
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
              <span className="font-heading text-lg font-semibold text-accent">
                {String(mi + 1).padStart(2, "0")}
              </span>
              <form action={renameModule} className="flex min-w-0 flex-1 gap-2">
                <input type="hidden" name="course_id" value={course.id} />
                <input type="hidden" name="module_id" value={module.id} />
                <input
                  name="title"
                  defaultValue={module.title}
                  aria-label="Module title"
                  required
                  className={`${inputClass} font-semibold`}
                />
                <button type="submit" className={buttonClass("outline", "sm")}>
                  Rename
                </button>
              </form>
              <MoveButtons
                courseId={course.id}
                itemId={module.id}
                table="course_modules"
                first={mi === 0}
                last={mi === modules.length - 1}
              />
              <form action={deleteModule}>
                <input type="hidden" name="course_id" value={course.id} />
                <input type="hidden" name="module_id" value={module.id} />
                <ConfirmButton message="Delete this module and all of its lessons? This cannot be undone.">
                  <Trash2 className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Delete module</span>
                </ConfirmButton>
              </form>
            </div>

            <ul>
              {module.lessons.map((lesson, li) => (
                <li key={lesson.id} className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2.5">
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    prefetch={false}
                    className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium hover:text-primary"
                  >
                    <Pencil className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <span className="truncate">{lesson.title}</span>
                    {lesson.is_preview && <Badge tone="accent">Free preview</Badge>}
                  </Link>
                  <span className="text-xs text-muted">{formatDuration(lesson.duration_minutes)}</span>
                  <MoveButtons
                    courseId={course.id}
                    itemId={lesson.id}
                    table="lessons"
                    first={li === 0}
                    last={li === module.lessons.length - 1}
                  />
                  <form action={deleteLesson}>
                    <input type="hidden" name="course_id" value={course.id} />
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <ConfirmButton message="Delete this lesson? Learners' progress on it will be removed.">
                      <Trash2 className="h-4 w-4" aria-hidden />
                      <span className="sr-only">Delete lesson</span>
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>

            <form action={addLesson} className="flex flex-wrap gap-2 p-4">
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="module_id" value={module.id} />
              <input name="title" placeholder="New lesson title" aria-label="New lesson title" required className={`${inputClass} min-w-48 flex-1`} />
              <button type="submit" className={buttonClass("outline", "sm", "h-auto")}>
                <Plus className="h-4 w-4" aria-hidden />
                Add lesson
              </button>
            </form>
          </Panel>
        ))}

        <Panel className="p-4">
          <form action={addModule} className="flex flex-wrap gap-2">
            <input type="hidden" name="course_id" value={course.id} />
            <input name="title" placeholder="New module title" aria-label="New module title" required className={`${inputClass} min-w-48 flex-1`} />
            <button type="submit" className={buttonClass("primary", "sm", "h-auto")}>
              <Plus className="h-4 w-4" aria-hidden />
              Add module
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
