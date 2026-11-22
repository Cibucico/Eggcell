import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { PreviewBanner } from "@/components/site/preview-banner";

export default function LearnLayout({ children }: LayoutProps<"/learn">) {
  return (
    <>
      <PreviewBanner />
      <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-4 px-5">
          <Logo />
          <nav className="flex shrink-0 gap-5 whitespace-nowrap text-sm font-medium text-muted">
            <Link href="/training" className="hidden hover:text-ink sm:inline">
              All courses
            </Link>
            <Link href="/dashboard" className="hover:text-ink" prefetch={false}>
              My account
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
