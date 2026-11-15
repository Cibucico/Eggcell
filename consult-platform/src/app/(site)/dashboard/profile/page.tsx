import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProfileForm } from "@/components/forms/auth-forms";
import { requireProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My details", robots: { index: false } };

export default function ProfilePage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          My account
        </Link>
        <h1 className="mt-4 mb-8 text-3xl font-semibold">My details</h1>
        <div className="rounded-brand border border-line bg-bg p-6 sm:p-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
            <ProfileSlot />
          </Suspense>
        </div>
        <p className="mt-6 text-sm text-muted">
          To change your password, sign out and use “Forgot your password?” on the sign-in page.
        </p>
      </div>
    </div>
  );
}

async function ProfileSlot() {
  const profile = await requireProfile("/dashboard/profile");
  return <ProfileForm profile={profile} />;
}
