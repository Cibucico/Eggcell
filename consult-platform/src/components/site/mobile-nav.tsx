"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { NavItem } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLinks } from "./nav-links";

/**
 * Menu button and the panel it opens. In the "bar" header it shows on phones
 * only; in the "centered" header it is the main menu at every size.
 */
export function MobileNav({
  items,
  showBooking,
  always = false,
}: {
  items: NavItem[];
  showBooking: boolean;
  always?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn(!always && "lg:hidden")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink hover:bg-line"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>
      {open && (
        <div
          id="site-menu"
          className={cn(
            "animate-rise absolute top-full mt-2 rounded-[1.75rem] border border-ink/10 bg-bg p-4 shadow-2xl",
            always ? "inset-x-3 sm:inset-x-5 lg:right-auto lg:w-80" : "inset-x-3 sm:inset-x-5",
          )}
        >
          <nav aria-label="Menu">
            <NavLinks items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-4 grid gap-2 border-t border-line pt-4">
            <ButtonLink href="/dashboard" variant="outline" onClick={() => setOpen(false)} prefetch={false}>
              My account
            </ButtonLink>
            {showBooking && (
              <ButtonLink href="/book" onClick={() => setOpen(false)}>
                Book a consultation
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
