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
