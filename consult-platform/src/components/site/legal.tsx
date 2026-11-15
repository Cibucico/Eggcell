import type { ReactNode } from "react";
import { PageHeader, Section } from "@/components/ui/primitives";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} intro={`Last updated: ${updated}`} />
      <Section>
        <div className="prose-brand mx-auto max-w-3xl">{children}</div>
      </Section>
    </>
  );
}
