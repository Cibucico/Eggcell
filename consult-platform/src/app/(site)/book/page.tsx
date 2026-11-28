import { CalendarCheck, MessagesSquare, Video } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { BookingForm } from "@/components/forms/lead-forms";
import { PageHeader, Section } from "@/components/ui/primitives";
import { getServices } from "@/lib/data/content";
import { dateInSouthAfrica } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book a consultation",
  description: `Request a free 30-minute consultation with ${brand.name}.`,
};

const steps = [
  {
    icon: CalendarCheck,
    title: "Request a time",
    text: "Choose a date and time that suits you. We confirm by email within one business day.",
  },
  {
    icon: Video,
    title: "Meet a consultant",
    text: "A free 30-minute conversation, online or in person, about your business and goals.",
  },
  {
    icon: MessagesSquare,
    title: "Get a clear next step",
    text: "We tell you honestly whether we can help, and send a fixed proposal if so.",
  },
];

export default function BookPage() {
  if (!brand.features.booking) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Book a consultation"
        title="A free first conversation, with no obligation"
        intro="Thirty minutes with one of our consultants to understand your situation and see whether we are the right fit."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-brand border border-line bg-bg p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold">Request your consultation</h2>
            <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
              <BookingFormSlot />
            </Suspense>
          </div>
          <aside>
            <h2 className="text-2xl font-semibold">What happens next</h2>
            <ol className="mt-6 space-y-6">
              {steps.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>
    </>
  );
}

// The earliest bookable day depends on today's date, so this renders per request.
async function BookingFormSlot() {
  await connection();
  const services = (await getServices()).map(({ id, slug, title }) => ({ id, slug, title }));
  return (
    <BookingForm services={services} times={brand.bookingTimes} minDate={dateInSouthAfrica(1)} />
  );
}
