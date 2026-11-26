import "server-only";
import { getProfile, isApprovedMember } from "@/lib/auth";
import { getLiveSession } from "@/lib/data/content";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Rooms open this long before a session starts, and stay open this long after it ends. */
const OPEN_BEFORE_MIN = 30;
const OPEN_AFTER_MIN = 30;

export type RoomWindow = { opensAt: Date; closesAt: Date; open: boolean };

export function roomWindow(startsAt: string, durationMinutes: number, now = Date.now()): RoomWindow {
  const start = new Date(startsAt).getTime();
  const opensAt = new Date(start - OPEN_BEFORE_MIN * 60_000);
  const closesAt = new Date(start + (durationMinutes + OPEN_AFTER_MIN) * 60_000);
  return { opensAt, closesAt, open: now >= opensAt.getTime() && now <= closesAt.getTime() };
}

export type Access =
  | { kind: "signed-out" }
  | { kind: "not-approved"; profile: Profile }
  | { kind: "allowed"; profile: Profile; moderator: boolean };

export async function meetingAccess(): Promise<Access> {
  if (!isSupabaseConfigured) return { kind: "signed-out" };
  const profile = await getProfile();
  if (!profile) return { kind: "signed-out" };
  if (!isApprovedMember(profile)) return { kind: "not-approved", profile };
  return { kind: "allowed", profile, moderator: profile.role !== "member" };
}

/** The external meeting link for a session (Teams, Meet), visible to registered members and staff. */
export async function externalLinkFor(sessionId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("live_session_links")
    .select("join_url")
    .eq("session_id", sessionId)
    .maybeSingle();
  return data?.join_url || null;
}

export { getLiveSession };

export type ConsultationRoom = {
  id: string;
  name: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
};

/** A confirmed online consultation the signed-in person may enter: her own, or any for staff. */
export async function getConsultationRoom(bookingId: string): Promise<ConsultationRoom | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, name, preferred_date, preferred_time, status, mode")
    .eq("id", bookingId)
    .maybeSingle();
  if (!data || data.status !== "confirmed" || data.mode !== "online") return null;
  return data;
}
