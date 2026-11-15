import type { Metadata } from "next";
import { CallToAction, ServiceCard } from "@/components/site/cards";
import { PageHeader, Section } from "@/components/ui/primitives";
import { getServices } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Consulting services",
  description: "Partner-led consulting on strategy, funding, operations, compliance and leadership.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader
        eyebrow="Consulting services"
        title="Focused engagements with a clear result"
        intro="Every service below has a defined scope, a list of deliverables and an indicative starting price, so you know what you are buying before we begin."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Section>
      <CallToAction
        title="Not sure which service fits?"
        text="Most clients are not. Tell us what is going on in the business and we will recommend where to start."
      />
    </>
  );
}
