import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { RoomView } from "@/components/meeting/room-view";
import { getProfile } from "@/lib/auth";
import { getConsultationRoom } from "@/lib/data/meetings";
import { roomSlug } from "@/lib/jaas";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Consultation", robots: { index: false } };

/**
 * A private room for one confirmed online consultation. Only the client who
 * booked it (while signed in) and staff can open it.
 */
export default function ConsultationRoomPage({ params }: PageProps<"/meeting-room/consultation/[id]">) {
  if (!brand.features.meetingRoom) notFound();
  return (
    <div className="container-page py-10">
      <Suspense fallback={<p className="text-muted">Opening the room…</p>}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}

async function Room({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/meeting-room/consultation/${id}`)}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  // Row level security only returns the client's own booking, or any booking for staff.
  const booking = await getConsultationRoom(id);
  if (!booking) notFound();
  const staff = profile.role !== "member";
  return (
    <RoomView
      title={staff ? `Consultation with ${booking.name}` : `Your consultation with ${brand.name}`}
      subtitle={`${formatDate(booking.preferred_date)} at ${booking.preferred_time}`}
      room={roomSlug(brand.key, "consultation", booking.id)}
      externalUrl={null}
      profile={profile}
      moderator={staff}
      backHref={staff ? "/admin/bookings" : "/dashboard#bookings"}
      backLabel={staff ? "Consultations" : "My account"}
    />
  );
}
