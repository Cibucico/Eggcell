import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { LiveSessionCard } from "@/components/site/live-session-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader, Section } from "@/components/ui/primitives";
import { getUpcomingLiveSessions } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Live sessions",
  description: `Live online sessions with the ${brand.name} team.`,
};

export default async function LivePage() {
  if (!brand.features.training && !brand.features.meetingRoom) notFound();
  const sessions = await getUpcomingLiveSessions();
  return (
    <>
      <PageHeader
        eyebrow="Live sessions"
        title="Join us live"
        intro="Live online sessions with our partners. Register to get the joining link and a place in the room."
      />
      <Section>
        {sessions.length === 0 ? (
          <EmptyState
            title="No live sessions are scheduled right now"
            text="New dates are added regularly. In the meantime, our online courses are available any time."
            action={<ButtonLink href="/training">Browse courses</ButtonLink>}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
