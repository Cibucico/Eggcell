import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { SubmitButton, TextField } from "@/components/forms/fields";
import { PageHeader, Section } from "@/components/ui/primitives";
import { findCertificate } from "@/lib/actions/certificates";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: `Check that a certificate was issued by ${brand.name}.`,
};

export default function CertificatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title="Verify a certificate"
        intro={`Enter the certificate number to confirm it was issued by ${brand.name}.`}
      />
      <Section>
        <form action={findCertificate} className="mx-auto flex max-w-md flex-col gap-5">
          <TextField
            label="Certificate number"
            name="serial"
            placeholder="e.g. 4F9A1C22B07E"
            autoComplete="off"
            hint="The 12-character number printed at the bottom of the certificate."
          />
          <SubmitButton pendingText="Checking…">Verify</SubmitButton>
        </form>
      </Section>
    </>
  );
}
