"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { markChatRead } from "@/lib/actions/chat";

/** Re-checks the page for new messages every few seconds. */
export function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);
  return null;
}

/** Marks the open conversation as read once an admin has it on screen. */
export function MarkRead({ conversationId }: { conversationId: string }) {
  useEffect(() => {
    void markChatRead(conversationId);
  }, [conversationId]);
  return null;
}
