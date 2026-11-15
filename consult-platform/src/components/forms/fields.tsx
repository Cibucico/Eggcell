"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-brand border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-danger";

function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; name: string; error?: string; hint?: string; optional?: boolean };

const describedBy = (name: string, error?: string, hint?: string) =>
  error ? `${name}-error` : hint ? `${name}-hint` : undefined;

export function TextField({
  label,
  name,
  error,
  hint,
  optional,
  className,
  ...props
}: Common & Omit<ComponentProps<"input">, "name">) {
  return (
    <FieldShell id={name} label={label} error={error} hint={hint} optional={optional}>
      <input
        id={name}
        name={name}
        required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(control, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  optional,
  className,
  ...props
}: Common & Omit<ComponentProps<"textarea">, "name">) {
  return (
    <FieldShell id={name} label={label} error={error} hint={hint} optional={optional}>
      <textarea
        id={name}
        name={name}
        rows={5}
        required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(control, "resize-y", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  error,
  hint,
  optional,
  className,
  children,
  ...props
}: Common & Omit<ComponentProps<"select">, "name">) {
  return (
    <FieldShell id={name} label={label} error={error} hint={hint} optional={optional}>
      <select
        id={name}
        name={name}
        required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(name, error, hint)}
        className={cn(control, "appearance-auto", className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** POPIA consent tick-box. Every form that collects personal details uses it. */
export function ConsentField({ error, purpose }: { error?: string; purpose: string }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={Boolean(error)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-primary)]"
        />
        <span>
          I agree that my details may be used {purpose}, as described in the{" "}
          <Link href="/legal/privacy" className="text-primary underline underline-offset-2">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

/** Hidden trap for bots; real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitButton({
  children,
  pendingText = "Sending…",
  className,
  variant,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" variant={variant} className={className}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? pendingText : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={cn(
        "flex gap-3 rounded-brand border px-4 py-3 text-sm",
        ok ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger",
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <p>{state.message}</p>
    </div>
  );
}
