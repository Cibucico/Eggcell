import { CalendarDays, Clock, Video } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { AccessNotice, RoomFeatures, SetupNotice } from "@/components/meeting/parts";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Section } from "@/components/ui/primitives";
import { getUpcomingLiveSessions } from "@/lib/data/content";
import { meetingAccess, roomWindow } from "@/lib/data/meetings";
import { isJaasConfigured } from "@/lib/jaas";
import { formatDuration, formatSessionTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Meeting room",
  description: brand.meetingRoom?.intro,
};

export default function MeetingRoomPage() {
  if (!brand.features.meetingRoom) notFound();
  return (
    <>
      <PageHeader eyebrow="Meeting room" title={brand.meetingRoom?.headline ?? "Meeting room"} intro={brand.meetingRoom?.intro} />
      <Section>
        <Suspense fallback={<p className="text-muted">Checking your membership…</p>}>
          <Rooms />
        </Suspense>
      </Section>
      <Section tone="surface">
        <h2 className="mb-8 text-3xl font-medium tracking-tight">In the room you can</h2>
        <RoomFeatures />
      </Section>
    </>
  );
}

async function Rooms() {
  await connection();
  const [access, sessions] = await Promise.all([meetingAccess(), getUpcomingLiveSessions()]);
  const allowed = access.kind === "allowed";

  return (
    <div className="space-y-8">
      <AccessNotice access={access} next="/meeting-room" />
      {allowed && !isJaasConfigured && <SetupNotice />}
      <div>
        <h2 className="mb-6 text-3xl font-medium tracking-tight">Upcoming webinars and meetings</h2>
        {sessions.length === 0 ? (
          <EmptyState title="Nothing scheduled yet" text="New webinars and business clinics are announced here." />
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => {
              const window = roomWindow(session.starts_at, session.duration_minutes);
              const canEnter = allowed && (window.open || (access.kind === "allowed" && access.moderator));
              return (
                <li
                  key={session.id}
                  className="flex flex-col gap-5 rounded-brand border border-line bg-bg p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CalendarDays className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {formatSessionTime(session.starts_at)}
                      </p>
                      <Link href={`/live/${session.slug}`} className="mt-1 block text-xl font-semibold hover:text-primary">
                        {session.title}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                        <Clock className="h-4 w-4" aria-hidden />
                        {formatDuration(session.duration_minutes)}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {canEnter ? (
                      <ButtonLink href={`/meeting-room/${session.slug}`} prefetch={false}>
                        <Video className="h-4 w-4" aria-hidden />
                        Enter the room
                      </ButtonLink>
                    ) : allowed ? (
                      <span className="inline-flex rounded-full bg-surface px-4 py-2 text-sm text-muted">
                        Opens 30 minutes before the start
                      </span>
                    ) : (
                      <ButtonLink href={`/live/${session.slug}`} variant="outline" prefetch={false}>
                        Details
                      </ButtonLink>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
