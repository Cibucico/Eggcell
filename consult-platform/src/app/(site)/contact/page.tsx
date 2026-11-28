import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { EnquiryForm } from "@/components/forms/lead-forms";
import { PageHeader, Section } from "@/components/ui/primitives";
import { getServices } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Send ${brand.name} an enquiry. We reply within one business day.`,
};

export default async function ContactPage() {
  const services = (await getServices()).map(({ id, slug, title }) => ({ id, slug, title }));
  const { contact } = brand;
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you are working on"
        intro="We reply to every enquiry within one business day."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-brand border border-line bg-bg p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold">Send an enquiry</h2>
            <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
              <EnquiryForm services={services} />
            </Suspense>
          </div>
          <aside>
            <h2 className="text-2xl font-semibold">Other ways to reach us</h2>
            <ul className="mt-6 space-y-5 text-sm">
              <ContactRow icon={<Mail className="h-5 w-5" aria-hidden />} label="Email">
                <a href={`mailto:${contact.email}`} className="break-all text-primary hover:underline">
                  {contact.email}
                </a>
              </ContactRow>
              {contact.phone && (
                <ContactRow icon={<Phone className="h-5 w-5" aria-hidden />} label="Phone">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                    {contact.phone}
                  </a>
                </ContactRow>
              )}
              {contact.whatsapp && (
                <ContactRow icon={<MessageCircle className="h-5 w-5" aria-hidden />} label="WhatsApp">
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Message us on WhatsApp
                  </a>
                </ContactRow>
              )}
              {contact.addressLines.length > 0 && (
                <ContactRow icon={<MapPin className="h-5 w-5" aria-hidden />} label="Office">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </ContactRow>
              )}
              <ContactRow icon={<Clock className="h-5 w-5" aria-hidden />} label="Hours">
                {contact.hours}
              </ContactRow>
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <div className="mt-0.5 text-base">{children}</div>
      </div>
    </li>
  );
}
