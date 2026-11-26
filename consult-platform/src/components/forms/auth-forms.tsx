"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { brand } from "@/config/brand";
import {
  requestPasswordReset,
  signIn,
  signUp,
  submitIdForVerification,
  updatePassword,
  updateProfile,
} from "@/lib/actions/auth";
import { idleState, type Profile } from "@/lib/types";
import { ConsentField, FormMessage, SubmitButton, TextField } from "./fields";

function useNext(): string {
  return useSearchParams().get("next") ?? "";
}

const withNext = (path: string, next: string) =>
  next ? `${path}?next=${encodeURIComponent(next)}` : path;

export function LoginForm() {
  const [state, action] = useActionState(signIn, idleState);
  const params = useSearchParams();
  const next = useNext();
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {params.get("error") === "link" && state.status === "idle" && (
        <FormMessage
          state={{
            status: "error",
            message: "That link is invalid or has expired. Please sign in or request a new one.",
          }}
        />
      )}
      <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={e.password}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Signing in…" className="w-full">
        Sign in
      </SubmitButton>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
        <Link href={withNext("/register", next)} className="text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(signUp, idleState);
  const next = useNext();
  const e = state.fieldErrors ?? {};
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <TextField label="Full name" name="full_name" autoComplete="name" error={e.full_name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={10}
        hint="At least 10 characters."
        error={e.password}
      />
      {brand.features.womenOnly && <IdNumberField error={e.id_number} />}
      <ConsentField
        error={e.consent}
        purpose={
          brand.features.womenOnly
            ? "to create and manage my account, and to confirm that membership is for women"
            : "to create and manage my account"
        }
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Creating account…" className="w-full">
        Create account
      </SubmitButton>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href={withNext("/login", next)} className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, idleState);
  const e = state.fieldErrors ?? {};
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-5">
      <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
      <FormMessage state={state} />
      <SubmitButton className="w-full">Send reset link</SubmitButton>
      <p className="text-sm">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, idleState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={10}
        hint="At least 10 characters."
        error={e.password}
      />
      <TextField
        label="Repeat new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={e.confirm}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving…" className="w-full">
        Save new password
      </SubmitButton>
    </form>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, idleState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <TextField
        label="Full name"
        name="full_name"
        autoComplete="name"
        defaultValue={profile.full_name}
        hint="This is the name printed on your certificates."
        error={e.full_name}
      />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        optional
        defaultValue={profile.phone ?? ""}
        error={e.phone}
      />
      <TextField
        label="Company"
        name="company"
        autoComplete="organization"
        optional
        defaultValue={profile.company ?? ""}
        error={e.company}
      />
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}

function IdNumberField({ error }: { error?: string }) {
  return (
    <TextField
      label="South African ID number"
      name="id_number"
      inputMode="numeric"
      autoComplete="off"
      maxLength={16}
      hint="Membership is for women. We check that the number is valid; we do not store your ID number."
      error={error}
    />
  );
}

/** Lets a signed-in member submit her ID number for review. */
export function VerifyIdForm() {
  const [state, action] = useActionState(submitIdForVerification, idleState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-4">
      <IdNumberField error={e.id_number} />
      <FormMessage state={state} />
      <SubmitButton pendingText="Checking…">Submit for approval</SubmitButton>
    </form>
  );
}
