import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { AccessNotice } from "@/components/meeting/parts";
import { RoomView } from "@/components/meeting/room-view";
import { ButtonLink } from "@/components/ui/button";
import { getUpcomingLiveSessions, slugParams } from "@/lib/data/content";
import { externalLinkFor, getLiveSession, meetingAccess, roomWindow } from "@/lib/data/meetings";
import { roomSlug } from "@/lib/jaas";
import { formatSessionTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Meeting room", robots: { index: false } };

export async function generateStaticParams() {
  return slugParams(await getUpcomingLiveSessions());
}

export default function SessionRoomPage({ params }: PageProps<"/meeting-room/[slug]">) {
  if (!brand.features.meetingRoom) notFound();
  return (
    <div className="container-page py-10">
      <Suspense fallback={<p className="text-muted">Opening the room…</p>}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}

async function Room({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const [session, access] = await Promise.all([getLiveSession(slug), meetingAccess()]);
  if (!session) notFound();
  if (access.kind !== "allowed") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-medium tracking-tight">{session.title}</h1>
        <AccessNotice access={access} next={`/meeting-room/${slug}`} />
      </div>
    );
  }
  const window = roomWindow(session.starts_at, session.duration_minutes);
  if (!window.open && !access.moderator) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-medium tracking-tight">{session.title}</h1>
        <p className="mt-3 text-muted">
          The room opens 30 minutes before the session starts: {formatSessionTime(session.starts_at)}.
        </p>
        <ButtonLink href="/meeting-room" variant="outline" className="mt-6" prefetch={false}>
          Back to the meeting room
        </ButtonLink>
      </div>
    );
  }
  return (
    <RoomView
      title={session.title}
      subtitle={formatSessionTime(session.starts_at)}
      room={roomSlug(brand.key, session.slug)}
      externalUrl={await externalLinkFor(session.id)}
      profile={access.profile}
      moderator={access.moderator}
      backHref="/meeting-room"
      backLabel="Meeting room"
    />
  );
}
