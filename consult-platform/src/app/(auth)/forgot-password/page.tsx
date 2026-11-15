import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Reset your password</h1>
      <p className="mt-2 mb-8 text-muted">Enter your email address and we will send you a link to choose a new password.</p>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </>
  );
}
