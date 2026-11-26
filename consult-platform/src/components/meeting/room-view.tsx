import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { JitsiRoom } from "@/components/meeting/jitsi-room";
import { SetupNotice } from "@/components/meeting/parts";
import { createJaasToken, isJaasConfigured, jaasDomain, jaasRoomName, jaasScriptUrl } from "@/lib/jaas";
import type { Profile } from "@/lib/types";

/**
 * One meeting: an external Teams/Meet link when the host set one, otherwise
 * the built-in room with a token signed for this person.
 */
export function RoomView({
  title,
  subtitle,
  room,
  externalUrl,
  profile,
  moderator,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle: string;
  room: string;
  externalUrl: string | null;
  profile: Profile;
  moderator: boolean;
  backHref: string;
  backLabel: string;
}) {
  const name = profile.full_name || profile.email;
  return (
    <div>
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>
      <div className="mb-6 mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        {moderator && !externalUrl && <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">You are hosting</span>}
      </div>
      {externalUrl ? (
        <div className="rounded-brand border border-line bg-surface p-8 text-center">
          <p className="text-lg">This meeting is held on an external platform.</p>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-fg hover:bg-deep"
          >
            Join the meeting
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      ) : isJaasConfigured ? (
        <JitsiRoom
          scriptUrl={jaasScriptUrl}
          domain={jaasDomain}
          roomName={jaasRoomName(room)}
          token={createJaasToken({ id: profile.id, name, email: profile.email, moderator }, room)}
          displayName={name}
          subject={title}
          leaveHref={backHref}
        />
      ) : (
        <SetupNotice />
      )}
    </div>
  );
}
