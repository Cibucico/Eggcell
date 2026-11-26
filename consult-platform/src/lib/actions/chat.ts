"use server";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { brand, siteUrl } from "@/config/brand";
import { getProfile, requireAdmin } from "@/lib/auth";
import { notifyTeam, sendEmail } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Live chat answered by a person.
 *
 * A visitor's conversation is tied to a private random token kept in an
 * http-only cookie; the database stores only its hash. Visitors never talk to
 * the database directly: these actions look the conversation up by the
 * token's hash using the server's key.
 */

const COOKIE = `${brand.key}_chat`;
const MAX_MESSAGES_PER_10_MIN = 15;

export type ChatMessage = { id: string; sender: "visitor" | "staff"; body: string; created_at: string };
export type ChatState =
  | { status: "off" }
  | { status: "new"; prefill: { name: string; email: string } }
  | { status: "open"; name: string; messages: ChatMessage[] };
export type ChatResult = { state: ChatState; error?: string };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function currentConversation() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length < 20) return null;
  const { data } = await createAdminClient()
    .from("chat_conversations")
    .select("id, visitor_name, visitor_email")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  return data;
}

async function messagesFor(conversationId: string): Promise<ChatMessage[]> {
  const { data } = await createAdminClient()
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at")
    .limit(200);
  return (data ?? []) as ChatMessage[];
}

/** The visitor's chat: her messages and replies, or a blank form to start one. */
export async function getChatState(): Promise<ChatState> {
  if (!brand.features.liveChat) return { status: "off" };
  // Prototype without a database: show the form so the chat can be seen.
  if (!isSupabaseConfigured) return { status: "new", prefill: { name: "", email: "" } };
  try {
    const conversation = await currentConversation();
    if (conversation) {
      return { status: "open", name: conversation.visitor_name, messages: await messagesFor(conversation.id) };
    }
  } catch (err) {
    console.error("[chat] could not load", (err as Error).message);
    return { status: "off" };
  }
  const profile = await getProfile();
  return { status: "new", prefill: { name: profile?.full_name ?? "", email: profile?.email ?? "" } };
}

const startSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address")),
  body: z.string().trim().min(1, "Type a message").max(2000, "Keep your message under 2,000 characters"),
  consent: z.literal("on", "Tick the box to continue"),
});

export async function startChat(formData: FormData): Promise<ChatResult> {
  const state = await getChatState();
  if (!isSupabaseConfigured) {
    return { state, error: "This is a prototype, so chat messages are not sent yet." };
  }
  if (state.status === "off") return { state, error: "Chat is not available right now. Please use the contact form." };
  // Bots fill the hidden field; tell them it worked and save nothing.
  if (String(formData.get("website") ?? "") !== "") return { state };
  const parsed = startSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { state, error: parsed.error.issues[0].message };
  if (state.status === "open") return sendChatMessage(formData);

  const token = randomBytes(32).toString("base64url");
  const profile = await getProfile();
  const admin = createAdminClient();
  const { data: conversation, error } = await admin
    .from("chat_conversations")
    .insert({
      visitor_name: parsed.data.name,
      visitor_email: parsed.data.email,
      token_hash: hashToken(token),
      user_id: profile?.id ?? null,
    })
    .select("id")
    .single();
  if (error || !conversation) {
    console.error("[chat] could not start", error?.message);
    return { state, error: "Your message was not sent. Please try again." };
  }
  await admin.from("chat_messages").insert({ conversation_id: conversation.id, sender: "visitor", body: parsed.data.body });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: siteUrl.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  await notifyTeam(
    `New chat from ${parsed.data.name}`,
    [`${parsed.data.name} (${parsed.data.email}) wrote:`, "", parsed.data.body, "", `Reply in the admin area: ${siteUrl}/admin/chat?c=${conversation.id}`],
    parsed.data.email,
  );
  return { state: { status: "open", name: parsed.data.name, messages: await messagesFor(conversation.id) } };
}

export async function sendChatMessage(formData: FormData): Promise<ChatResult> {
  const body = z.string().trim().min(1).max(2000).safeParse(formData.get("body"));
  const conversation = await currentConversation().catch(() => null);
  if (!conversation) return { state: await getChatState(), error: "This chat has ended. Start a new one." };
  const messages = await messagesFor(conversation.id);
  const state: ChatState = { status: "open", name: conversation.visitor_name, messages };
  if (!body.success) return { state, error: "Type a message of up to 2,000 characters." };

  const tenMinutesAgo = Date.now() - 10 * 60_000;
  const recent = messages.filter((m) => m.sender === "visitor" && new Date(m.created_at).getTime() > tenMinutesAgo);
  if (recent.length >= MAX_MESSAGES_PER_10_MIN) {
    return { state, error: "You have sent a lot of messages. Please wait for a reply." };
  }

  const { error } = await createAdminClient()
    .from("chat_messages")
    .insert({ conversation_id: conversation.id, sender: "visitor", body: body.data });
  if (error) return { state, error: "Your message was not sent. Please try again." };
  return { state: { ...state, messages: await messagesFor(conversation.id) } };
}

// ---------------------------------------------------------------------------
// Admin side
// ---------------------------------------------------------------------------

export async function replyToChat(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = z
    .object({ conversation_id: z.uuid(), body: z.string().trim().min(1).max(2000) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/admin/chat?c=${formData.get("conversation_id") ?? ""}&error=1`);

  const supabase = await createClient();
  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: parsed.data.conversation_id,
    sender: "staff",
    staff_id: admin.id,
    body: parsed.data.body,
  });
  if (error) redirect(`/admin/chat?c=${parsed.data.conversation_id}&error=1`);

  // The visitor may have left the site, so the reply also goes by email.
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("visitor_name, visitor_email")
    .eq("id", parsed.data.conversation_id)
    .maybeSingle();
  if (conversation) {
    await sendEmail({
      to: conversation.visitor_email,
      subject: `${brand.name} replied to your message`,
      text: [
        `Hello ${conversation.visitor_name},`,
        "",
        parsed.data.body,
        "",
        `You can carry on the conversation in the chat on ${siteUrl}, or reply to this email.`,
        "",
        brand.name,
      ].join("\n"),
      replyTo: brand.contact.email,
    });
  }
  redirect(`/admin/chat?c=${parsed.data.conversation_id}`);
}

export async function setChatStatus(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({ conversation_id: z.uuid(), status: z.enum(["new", "in_progress", "closed"]) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/chat?error=1");
  const supabase = await createClient();
  await supabase
    .from("chat_conversations")
    .update({ status: parsed.data.status, unread_for_staff: false })
    .eq("id", parsed.data.conversation_id);
  redirect(`/admin/chat?c=${parsed.data.conversation_id}`);
}

/** Called when an admin opens a conversation. */
export async function markChatRead(conversationId: string) {
  await requireAdmin();
  if (!z.uuid().safeParse(conversationId).success) return;
  const supabase = await createClient();
  await supabase.from("chat_conversations").update({ unread_for_staff: false }).eq("id", conversationId);
}
