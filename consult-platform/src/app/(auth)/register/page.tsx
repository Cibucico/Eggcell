import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/auth-forms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 mb-8 text-muted">One free account for your courses, live sessions and bookings.</p>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <RegisterForm />
      </Suspense>
    </>
  );
}
