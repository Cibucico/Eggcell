import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { formatDateTime } from "@/lib/utils";
import { inputClass, Panel } from "./ui";

const leadTones = { new: "accent", in_progress: "primary", closed: "neutral" } as const;
const leadLabels = { new: "New", in_progress: "In progress", closed: "Closed" } as const;

export function LeadStatusBadge({ status }: { status: keyof typeof leadTones }) {
  return <Badge tone={leadTones[status]}>{leadLabels[status]}</Badge>;
}

/** One lead with its details on the left and the admin's follow-up form on the right. */
export function LeadCard({
  name,
  email,
  phone,
  createdAt,
  badge,
  details,
  message,
  children,
}: {
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  badge: ReactNode;
  details: [string, string | null | undefined][];
  message?: string | null;
  children: ReactNode;
}) {
  return (
    <Panel className="grid gap-6 p-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{name}</h2>
          {badge}
          <span className="text-xs text-muted">{formatDateTime(createdAt)}</span>
        </div>
        <p className="mt-1 text-sm">
          <a href={`mailto:${email}`} className="break-all text-primary hover:underline">
            {email}
          </a>
          {phone && (
            <>
              {" · "}
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                {phone}
              </a>
            </>
          )}
        </p>
        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {details
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="text-muted">{label}:</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
        </dl>
        {message && (
          <p className="mt-4 whitespace-pre-wrap rounded-brand bg-surface p-4 text-sm leading-relaxed">{message}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </Panel>
  );
}

export function StatusSelect({
  value,
  options,
}: {
  value: string;
  options: [string, string][];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">Status</span>
      <select name="status" defaultValue={value} className={inputClass}>
        {options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NotesField({ value }: { value: string | null }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">Private notes</span>
      <textarea name="admin_notes" defaultValue={value ?? ""} rows={3} className={`${inputClass} resize-y`} />
    </label>
  );
}

export function SaveButton() {
  return (
    <button type="submit" className={buttonClass("primary", "sm")}>
      Save
    </button>
  );
}

export const LEAD_OPTIONS: [string, string][] = [
  ["new", "New"],
  ["in_progress", "In progress"],
  ["closed", "Closed"],
];
