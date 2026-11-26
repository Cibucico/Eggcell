import { CalendarDays, GraduationCap, Inbox, Landmark, MessageCircle, UserCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { brand } from "@/config/brand";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { activeResources as resources } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";
import { isPayfastConfigured, payfastSandbox } from "@/lib/payfast";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";

type Overview = {
  new_enquiries: number;
  pending_bookings: number;
  new_investor_leads: number;
  members: number;
  active_enrolments: number;
  revenue_cents: number;
  revenue_30d_cents: number;
  pending_verifications: number;
  unread_chats: number;
};

export default async function AdminHome() {
  const profile = await requireStaff();
  const isAdmin = profile.role === "admin";
  const content = resources.filter((r) => r.access === "staff");

  let overview: Overview | null = null;
  if (isAdmin) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("admin_overview");
    overview = data as Overview | null;
  }

  const f = brand.features;
  const stats = overview
    ? [
        ...(f.womenOnly
          ? [{ label: "Members to approve", value: overview.pending_verifications, href: "/admin/users", icon: UserCheck }]
          : []),
        ...(f.liveChat
          ? [{ label: "Unanswered chats", value: overview.unread_chats, href: "/admin/chat", icon: MessageCircle }]
          : []),
        { label: "New enquiries", value: overview.new_enquiries, href: "/admin/enquiries", icon: Inbox },
        { label: "Consultations to confirm", value: overview.pending_bookings, href: "/admin/bookings", icon: CalendarDays },
        { label: "New investor interest", value: overview.new_investor_leads, href: "/admin/investors", icon: Landmark },
        { label: "Registered users", value: overview.members, href: "/admin/users", icon: Users },
        ...(f.training
          ? [{ label: "Course enrolments", value: overview.active_enrolments, href: "/admin/orders", icon: GraduationCap }]
          : []),
        { label: "Sales, last 30 days", value: formatMoney(overview.revenue_30d_cents), href: "/admin/orders", icon: Wallet },
      ]
    : [];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        intro={isAdmin ? "What needs your attention today." : "Manage courses, live sessions and website content."}
      />

      {isAdmin && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map(({ label, value, href, icon: Icon }) => (
              <li key={label}>
                <Link href={href} prefetch={false} className="block rounded-brand border border-line bg-bg p-5 hover:border-primary">
                  <span className="flex h-9 w-9 items-center justify-center rounded-brand bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="font-heading mt-4 text-3xl font-semibold">{value}</p>
                  <p className="mt-1 text-sm text-muted">{label}</p>
                </Link>
              </li>
            ))}
          </ul>
          {overview && (
            <p className="mt-4 text-sm text-muted">Total sales to date: {formatMoney(overview.revenue_cents)}</p>
          )}

          <Panel className="mt-8 p-5">
            <h2 className="text-lg font-semibold">Setup status</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <Status ok={isPayfastConfigured} label="Online payments (PayFast)">
                {isPayfastConfigured
                  ? payfastSandbox
                    ? "Connected in test mode. No real money is taken yet."
                    : "Connected and taking real payments."
                  : "Not connected. Checkout shows “under construction” for paid items."}
              </Status>
              <Status ok={Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)} label="Notification emails">
                {process.env.RESEND_API_KEY && process.env.EMAIL_FROM
                  ? "Connected."
                  : "Not connected. New leads appear here but no email is sent."}
              </Status>
            </ul>
          </Panel>
        </>
      )}

      <h2 className="mt-10 mb-4 text-xl font-semibold">Content</h2>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {content.map((r) => (
          <li key={r.key}>
            <Link
              href={`/admin/content/${r.key}`}
              prefetch={false}
              className="block rounded-brand border border-line bg-bg p-5 font-semibold hover:border-primary"
            >
              {r.label}
              <span className="mt-1 block text-sm font-normal text-muted">Add and edit {r.label.toLowerCase()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Status({ ok, label, children }: { ok: boolean; label: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ok ? "bg-success" : "bg-accent"}`}
      />
      <span>
        <span className="font-medium">{label}:</span> <span className="text-muted">{children}</span>
      </span>
    </li>
  );
}
