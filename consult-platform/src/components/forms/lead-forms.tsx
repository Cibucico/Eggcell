"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import {
  submitBooking,
  submitEnquiry,
  submitInvestorInterest,
} from "@/lib/actions/leads";
import { idleState } from "@/lib/types";
import {
  ConsentField,
  FormMessage,
  Honeypot,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
} from "./fields";

type ServiceOption = { id: string; slug: string; title: string };

/** Pre-selects a service when the page is opened with ?service=<slug>. */
function useServiceFromUrl(services: ServiceOption[]): string {
  const slug = useSearchParams().get("service");
  return services.find((s) => s.slug === slug)?.id ?? "";
}

export function EnquiryForm({ services }: { services: ServiceOption[] }) {
  const [state, action] = useActionState(submitEnquiry, idleState);
  const defaultService = useServiceFromUrl(services);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5" noValidate={false}>
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="name" autoComplete="name" error={e.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional error={e.phone} />
        <TextField label="Company" name="company" autoComplete="organization" optional error={e.company} />
      </div>
      <SelectField
        label="What can we help with?"
        name="service_id"
        optional
        defaultValue={defaultService}
        key={defaultService}
        error={e.service_id}
      >
        <option value="">General enquiry</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </SelectField>
      <TextArea
        label="Your message"
        name="message"
        error={e.message}
        placeholder="Tell us about your business and what you would like to achieve."
      />
      <ConsentField error={e.consent} purpose="to respond to this enquiry" />
      <FormMessage state={state} />
      <SubmitButton>Send enquiry</SubmitButton>
    </form>
  );
}

export function BookingForm({
  services,
  times,
  minDate,
}: {
  services: ServiceOption[];
  times: string[];
  minDate: string;
}) {
  const [state, action] = useActionState(submitBooking, idleState);
  const defaultService = useServiceFromUrl(services);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="name" autoComplete="name" error={e.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional error={e.phone} />
        <TextField label="Company" name="company" autoComplete="organization" optional error={e.company} />
      </div>
      <SelectField
        label="Topic"
        name="service_id"
        optional
        defaultValue={defaultService}
        key={defaultService}
        error={e.service_id}
      >
        <option value="">Not sure yet</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          label="Preferred date"
          name="preferred_date"
          type="date"
          min={minDate}
          error={e.preferred_date}
        />
        <SelectField label="Preferred time" name="preferred_time" defaultValue="" error={e.preferred_time}>
          <option value="" disabled>
            Choose a time
          </option>
          {times.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <SelectField label="Meeting type" name="mode" defaultValue="online" error={e.mode}>
          <option value="online">Online video call</option>
          <option value="in_person">In person</option>
        </SelectField>
      </div>
      <TextArea
        label="What would you like to discuss?"
        name="notes"
        optional
        rows={4}
        error={e.notes}
      />
      <ConsentField error={e.consent} purpose="to arrange this consultation" />
      <FormMessage state={state} />
      <SubmitButton>Request consultation</SubmitButton>
      <p className="text-xs text-muted">
        Times are in South African Standard Time. Your booking is confirmed once we email you.
      </p>
    </form>
  );
}

export function InvestorForm() {
  const [state, action] = useActionState(submitInvestorInterest, idleState);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Full name" name="name" autoComplete="name" error={e.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={e.email} />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional error={e.phone} />
        <TextField
          label="Organisation"
          name="organisation"
          autoComplete="organization"
          optional
          error={e.organisation}
        />
        <SelectField label="I am" name="investor_type" defaultValue="" error={e.investor_type}>
          <option value="" disabled>
            Choose one
          </option>
          <option>An individual investor</option>
          <option>A venture capital or private equity firm</option>
          <option>A development finance institution</option>
          <option>A corporate or strategic partner</option>
          <option>Other</option>
        </SelectField>
        <SelectField
          label="Indicative amount"
          name="ticket_range"
          optional
          defaultValue=""
          error={e.ticket_range}
        >
          <option value="">Prefer not to say</option>
          <option>Under R500,000</option>
          <option>R500,000 to R2 million</option>
          <option>R2 million to R10 million</option>
          <option>Over R10 million</option>
        </SelectField>
      </div>
      <TextArea label="Message" name="message" optional rows={4} error={e.message} />
      <ConsentField error={e.consent} purpose="to contact me about investment opportunities" />
      <FormMessage state={state} />
      <SubmitButton>Register interest</SubmitButton>
    </form>
  );
}
