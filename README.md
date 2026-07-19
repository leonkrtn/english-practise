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
