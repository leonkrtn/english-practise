# Vocabulary Trainer — EN/DE B2→C1

Single-page vocabulary trainer (verbs & adjectives, English ↔ German), rebuilt
1:1 from the original localStorage prototype but backed by Supabase for
persistence (progress, favorites, mistakes, session history survive across
devices/browsers instead of living only in `localStorage`).

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
   id — no login screen, same zero-friction experience as before.
3. Open `index.html` directly in a browser (or serve the folder statically).
   No build step — it's a single static file, same as the original.

## What changed vs. the original

- The vocabulary list (1,948 words) and all exercise logic (8 formats:
  translation, gap fill, multiple choice, sentence translation, matching,
  sentence building, multi-gap, confusable pairs) are unchanged.
- The `Store` object that used to read/write `localStorage` now loads/saves
  the same data shape from Supabase tables. Reads happen once on boot
  (short loading spinner); writes are fired in the background after each
  answer so the UI stays instant, exactly like before.
