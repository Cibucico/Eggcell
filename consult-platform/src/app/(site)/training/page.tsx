import { Award, Laptop, PencilRuler } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { CourseCard } from "@/components/site/cards";
import { EmptyState, PageHeader, Section, SectionHeading } from "@/components/ui/primitives";
import { LiveSessionCard } from "@/components/site/live-session-card";
import { getCourses, getUpcomingLiveSessions } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Online training",
  description: `Practical online business courses from ${brand.name}.`,
};

const points = [
  { icon: Laptop, title: "Learn at your own pace", text: "Short lessons you can fit around work, on any device." },
  { icon: PencilRuler, title: "Apply it as you go", text: "Every lesson ends with an exercise on your own business." },
  { icon: Award, title: "Earn a certificate", text: "Complete a course to receive a verifiable certificate of completion." },
];

export default async function TrainingPage() {
  if (!brand.features.training) notFound();
  const [courses, sessions] = await Promise.all([getCourses(), getUpcomingLiveSessions()]);
  return (
    <>
      <PageHeader
        eyebrow="Online training"
        title="Practical courses taught by practising consultants"
        intro="The same frameworks we use with clients, explained in plain language and built around your own business."
      />
      <Section>
        <ul className="mb-14 grid gap-6 md:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-sans text-base font-semibold tracking-normal">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        {courses.length === 0 ? (
          <EmptyState title="New courses are being prepared" text="Please check back soon." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </Section>
      {sessions.length > 0 && (
        <Section tone="surface" id="live">
          <SectionHeading
            eyebrow="Live sessions"
            title="Join us live"
            intro="Free online sessions with our partners, open to everyone. Register to get the joining link."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
