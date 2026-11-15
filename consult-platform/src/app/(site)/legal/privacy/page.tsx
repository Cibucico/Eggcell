import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Privacy policy" };

/*
 * Template privacy policy written around POPIA. It describes what this
 * platform actually collects. Have the client's attorney review it before
 * launch, and update LAST_UPDATED whenever it changes.
 */
const LAST_UPDATED = "15 November 2026";

export default function PrivacyPage() {
  const { legalName, legal, contact } = brand;
  return (
    <LegalPage title="Privacy policy" updated={LAST_UPDATED}>
      <p>
        {legalName} (“we”, “us”) respects your privacy and processes personal information in
        line with the Protection of Personal Information Act 4 of 2013 (POPIA). This policy
        explains what we collect through this website, why, and the choices you have.
      </p>

      <h2>Who is responsible for your information</h2>
      <p>
        {legalName} is the responsible party. Our Information Officer is {legal.informationOfficer},
        who can be reached at{" "}
        <a href={`mailto:${legal.informationOfficerEmail}`}>{legal.informationOfficerEmail}</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Enquiries and consultation requests:</strong> your name, email address, phone
          number, company and the message you send us.
        </li>
        <li>
          <strong>Accounts and training:</strong> your name, email address, the courses you enrol
          in, your lesson progress and any certificates issued to you.
        </li>
        <li>
          <strong>Payments:</strong> a record of what you bought and the amount. Card and bank
          details are entered on our payment provider’s secure page and are never seen or stored
          by us.
        </li>
        <li>
          <strong>Investor interest:</strong> your name, contact details, organisation and the
          information you choose to share.
        </li>
        <li>
          <strong>Technical data:</strong> essential cookies that keep you signed in. We do not
          use advertising cookies.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To respond to your enquiry and arrange consultations you request.</li>
        <li>To provide the courses you enrol in and issue certificates.</li>
        <li>To process payments and keep the financial records the law requires.</li>
        <li>To keep the website secure and working.</li>
      </ul>
      <p>
        We only send marketing messages if you have asked for them, and every message includes a
        way to opt out.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We do not sell personal information. We share it only with service providers who help us
        run this website, such as our hosting, database, email and payment providers, and only as
        far as they need it to provide that service. Some of these providers store data outside
        South Africa. Where that happens we rely on providers that offer protection comparable
        to POPIA.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep enquiries for up to two years, account and training records for as long as your
        account is open, and financial records for five years as required by tax law. After that
        the information is deleted or anonymised.
      </p>

      <h2>How we protect it</h2>
      <p>
        Information is encrypted in transit and at rest, access is restricted to the people who
        need it, and each user can only see their own records. If a security compromise affects
        your information, we will notify you and the Information Regulator as POPIA requires.
      </p>

      <h2>Your rights</h2>
      <p>
        You may ask us for a copy of your personal information, ask us to correct or delete it,
        object to how we use it, or withdraw consent you have given. Email our Information
        Officer to make a request. You also have the right to complain to the Information
        Regulator of South Africa at{" "}
        <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer">
          inforegulator.org.za
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        {legalName}
        <br />
        {contact.addressLines.join(", ")}
        <br />
        <a href={`mailto:${legal.informationOfficerEmail}`}>{legal.informationOfficerEmail}</a>
      </p>
    </LegalPage>
  );
}
