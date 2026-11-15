import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted">Sign in to continue your courses and manage your bookings.</p>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </>
  );
}
