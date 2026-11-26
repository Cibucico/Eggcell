"use client";

import { ChevronDown } from "lucide-react";
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

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

function NavList({ items, orientation = "horizontal", onNavigate, pathname }: Props & { pathname: string }) {
  const vertical = orientation === "vertical";
  const linkClass = (active: boolean) =>
    cn(
      "block rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
      vertical && "text-lg",
      active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface hover:text-ink",
    );

  return (
    <ul className={cn("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        if (item.children?.length && !vertical) {
          // Desktop: the parent link plus a dropdown that opens on hover or keyboard focus.
          return (
            <li key={item.href} className="group relative">
              <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn(linkClass(active), "inline-flex items-center gap-1")}>
                {item.label}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden />
              </Link>
              <ul className="invisible absolute left-0 top-full z-50 min-w-48 translate-y-1 rounded-2xl border border-line bg-bg p-2 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} onClick={onNavigate} className={linkClass(isActive(pathname, child.href))}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
        return (
          <li key={item.href}>
            <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={linkClass(active)}>
              {item.label}
            </Link>
            {item.children?.length ? (
              <ul className="mb-1 ml-5 mt-1 flex flex-col gap-0.5 border-l border-line pl-3">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      aria-current={isActive(pathname, child.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-full px-3 py-1.5 text-base",
                        isActive(pathname, child.href) ? "text-primary" : "text-muted hover:text-ink",
                      )}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
