import { isSupabaseConfigured } from "@/lib/env";

/** Shown only while no database is connected, so nobody mistakes a preview for the live site. */
export function PreviewBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="no-print bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-fg">
      Prototype: sample content for review. Sign-in, chat, forms and the meeting room are not
      switched on yet.
    </div>
  );
}
