import { Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh, MarkRead } from "@/components/admin/auto-refresh";
import { AdminHeader, Feedback, inputClass, Panel } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { brand } from "@/config/brand";
import { replyToChat, setChatStatus } from "@/lib/actions/chat";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn, formatDateTime } from "@/lib/utils";

const statusLabel = { new: "New", in_progress: "Answered", closed: "Closed" } as const;
const statusTone = { new: "accent", in_progress: "primary", closed: "neutral" } as const;

export default async function ChatInboxPage({ searchParams }: PageProps<"/admin/chat">) {
  if (!brand.features.liveChat) notFound();
  const query = await searchParams;
  await requireAdmin();
  const supabase = await createClient();
  const { data: conversations, error } = await supabase
    .from("chat_conversations")
    .select("id, visitor_name, visitor_email, status, unread_for_staff, last_message_at, user_id")
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`Could not load chats: ${error.message}`);
  const list = conversations ?? [];
  const selectedId = typeof query.c === "string" ? query.c : list[0]?.id;
  const selected = list.find((c) => c.id === selectedId);
  const { data: messages } = selected
    ? await supabase
        .from("chat_messages")
        .select("id, sender, body, created_at")
        .eq("conversation_id", selected.id)
        .order("created_at")
    : { data: [] };

  return (
    <>
      <AutoRefresh />
      {selected?.unread_for_staff && <MarkRead conversationId={selected.id} />}
      <AdminHeader
        title="Chat"
        intro="Messages from the chat bubble on the website. Your reply appears in the visitor's chat and is also emailed to her."
      />
      <Feedback query={query} />
      {list.length === 0 ? (
        <EmptyState title="No chats yet" text="When someone uses the chat bubble on the website, the conversation appears here." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
          <Panel className="overflow-hidden">
            <ul className="max-h-[70vh] overflow-y-auto">
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/chat?c=${c.id}`}
                    prefetch={false}
                    className={cn(
                      "block border-b border-line px-4 py-3 last:border-b-0 hover:bg-surface",
                      c.id === selected?.id && "bg-surface",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate", c.unread_for_staff ? "font-bold" : "font-medium")}>{c.visitor_name}</span>
                      {c.unread_for_staff && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{c.visitor_email}</span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                      <Badge tone={statusTone[c.status as keyof typeof statusTone]}>{statusLabel[c.status as keyof typeof statusLabel]}</Badge>
                      {formatDateTime(c.last_message_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          {selected && (
            <Panel className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold">{selected.visitor_name}</p>
                  <p className="select-all truncate text-sm text-muted">
                    {selected.visitor_email}
                    {selected.user_id ? " · Member" : " · Visitor"}
                  </p>
                </div>
                <form action={setChatStatus}>
                  <input type="hidden" name="conversation_id" value={selected.id} />
                  <input type="hidden" name="status" value={selected.status === "closed" ? "in_progress" : "closed"} />
                  <button type="submit" className={buttonClass("outline", "sm")}>
                    {selected.status === "closed" ? "Reopen" : "Mark as closed"}
                  </button>
                </form>
              </div>
              <ol className="flex max-h-[55vh] flex-1 flex-col gap-3 overflow-y-auto bg-surface/50 p-5">
                {(messages ?? []).map((m) => (
                  <li key={m.id} className={cn("flex flex-col", m.sender === "staff" ? "items-end" : "items-start")}>
                    <span
                      className={cn(
                        "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.sender === "staff" ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md border border-line bg-bg",
                      )}
                    >
                      {m.body}
                    </span>
                    <span className="mt-1 px-1 text-[11px] text-muted">
                      {m.sender === "staff" ? "You · " : ""}
                      {formatDateTime(m.created_at)}
                    </span>
                  </li>
                ))}
              </ol>
              <form action={replyToChat} className="flex items-end gap-2 border-t border-line p-4">
                <input type="hidden" name="conversation_id" value={selected.id} />
                <label htmlFor="reply" className="sr-only">
                  Reply
                </label>
                <textarea id="reply" name="body" required rows={2} maxLength={2000} placeholder="Write a reply" className={`${inputClass} flex-1 resize-y`} />
                <button type="submit" className={buttonClass("primary", "md")}>
                  <Send className="h-4 w-4" aria-hidden />
                  Send
                </button>
              </form>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
