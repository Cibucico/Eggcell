/**
 * Central place for environment configuration.
 * NEXT_PUBLIC_* values are safe for the browser; everything else is server-only
 * and must only be read from server code.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/**
 * False until a database is connected. The public site then shows the starter
 * content from src/content/seed.ts, and sign-in and forms are switched off.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const PREVIEW_MESSAGE =
  "This site is running in preview mode without a database, so nothing was saved. Connect Supabase to switch this on.";
