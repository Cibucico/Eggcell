import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { brand } from "@/config/brand";
import { VerifyIdForm } from "@/components/forms/auth-forms";
import type { Profile } from "@/lib/types";

/** Membership status on women-only sites, shown at the top of the dashboard. */
export function VerificationPanel({ profile, submitted }: { profile: Profile; submitted?: boolean }) {
  if (!brand.features.womenOnly || profile.role !== "member") return null;
  const status = profile.verification_status;

  if (status === "approved") {
    return (
      <div className="mt-8 flex gap-4 rounded-brand border border-success/30 bg-success/10 p-5 text-success">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          <span className="font-semibold">Your membership is approved.</span> The meeting room is open to you.
        </p>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="mt-8 flex gap-4 rounded-brand border border-accent/40 bg-accent/10 p-5">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">
            {submitted ? "Thank you. Your ID number has been checked." : "Your membership is being reviewed."}
          </p>
          <p className="mt-1 text-sm text-muted">
            We will email you once it is approved, usually within one business day. In the meantime the
            toolkit is open to everyone.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-8 rounded-brand border border-line bg-surface p-6">
      <div className="flex gap-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {status === "rejected" ? "We could not approve your membership." : "Confirm your membership"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {status === "rejected"
              ? "If you think this is a mistake, contact us, or submit your ID number again below."
              : "Membership is for women. Enter your South African ID number so we can check it, then an admin will approve your account."}
          </p>
          <div className="mt-5 max-w-md">
            <VerifyIdForm />
          </div>
        </div>
      </div>
    </div>
  );
}
