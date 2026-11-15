"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { NavItem } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { NavLinks } from "./nav-links";

export function MobileNav({ items, showBooking }: { items: NavItem[]; showBooking: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-brand text-ink hover:bg-surface"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>
      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-16 border-b border-line bg-bg px-5 pb-6 pt-3 shadow-lg"
        >
          <nav aria-label="Mobile">
            <NavLinks items={items} orientation="vertical" onNavigate={() => setOpen(false)} />
          </nav>
          <div className="mt-4 grid gap-2 border-t border-line pt-4">
            <ButtonLink href="/dashboard" variant="outline" onClick={() => setOpen(false)}>
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
