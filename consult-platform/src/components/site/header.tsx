import { Suspense } from "react";
import { brand, mainNav } from "@/config/brand";
import { Video } from "lucide-react";
import type { NavItem } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  const nav = mainNav();
  if (brand.headerLayout === "centered") return <CenteredHeader nav={nav} />;
  return (
    <header className="no-print sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 rounded-full border border-ink/10 bg-bg/75 pl-4 pr-2 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:pl-5">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={nav} />
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <Suspense fallback={<AccountLink signedIn={false} />}>
              <AccountSlot />
            </Suspense>
            {brand.features.booking && (
              <ButtonLink href="/book" size="sm">
                Book a consultation
              </ButtonLink>
            )}
          </div>
          <MobileNav items={nav} showBooking={brand.features.booking} />
        </div>
      </div>
    </header>
  );
}

function AccountLink({ signedIn, admin = false }: { signedIn: boolean; admin?: boolean }) {
  if (!signedIn) {
    return (
      <ButtonLink href="/login" variant="ghost" size="sm">
        Sign in
      </ButtonLink>
    );
  }
  return (
    <ButtonLink href={admin ? "/admin" : "/dashboard"} variant="ghost" size="sm">
      {admin ? "Admin" : "My account"}
    </ButtonLink>
  );
}

// Reads the session, so it streams in after the static page shell.
async function AccountSlot() {
  const profile = await getProfile();
  return <AccountLink signedIn={Boolean(profile)} admin={profile?.role === "admin"} />;
}

/** Menu button on the left, logo in the centre, one call to action on the right. */
function CenteredHeader({ nav }: { nav: NavItem[] }) {
  const { meetingRoom, booking } = brand.features;
  return (
    <header className="no-print sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="relative mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-full border border-ink/10 bg-bg/80 px-2 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-center">
          <MobileNav items={nav} showBooking={booking} always />
        </div>
        <Logo />
        <div className="flex items-center justify-end gap-1">
          <span className="hidden md:inline-flex">
            <Suspense fallback={<AccountLink signedIn={false} />}>
              <AccountSlot />
            </Suspense>
          </span>
          {meetingRoom ? (
            <ButtonLink href="/meeting-room" size="sm" className="px-3 sm:px-4" prefetch={false}>
              <Video className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Meeting room</span>
              <span className="sr-only sm:hidden">Meeting room</span>
            </ButtonLink>
          ) : (
            booking && (
              <ButtonLink href="/book" size="sm">
                Book
              </ButtonLink>
            )
          )}
        </div>
      </div>
    </header>
  );
}
