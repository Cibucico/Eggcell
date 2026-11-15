import { Award, CalendarDays, ExternalLink, GraduationCap, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { signOut } from "@/lib/actions/auth";
import { requireProfile } from "@/lib/auth";
import {
  getMyBookings,
  getMyCertificates,
  getMyCourses,
  getMyLiveSessions,
} from "@/lib/data/member";
import type { BookingStatus } from "@/lib/types";
import { formatDate, formatMoney, formatSessionTime } from "@/lib/utils";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function DashboardPage() {
  return (
    <div className="container-page py-12">
      <Suspense fallback={<p className="text-muted">Loading your account…</p>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const profile = await requireProfile("/dashboard");
  const { training, booking } = brand.features;
  const [courses, live, bookings, certificates] = await Promise.all([
    training ? getMyCourses() : [],
    training ? getMyLiveSessions() : [],
    booking ? getMyBookings() : [],
    training ? getMyCertificates() : [],
  ]);
  const firstName = profile.full_name.split(/\s+/)[0] || "there";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-4xl font-semibold">Welcome, {firstName}</h1>
          <p className="mt-1 text-sm text-muted">{profile.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.role === "admin" && (
            <ButtonLink href="/admin" size="sm" prefetch={false}>
              Admin area
            </ButtonLink>
          )}
          <ButtonLink href="/dashboard/profile" variant="outline" size="sm">
            Edit my details
          </ButtonLink>
          <form action={signOut}>
            <button
              type="submit"
              className="h-9 rounded-brand px-3.5 text-sm font-semibold text-muted hover:bg-surface hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {training && (
        <Panel id="courses" icon={<GraduationCap className="h-5 w-5" aria-hidden />} title="My courses">
          {courses.length === 0 ? (
            <EmptyState
              title="You have not enrolled in a course yet"
              text="Browse the catalogue and start with a free lesson."
              action={<ButtonLink href="/training">Browse courses</ButtonLink>}
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {courses.map((course) => {
                const percent =
                  course.total_lessons === 0
                    ? 0
                    : Math.min(100, Math.round((course.completed_lessons / course.total_lessons) * 100));
                return (
                  <li key={course.course_id} className="rounded-brand border border-line bg-bg p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
                      {course.status === "completed" && <Badge tone="success">Completed</Badge>}
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {course.completed_lessons} of {course.total_lessons} lessons · {percent}%
                    </p>
                    <div className="mt-4">
                      <ButtonLink href={`/learn/${course.slug}`} size="sm" prefetch={false}>
                        {percent === 0 ? "Start" : percent === 100 ? "Review" : "Continue"}
                      </ButtonLink>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {training && (
        <Panel id="live" icon={<Video className="h-5 w-5" aria-hidden />} title="My live sessions">
          {live.length === 0 ? (
            <EmptyState
              title="You are not registered for any live sessions"
              text="Join a live online session with our partners."
              action={<ButtonLink href="/live">See upcoming sessions</ButtonLink>}
            />
          ) : (
            <ul className="space-y-3">
              {live.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-brand border border-line bg-bg p-5"
                >
                  <div>
                    <Link href={`/live/${session.slug}`} className="text-lg font-semibold hover:text-primary">
                      {session.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{formatSessionTime(session.starts_at)}</p>
                    {session.passcode && (
                      <p className="mt-1 text-sm text-muted">
                        Passcode: <span className="font-mono text-ink">{session.passcode}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.join_url ? (
                      <a
                        href={session.join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-brand bg-primary px-3.5 text-sm font-semibold text-primary-fg hover:bg-deep"
                      >
                        Join on {session.platform}
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    ) : (
                      <Badge>Joining link will appear here</Badge>
                    )}
                    {session.recording_url && (
                      <a
                        href={session.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded-brand border border-line px-3.5 text-sm font-semibold hover:border-primary"
                      >
                        Watch recording
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {booking && (
        <Panel id="bookings" icon={<CalendarDays className="h-5 w-5" aria-hidden />} title="My consultations">
          {bookings.length === 0 ? (
            <EmptyState
              title="No consultations booked"
              text="Request a free 30-minute conversation with a partner."
              action={<ButtonLink href="/book">Book a consultation</ButtonLink>}
            />
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-brand border border-line bg-bg p-5"
                >
                  <div>
                    <p className="font-semibold">
                      {formatDate(b.preferred_date)} at {b.preferred_time}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {b.service?.title ?? "General consultation"} ·{" "}
                      {b.mode === "online" ? "Online" : "In person"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <BookingBadge status={b.status} />
                    {b.deposit_cents > 0 &&
                      (b.deposit_paid_at ? (
                        <Badge tone="success">Deposit paid</Badge>
                      ) : (
                        b.status !== "cancelled" && (
                          <ButtonLink href={`/checkout/booking/${b.id}`} size="sm" prefetch={false}>
                            Pay {formatMoney(b.deposit_cents)} deposit
                          </ButtonLink>
                        )
                      ))}
                    {b.status === "confirmed" && b.meeting_link && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-brand bg-primary px-3.5 text-sm font-semibold text-primary-fg hover:bg-deep"
                      >
                        Join meeting
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {training && (
        <Panel id="certificates" icon={<Award className="h-5 w-5" aria-hidden />} title="My certificates">
          {certificates.length === 0 ? (
            <EmptyState
              title="No certificates yet"
              text="Complete every lesson in a course to earn a certificate of completion."
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {certificates.map((c) => (
                <li key={c.serial} className="rounded-brand border border-line bg-bg p-5">
                  <h3 className="text-lg font-semibold leading-snug">{c.course_title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    Issued {formatDate(c.issued_at)} · No. {c.serial}
                  </p>
                  <div className="mt-4">
                    <ButtonLink href={`/certificates/${c.serial}`} variant="outline" size="sm" prefetch={false}>
                      View and print
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </>
  );
}

function Panel({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-12">
      <h2 className="mb-5 flex items-center gap-3 text-2xl font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-brand bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function BookingBadge({ status }: { status: BookingStatus }) {
  const map = {
    requested: ["Awaiting confirmation", "accent"],
    confirmed: ["Confirmed", "success"],
    completed: ["Completed", "neutral"],
    cancelled: ["Cancelled", "danger"],
  } as const;
  const [label, tone] = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}
