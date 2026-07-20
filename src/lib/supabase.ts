import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !url || !key
    ? "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in your environment (e.g. Vercel Project Settings → Environment Variables) and redeploy."
    : null;

// Falls back to placeholder values so `createClient` never throws during
// build-time prerendering; StoreProvider checks `supabaseConfigError` before
// making any real request and surfaces it as a normal boot error instead.
export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder");

/**
 * True for a stale/invalid session (expired or rotated-out JWT), as opposed to
 * a genuine network/connectivity failure. Mobile Safari/PWA in particular can
 * resume from a long background suspension with a token the auto-refresh timer
 * never got to renew, or with a refresh token invalidated by rotation on
 * another device — both surface as a 401 on the first REST call.
 */
export function isAuthError(e: unknown): boolean {
  const message = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "";
  const code = typeof e === "object" && e && "code" in e ? String((e as { code: unknown }).code) : "";
  return code === "PGRST301" || /jwt|token is expired|invalid.*refresh.*token/i.test(message);
}
