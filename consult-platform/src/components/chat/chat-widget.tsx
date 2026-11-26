"use client";

import { Loader2, MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { brand } from "@/config/brand";
import {
  getChatState,
  sendChatMessage,
  startChat,
  type ChatResult,
  type ChatState,
} from "@/lib/actions/chat";
import { cn } from "@/lib/utils";

const timeFmt = new Intl.DateTimeFormat("en-ZA", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Johannesburg",
});

/**
 * Chat bubble in the bottom corner. Messages go to the team's inbox in the
 * admin area and a person replies; replies appear here and by email.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await getChatState());
    } catch {
      // A failed refresh keeps the last messages on screen.
    }
  }, []);

  // While open, check for replies every few seconds (the first load happens on opening).
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [open, refresh]);

  const messageCount = state?.status === "open" ? state.messages.length : 0;
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messageCount]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (action: (fd: FormData) => Promise<ChatResult>) => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await action(data);
      setState(result.state);
      setError(result.error ?? null);
      if (!result.error) {
        const box = form.querySelector<HTMLTextAreaElement>("textarea[name=body]");
        if (box) box.value = "";
        inputRef.current?.focus();
      }
    });
  };

  return (
    <div className="no-print fixed z-50" style={{ right: "max(16px, env(safe-area-inset-right, 0px))", bottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}>
      {open && (
        <section
          id="chat-panel"
          aria-label={`Chat with ${brand.name}`}
          className="animate-rise absolute bottom-16 right-0 flex h-[min(32rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-bg shadow-2xl"
        >
          <header className="flex items-start justify-between gap-3 bg-deep px-5 py-4 text-deep-fg">
            <div>
              <p className="font-heading text-lg font-medium">Chat with us</p>
              <p className="text-xs text-deep-fg/75">A real person replies, usually within business hours.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-deep-fg/10"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </header>

          {state === null ? (
            <div className="flex flex-1 items-center justify-center text-muted">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              <span className="sr-only">Loading chat</span>
            </div>
          ) : state.status === "off" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted">
              <p>Chat is not available right now.</p>
              <Link href="/contact" className="font-semibold text-primary underline underline-offset-4" onClick={() => setOpen(false)}>
                Send us a message instead
              </Link>
            </div>
          ) : state.status === "new" ? (
            <form onSubmit={submit(startChat)} className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              <p className="text-sm text-muted">
                Ask us anything about your business or our services. Leave your email so we can reply if you
                leave the page.
              </p>
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <ChatInput label="Your name" name="name" defaultValue={state.prefill.name} autoComplete="name" />
              <ChatInput label="Email" name="email" type="email" defaultValue={state.prefill.email} autoComplete="email" />
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Your message</span>
                <textarea
                  name="body"
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-none rounded-2xl border border-line bg-bg px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex items-start gap-2 text-xs text-muted">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[var(--brand-primary)]" />
                <span>
                  I agree that my details may be used to reply to me, as described in the{" "}
                  <Link href="/legal/privacy" className="text-primary underline">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {error && (
                <p role="alert" className="text-sm font-medium text-danger">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-fg disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                Start chat
              </button>
            </form>
          ) : (
            <>
              <ol ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto bg-surface/60 p-4">
                {state.messages.map((m) => (
                  <li key={m.id} className={cn("flex flex-col", m.sender === "visitor" ? "items-end" : "items-start")}>
                    <span
                      className={cn(
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        m.sender === "visitor"
                          ? "rounded-br-md bg-primary text-primary-fg"
                          : "rounded-bl-md border border-line bg-bg text-ink",
                      )}
                    >
                      {m.body}
                    </span>
                    <span className="mt-1 px-1 text-[11px] text-muted">
                      {m.sender === "staff" ? `${brand.name} · ` : ""}
                      {timeFmt.format(new Date(m.created_at))}
                    </span>
                  </li>
                ))}
                {state.messages.every((m) => m.sender === "visitor") && (
                  <li className="text-center text-xs text-muted">
                    Thanks, {state.name}. We will reply here and by email.
                  </li>
                )}
              </ol>
              <form onSubmit={submit(sendChatMessage)} className="flex items-end gap-2 border-t border-line p-3">
                <label className="sr-only" htmlFor="chat-body">
                  Message
                </label>
                <textarea
                  ref={inputRef}
                  id="chat-body"
                  name="body"
                  required
                  rows={1}
                  maxLength={2000}
                  placeholder="Type a message"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-bg px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={pending}
                  aria-label="Send"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg disabled:opacity-60"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                </button>
              </form>
              {error && (
                <p role="alert" className="px-4 pb-3 text-xs font-medium text-danger">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          if (!open) void refresh();
          setOpen(!open);
        }}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? "Close chat" : "Chat with us"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[0_12px_30px_-8px_var(--brand-primary)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>
    </div>
  );
}

function ChatInput({
  label,
  ...props
}: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        required
        className="h-11 w-full rounded-full border border-line bg-bg px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        {...props}
      />
    </label>
  );
}
