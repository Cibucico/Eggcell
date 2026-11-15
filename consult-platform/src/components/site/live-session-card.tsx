import { CalendarDays, Clock, Users, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/primitives";
import type { LiveSessionListing } from "@/lib/data/content";
import { formatDuration, formatSessionTime } from "@/lib/utils";

export function LiveSessionCard({ session }: { session: LiveSessionListing }) {
  const full = session.places_left === 0;
  return (
    <Link
      href={`/live/${session.slug}`}
      className="group flex h-full flex-col rounded-brand border border-line bg-bg p-6 transition-colors hover:border-primary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">
          <Video className="h-3 w-3" aria-hidden />
          Live on {session.platform}
        </Badge>
        {full && <Badge tone="danger">Fully booked</Badge>}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug">{session.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{session.summary}</p>
      <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-muted">
        <li className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
          {formatSessionTime(session.starts_at)}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" aria-hidden />
          {formatDuration(session.duration_minutes)}
          {session.presenter && ` · with ${session.presenter}`}
        </li>
        {session.places_left != null && !full && (
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" aria-hidden />
            {session.places_left} {session.places_left === 1 ? "place" : "places"} left
          </li>
        )}
      </ul>
    </Link>
  );
}
