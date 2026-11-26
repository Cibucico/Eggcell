import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { AdminNav, type AdminNavGroup } from "@/components/admin/nav";
import { Logo } from "@/components/site/logo";
import { activeResources as resources } from "@/lib/admin/resources";
import { signOut } from "@/lib/actions/auth";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading the admin area…</p>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();
  const isAdmin = profile.role === "admin";

  const content = resources
    .filter((r) => r.access === "staff")
    .map((r) => ({ href: `/admin/content/${r.key}`, label: r.label }));
  const groups: AdminNavGroup[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
    ...(isAdmin
      ? [
          {
            title: "Leads",
            items: [
              { href: "/admin/enquiries", label: "Enquiries" },
              { href: "/admin/bookings", label: "Consultations" },
              { href: "/admin/investors", label: "Investor interest" },
              ...(brand.features.liveChat ? [{ href: "/admin/chat", label: "Chat" }] : []),
            ],
          },
        ]
      : []),
    { title: "Content", items: content },
    ...(isAdmin
      ? [
          {
            title: "Business",
            items: [
              { href: "/admin/orders", label: "Payments" },
              { href: "/admin/content/discounts", label: "Discount codes" },
              { href: "/admin/users", label: brand.features.womenOnly ? "Members" : "Users" },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <aside className="bg-deep text-deep-fg lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between p-5">
          <Logo inverse />
        </div>
        <details className="group px-3 pb-3 lg:hidden">
          <summary className="cursor-pointer rounded-brand px-3 py-2 text-sm font-semibold hover:bg-deep-fg/5">
            Menu
          </summary>
          <div className="pt-3">
            <AdminNav groups={groups} />
          </div>
        </details>
        <div className="hidden px-3 pb-6 lg:block">
          <AdminNav groups={groups} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg px-5 py-3 sm:px-8">
          <p className="text-sm text-muted">
            Signed in as <span className="font-medium text-ink">{profile.full_name || profile.email}</span>
            <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs capitalize">{profile.role}</span>
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted hover:text-ink">
              View website
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-muted hover:text-ink">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="flex-1 bg-surface/50 px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
