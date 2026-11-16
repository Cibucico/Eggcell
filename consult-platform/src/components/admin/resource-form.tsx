"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { saveResource } from "@/lib/actions/admin";
import type { Field } from "@/lib/admin/resources";
import { idleState } from "@/lib/types";
import { inputClass } from "./ui";

export function ResourceForm({
  resourceKey,
  id,
  fields,
  values,
}: {
  resourceKey: string;
  id: string | null;
  fields: Field[];
  values: Record<string, string | boolean>;
}) {
  const [state, action] = useActionState(saveResource, idleState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_resource" value={resourceKey} />
      <input type="hidden" name="_id" value={id ?? ""} />
      {fields.map((field) => {
        const error = errors[field.name];
        const value = values[field.name];
        const describedBy = error ? `${field.name}-error` : field.hint ? `${field.name}-hint` : undefined;
        const common = {
          id: field.name,
          name: field.name,
          "aria-invalid": Boolean(error),
          "aria-describedby": describedBy,
        };

        if (field.type === "boolean") {
          return (
            <div key={field.name}>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  {...common}
                  defaultChecked={value === true}
                  className="mt-0.5 h-4 w-4 accent-[var(--brand-primary)]"
                />
                <span>
                  <span className="font-medium">{field.label}</span>
                  {field.hint && (
                    <span id={`${field.name}-hint`} className="block text-xs text-muted">
                      {field.hint}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        }

        const text = typeof value === "string" ? value : "";
        let control;
        if (field.type === "textarea" || field.type === "list" || field.type === "metrics") {
          control = (
            <textarea {...common} defaultValue={text} rows={field.type === "textarea" ? 5 : 4} className={`${inputClass} resize-y`} />
          );
        } else if (field.type === "select") {
          control = (
            <select {...common} defaultValue={text} className={inputClass}>
              {(field.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        } else {
          control = (
            <input
              {...common}
              defaultValue={text}
              type={
                field.type === "datetime"
                  ? "datetime-local"
                  : field.type === "url"
                    ? "url"
                    : field.type === "number" || field.type === "money"
                      ? "number"
                      : "text"
              }
              min={field.type === "number" || field.type === "money" ? 0 : undefined}
              step={field.type === "money" ? "0.01" : field.type === "number" ? "1" : undefined}
              className={inputClass}
            />
          );
        }

        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium">
              {field.label}
              {!field.required && <span className="ml-1 font-normal text-muted">(optional)</span>}
            </label>
            {control}
            {field.hint && !error && (
              <p id={`${field.name}-hint`} className="mt-1.5 text-xs text-muted">
                {field.hint}
              </p>
            )}
            {error && (
              <p id={`${field.name}-error`} className="mt-1.5 text-xs font-medium text-danger">
                {error}
              </p>
            )}
          </div>
        );
      })}
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving…">{id ? "Save changes" : "Create"}</SubmitButton>
    </form>
  );
}
