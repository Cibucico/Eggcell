import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Terms of use" };

/*
 * Template terms. Have the client's attorney review them before launch,
 * particularly the refund and liability clauses.
 */
const LAST_UPDATED = "15 November 2026";

export default function TermsPage() {
  const { legalName, legal, contact, features } = brand;
  return (
    <LegalPage title="Terms of use" updated={LAST_UPDATED}>
      <p>
        These terms apply to your use of this website, which is operated by {legalName} (“we”,
        “us”). By using the website you agree to them.
      </p>

      <h2>Consulting services</h2>
      <p>
        Information on this website is general in nature and is not professional advice for your
        specific circumstances. Consulting work is carried out under a separate written
        engagement agreement, which sets out the scope, fees and terms for that work. Prices
        shown on the website are indicative starting prices and exclude VAT.
      </p>

      {features.training && (
        <>
          <h2>Online courses</h2>
          <ul>
            <li>
              When you enrol in a course you receive a personal, non-transferable licence to access
              it. You may not share your login or copy, resell or redistribute course material.
            </li>
            <li>
              Course prices are shown in South African rand and include VAT where applicable.
              Payment is taken through our payment provider at the time of enrolment.
            </li>
            <li>
              <strong>Refunds:</strong> you may cancel within 7 days of purchase for a full refund,
              provided you have completed less than a quarter of the course. This is in addition
              to any rights you have under the Consumer Protection Act and the Electronic
              Communications and Transactions Act.
            </li>
            <li>
              A certificate of completion confirms that you finished the course. Unless a course
              page states otherwise, it is not a qualification registered on the National
              Qualifications Framework.
            </li>
          </ul>
        </>
      )}

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your password confidential and for activity on your
        account. Tell us promptly if you believe your account has been accessed without your
        permission.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content on this website, including course material, text and graphics, belongs to
        {" "}
        {legalName} or its licensors and may not be reproduced without written permission.
      </p>

      {features.investors && (
        <>
          <h2>Investor information</h2>
          <p>
            Information for investors is provided for general information only. It is not an
            offer to sell securities, a solicitation of investment or financial advice.
          </p>
        </>
      )}

      <h2>Liability</h2>
      <p>
        We take care to keep this website accurate and available, but we provide it as is. To
        the extent the law allows, we are not liable for indirect or consequential loss arising
        from your use of the website. Nothing in these terms limits rights you have under the
        Consumer Protection Act.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of {legal.jurisdiction}.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    </LegalPage>
  );
}
