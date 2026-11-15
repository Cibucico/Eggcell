import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-2 mb-8 text-muted">Enter a new password for your account.</p>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
