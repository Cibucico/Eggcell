"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { saveLesson } from "@/lib/actions/admin";
import type { Block } from "@/lib/blocks";
import { idleState } from "@/lib/types";
import { BlockBuilder } from "./block-builder";
import { inputClass, Panel } from "./ui";

export function LessonForm({
  lesson,
  blocks,
}: {
  lesson: { id: string; title: string; duration_minutes: number; is_preview: boolean };
  blocks: Block[];
}) {
  const [state, action] = useActionState(saveLesson, idleState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="lesson_id" value={lesson.id} />
      <Panel className="grid gap-5 p-6 sm:grid-cols-[1fr_10rem]">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Lesson title</span>
          <input name="title" defaultValue={lesson.title} required className={inputClass} />
          {errors.title && <span className="mt-1 block text-xs font-medium text-danger">{errors.title}</span>}
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Length (minutes)</span>
          <input
            name="duration_minutes"
            type="number"
            min={0}
            max={600}
            defaultValue={lesson.duration_minutes}
            className={inputClass}
          />
          {errors.duration_minutes && (
            <span className="mt-1 block text-xs font-medium text-danger">{errors.duration_minutes}</span>
          )}
        </label>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="is_preview"
            defaultChecked={lesson.is_preview}
            className="mt-0.5 h-4 w-4 accent-[var(--brand-primary)]"
          />
          <span>
            <span className="font-medium">Free preview</span>
            <span className="block text-xs text-muted">
              Anyone can open this lesson without enrolling. Useful for the first lesson of a paid course.
            </span>
          </span>
        </label>
      </Panel>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Lesson content</h2>
        <BlockBuilder initial={blocks} />
      </div>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-4 border-t border-line bg-bg/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <SubmitButton pendingText="Saving…">Save lesson</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
