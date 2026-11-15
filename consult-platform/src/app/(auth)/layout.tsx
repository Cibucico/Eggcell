import Link from "next/link";
import { brand } from "@/config/brand";
import { Logo } from "@/components/site/logo";
import { PreviewBanner } from "@/components/site/preview-banner";
import { HeroPattern } from "@/components/ui/primitives";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PreviewBanner />
      <main id="main" className="grid flex-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-deep p-12 text-deep-fg lg:flex lg:flex-col lg:justify-between">
          <HeroPattern />
          <Logo inverse className="relative" />
          <div className="relative">
            <p className="font-heading text-3xl font-semibold leading-snug">{brand.tagline}</p>
            <p className="mt-4 max-w-md text-deep-fg/70">
              Your account gives you access to your courses, live sessions, certificates and
              consultation bookings.
            </p>
          </div>
          <p className="relative text-xs text-deep-fg/50">{brand.legalName}</p>
        </div>
        <div className="flex flex-col justify-center px-5 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-md">
            <Logo className="mb-10 lg:hidden" />
            {children}
            <p className="mt-10 text-sm text-muted">
              <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
                ← Back to the website
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
