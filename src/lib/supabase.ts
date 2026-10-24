import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// Automatically sanitize accidental .supabase.com to .supabase.co to prevent DNS errors
const supabaseUrl = rawSupabaseUrl?.replace(/\.supabase\.com(\/.*)?$/i, ".supabase.co$1");
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith("http") &&
  supabasePublishableKey.length > 10,
);

// Use a safe fallback URL when environment variables are not configured so
// importing this module never throws a fatal runtime exception on load.
const safeUrl = isSupabaseConfigured ? supabaseUrl! : "https://placeholder-naomilearn.supabase.co";
const safeKey = isSupabaseConfigured
  ? supabasePublishableKey!
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured,
    detectSessionInUrl: isSupabaseConfigured,
  },
});
