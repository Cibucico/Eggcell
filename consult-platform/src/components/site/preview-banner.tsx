import { isSupabaseConfigured } from "@/lib/env";

/** Shown only while no database is connected, so nobody mistakes a preview for the live site. */
export function PreviewBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="no-print bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-fg">
      Preview mode: showing sample content. Sign-in, forms and payments are switched off until a
      database is connected.
    </div>
  );
}
