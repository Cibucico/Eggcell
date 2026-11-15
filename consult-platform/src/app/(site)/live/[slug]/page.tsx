import { CalendarDays, CheckCircle2, Clock, Ticket, User, Users, Video } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader, Paragraphs, Section } from "@/components/ui/primitives";
import { cancelLiveRegistration, registerForLiveSession } from "@/lib/actions/learning";
import { getUser } from "@/lib/auth";
import {
  getLiveSession,
  getUpcomingLiveSessions,
  slugParams,
  type LiveSessionListing,
} from "@/lib/data/content";
import { isRegisteredForLiveSession } from "@/lib/data/member";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDuration, formatPrice, formatSessionTime } from "@/lib/utils";

export async function generateStaticParams() {
  return slugParams(await getUpcomingLiveSessions());
}

export async function generateMetadata({ params }: PageProps<"/live/[slug]">): Promise<Metadata> {
  const session = await getLiveSession((await params).slug);
  if (!session) return {};
  return { title: session.title, description: session.summary };
}

const ERRORS: Record<string, string> = {
  full: "Sorry, this session is now fully booked.",
  ended: "This session has already taken place.",
  missing: "This session is no longer available.",
  paid: "This session needs a ticket. Please book your seat below.",
  failed: "We could not register you. Please try again.",
};

export default async function LiveSessionPage({ params, searchParams }: PageProps<"/live/[slug]">) {
  if (!brand.features.training) notFound();
  const session = await getLiveSession((await params).slug);
  if (!session) notFound();

  return (
    <>
      <PageHeader eyebrow={`Live on ${session.platform}`} title={session.title} intro={session.summary} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold">About this session</h2>
            <Paragraphs text={session.description} className="mt-4 text-lg leading-relaxed text-muted" />
          </div>
          <aside className="h-fit rounded-brand border border-line bg-bg p-6 lg:sticky lg:top-24">
            <ul className="space-y-4 text-sm">
              <Detail icon={<CalendarDays className="h-5 w-5" aria-hidden />} label="When">
                {formatSessionTime(session.starts_at)}
              </Detail>
              <Detail icon={<Clock className="h-5 w-5" aria-hidden />} label="Length">
                {formatDuration(session.duration_minutes)}
              </Detail>
              {session.presenter && (
                <Detail icon={<User className="h-5 w-5" aria-hidden />} label="Presented by">
                  {session.presenter}
                </Detail>
              )}
              <Detail icon={<Video className="h-5 w-5" aria-hidden />} label="Where">
                Online, on {session.platform}
              </Detail>
              <Detail icon={<Ticket className="h-5 w-5" aria-hidden />} label="Price">
                {formatPrice(session.price_cents)}
              </Detail>
              {session.places_left != null && (
                <Detail icon={<Users className="h-5 w-5" aria-hidden />} label="Places">
                  {session.places_left === 0 ? "Fully booked" : `${session.places_left} left`}
                </Detail>
              )}
            </ul>
            <div className="mt-6 border-t border-line pt-6">
              <Suspense fallback={<p className="text-sm text-muted">Checking your registration…</p>}>
                <Registration session={session} searchParams={searchParams} />
              </Suspense>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="text-accent">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
    </li>
  );
}

async function Registration({
  session,
  searchParams,
}: {
  session: LiveSessionListing;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isSupabaseConfigured) {
    return (
      <p className="text-sm text-muted">
        Registration is switched off in preview mode. It opens once a database is connected.
      </p>
    );
  }
  const [query, user] = await Promise.all([searchParams, getUser()]);
  const error = typeof query.error === "string" ? ERRORS[query.error] : undefined;
  const hidden = (
    <>
      <input type="hidden" name="slug" value={session.slug} />
      <input type="hidden" name="session_id" value={session.id} />
    </>
  );

  if (!user) {
    const next = encodeURIComponent(`/live/${session.slug}`);
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted">
          {session.price_cents === 0
            ? "Registration is free. Sign in or create an account to get the joining link."
            : "Sign in or create an account to book your seat."}
        </p>
        <ButtonLink href={`/register?next=${next}`} prefetch={false}>
          Create a free account
        </ButtonLink>
        <ButtonLink href={`/login?next=${next}`} variant="outline" prefetch={false}>
          Sign in
        </ButtonLink>
      </div>
    );
  }

  if (await isRegisteredForLiveSession(session.id)) {
    return (
      <div>
        <p className="flex items-center gap-2 font-semibold text-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          You are registered
        </p>
        <p className="mt-2 text-sm text-muted">
          The joining link is on your dashboard and will stay there until the session ends.
        </p>
        <div className="mt-4 grid gap-3">
          <ButtonLink href="/dashboard#live" prefetch={false}>
            Go to my dashboard
          </ButtonLink>
          {session.price_cents === 0 && (
            <form action={cancelLiveRegistration} className="grid">
              {hidden}
              <SubmitButton variant="ghost" pendingText="Cancelling…">
                Cancel my place
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {error && <FormMessage state={{ status: "error", message: error }} />}
      {session.places_left === 0 ? (
        <p className="text-sm text-muted">This session is fully booked.</p>
      ) : session.price_cents > 0 ? (
        <ButtonLink href={`/checkout/live/${session.slug}`} size="lg" prefetch={false}>
          Book your seat for {formatPrice(session.price_cents)}
        </ButtonLink>
      ) : (
        <form action={registerForLiveSession} className="grid">
          {hidden}
          <SubmitButton pendingText="Registering…">Register for free</SubmitButton>
        </form>
      )}
    </div>
  );
}
