"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import type { NavItem } from "@/config/brand";
import { cn } from "@/lib/utils";

type Props = {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
};

/**
 * The current page is only known at request time on dynamic routes, so the
 * links render first without a highlight and the active state streams in.
 */
export function NavLinks(props: Props) {
  return (
    <Suspense fallback={<NavList {...props} pathname="" />}>
      <ActiveNavList {...props} />
    </Suspense>
  );
}

function ActiveNavList(props: Props) {
  return <NavList {...props} pathname={usePathname()} />;
}

function NavList({ items, orientation = "horizontal", onNavigate, pathname }: Props & { pathname: string }) {
  return (
    <ul className={cn("flex", orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-1")}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-brand px-3 py-2 text-sm font-medium transition-colors",
                orientation === "vertical" && "text-base",
                active ? "text-primary" : "text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
