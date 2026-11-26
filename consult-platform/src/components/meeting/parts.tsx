import { Construction, Hand, Lock, MessageSquare, MonitorUp, Smartphone, Users } from "lucide-react";
import { brand } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import type { Access } from "@/lib/data/meetings";

export const ROOM_FEATURES = [
  { icon: Hand, title: "Raise your hand", text: "Ask to speak and the host brings you in." },
  { icon: MessageSquare, title: "Chat and reactions", text: "Ask questions in the chat without interrupting." },
  { icon: MonitorUp, title: "Screen sharing", text: "Presenters share slides and documents live." },
  { icon: Users, title: "See who is there", text: "Meet women from other places building businesses too." },
  { icon: Smartphone, title: "Works on your phone", text: "Join from the browser. No app to install." },
];

export function RoomFeatures() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {ROOM_FEATURES.map(({ icon: Icon, title, text }) => (
        <li key={title} className="rounded-brand border border-line bg-bg p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
        </li>
      ))}
    </ul>
  );
}

/** What a visitor needs to do before she can enter the room. */
export function AccessNotice({ access, next }: { access: Access; next: string }) {
  if (access.kind === "allowed") return null;
  const enc = encodeURIComponent(next);
  if (access.kind === "signed-out") {
    return (
      <Notice icon={<Lock className="h-5 w-5" aria-hidden />} title="The meeting room is for members">
        <p>
          {brand.features.womenOnly
            ? "Create a free account with your South African ID number. Once we approve your membership, you can join every webinar and meeting."
            : "Sign in or create a free account to join."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href={`/register?next=${enc}`} prefetch={false}>
            Join as a member
          </ButtonLink>
          <ButtonLink href={`/login?next=${enc}`} variant="outline" prefetch={false}>
            Sign in
          </ButtonLink>
        </div>
      </Notice>
    );
  }
  const status = access.profile.verification_status;
  return (
    <Notice icon={<Lock className="h-5 w-5" aria-hidden />} title={status === "pending" ? "Your membership is being reviewed" : "Your membership is not approved yet"}>
      <p>
        {status === "pending"
          ? "We will email you as soon as it is approved, usually within one business day."
          : "Confirm your membership from your account page, then we will review it."}
      </p>
      <div className="mt-4">
        <ButtonLink href="/dashboard" variant="outline" prefetch={false}>
          Go to my account
        </ButtonLink>
      </div>
    </Notice>
  );
}

export function SetupNotice() {
  return (
    <Notice icon={<Construction className="h-5 w-5" aria-hidden />} title="The meeting room is being set up">
      <p>
        Our own video room is almost ready. Until then, sessions with a Teams or Google Meet link can be
        joined from their page.
      </p>
    </Notice>
  );
}

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-brand border border-accent/40 bg-accent/10 p-6">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold">{title}</p>
        <div className="mt-1 text-muted">{children}</div>
      </div>
    </div>
  );
}
