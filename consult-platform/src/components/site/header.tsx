import { Suspense } from "react";
import { brand, mainNav } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { getProfile } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  const nav = mainNav();
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
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
