# Vocabulary Trainer — EN/DE B2→C1

Next.js rebuild of the vocabulary trainer: 1,948 English↔German verbs and
adjectives, 8 exercise formats, clean light "Apple" design, persisted per
browser via Supabase (anonymous auth, no login screen).

## Setup

1. In the Supabase project **English-practise**, open the SQL Editor and run
   `supabase/migrations/0001_init.sql` once. It creates:
   - `word_progress` — per-word score/streak/favorite/mistake state
   - `format_stats` — accuracy per exercise format
   - `session_history` — completed session results
   - `app_meta` — total practice session counter

   All tables have row-level security scoped to `auth.uid()`.
2. In **Authentication → Sign In / Providers**, make sure **Anonymous
   Sign-ins** is enabled. The app signs each browser in anonymously
   (`supabase.auth.signInAnonymously()`) on first load to get a stable user
   id — progress persists across visits on the same browser without any
   login UI.
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL
   and publishable key (already pre-filled for the English-practise
   project if you're using the same one).
4. `npm install && npm run dev` — open http://localhost:3000.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS v4
- `@supabase/supabase-js` for auth + persistence
- No backend routes — the client talks to Supabase directly, gated by RLS

## Structure

- `src/lib/vocab*.ts` — the vocabulary dataset and typed model
- `src/lib/store.tsx` — React context wrapping Supabase reads/writes,
  replacing what used to be a `localStorage` blob
- `src/lib/sessionLogic.ts` — pure functions for building a practice queue
  (weighted word selection, format mix, direction)
- `src/components/exercises/*` — the 8 exercise types (translate, gap fill,
  multiple choice, sentence translation, matching, sentence building,
  multi-gap, confusable pairs)
- `src/components/screens/*` — Home, Session, Summary, Word List, Word
  Detail, Stats

## Status

**Working / done:**
- All 8 exercise formats, weighted word selection (new/difficult/mistakes/
  favorites/all), direction mixing (EN→DE / DE→EN / mixed), hints, skip,
  session summary with "repeat mistakes", word list with search + filters,
  word detail, stats screen — full parity with the original prototype.
- Supabase persistence (`word_progress`, `format_stats`, `session_history`,
  `app_meta`), scoped per anonymous browser user via RLS.
- Production build verified locally (`npm run build`, clean `tsc`/`eslint`)
  and confirmed working on Vercel.
- Build no longer crashes if Supabase env vars are missing at build time —
  it now fails softly at runtime with a visible error screen instead.

**Needs a one-time manual step (couldn't be automated — no SQL/DDL or Auth
config access from this session's tools):**
- Run `supabase/migrations/0001_init.sql` once in the Supabase SQL Editor.
- Enable **Anonymous Sign-ins**: Supabase Dashboard → Authentication →
  Sign In / Providers → toggle on. Without this, the app shows "Could not
  connect to Supabase — Anonymous sign-ins are disabled".
- Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
  Vercel project's Environment Variables (values in `.env.example`), then
  redeploy.

**Known limitations vs. a "real" app:**
- No login/account system — identity is one anonymous Supabase user per
  browser (via cookie/localStorage token). Clearing site data, using a
  different browser, or incognito mode all start a fresh, empty profile;
  there's no way to log back into an existing one or sync across devices.
- No keyboard shortcuts (Enter-to-submit still works per input, but the
  original's global F/S/H/1-4 shortcuts were dropped in the Next.js
  rewrite to keep state management simple).
- Light theme only, by design — no dark mode toggle.
- No automated tests; correctness so far is verified by local build +
  manual click-through (Playwright) in this session, not a test suite.
