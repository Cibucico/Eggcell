import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { CallToAction, CaseStudyCard } from "@/components/site/cards";
import { EmptyState, PageHeader, Section } from "@/components/ui/primitives";
import { getCaseStudies } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Client results",
  description: "Case studies showing what changed for our clients.",
};

export default async function CaseStudiesPage() {
  if (!brand.features.caseStudies) notFound();
  const studies = await getCaseStudies();
  return (
    <>
      <PageHeader
        eyebrow="Client results"
        title="What changed after we worked together"
        intro="Client names are withheld where confidentiality applies. The numbers are theirs."
      />
      <Section>
        {studies.length === 0 ? (
          <EmptyState title="Case studies are on their way" text="Please check back soon." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        )}
      </Section>
      <CallToAction />
    </>
  );
}
