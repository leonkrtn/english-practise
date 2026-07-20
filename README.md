# Vocabulary Trainer — EN/DE B2→C1

Next.js rebuild of the vocabulary trainer: 1,948 English↔German verbs and
adjectives, clean light "Apple" design, mobile-first (Home and the exercise
screen are built to fit a phone viewport without scrolling). Progress is
tied to a real account (email + password via Supabase Auth) — you have to
sign up before the app lets you in, and everything you do is saved against
that account instead of just a browser. Sessions run on a 4-stage
spaced-repetition engine (see below) rather than a fixed exercise mix.

## Setup

1. In the Supabase project **English-practise**, open the SQL Editor and run,
   in order:
   - `supabase/migrations/0001_init.sql` — creates `word_progress`,
     `format_stats`, `session_history`, `app_meta`, all RLS-scoped to
     `auth.uid()`.
   - `supabase/migrations/0002_learning_stages.sql` — adds the `stage`,
     `review_streak`, `due_at_session` columns that drive the learning
     engine below.
2. In **Authentication → Sign In / Providers**, make sure the **Email**
   provider is enabled (it is by default). Decide whether you want **Confirm
   email** on: if it's on, `signUp` won't return a session immediately and
   the app shows a "check your inbox" message instead of logging the user
   straight in; if it's off, sign-up logs you in immediately. Either works
   out of the box — pick whichever fits how you'll actually use this.
3. Copy `.env.example` to `.env.local` and fill in your Supabase project URL
   and publishable key (already pre-filled for the English-practise
   project if you're using the same one).
4. `npm install && npm run dev` — open http://localhost:3000, then create an
   account on the sign-up screen.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS v4
- `@supabase/supabase-js` for auth (email/password) + persistence
- No backend routes — the client talks to Supabase directly, gated by RLS

## Learning engine

Each word moves through 5 stages, tracked per-word in `word_progress.stage`:

| Stage | Task | Exercise used |
|---|---|---|
| 0 → 1 | **Kennenlernen** — plain info card (word, translation, example, collocations) | `LearnExercise` |
| 1 → 2 | **Abfragen** — quick recall test | `McExercise` |
| 2 → 3 | **Einbauen** — use the word in a sentence context | `GapExercise` |
| 3 → 4 | **Schreiben** — free written production | `SentenceExercise` |
| 4 (mastered-active) | **Wiederholung** — periodic long-term review | `TranslateExercise` |

Rules (`src/lib/learning.ts`):
- A session (`AppShell.startLearningSession`) pulls ~10 "active" words
  (in-progress words first, then new ones) plus a few long-term reviews that
  are due, and builds a shuffled starting queue — one task per word at its
  current stage.
- **Correct answer** → word advances one stage; a follow-up task for the
  *next* stage is inserted 2–4 items further into the (growing) queue, so it
  resurfaces later in the same session rather than immediately (spacing
  effect) — this is how a word gets "wiederholt innerhalb einer Session".
- **Wrong answer** → word drops one stage (floor: stage 1, so a failed quiz
  never silently regresses to the no-test learn card) and is retried later
  in the same session.
- Reaching stage 4 schedules the word for long-term review after a growing
  interval (2, 3, 5, 8, 13, 21 sessions — `reviewInterval()`), based on
  `app_meta.total_practice_sessions` as the clock. A failed long-term review
  drops the word back to stage 3 and resets the interval.
- A per-word attempt cap (`MAX_ATTEMPTS_PER_WORD = 5`) guarantees every
  session terminates even if a word is answered wrong repeatedly — it's
  simply picked up again next session instead of looping forever.
- This stage system runs entirely in the background (no per-word stage
  badges in the UI) and is independent of the pre-existing score/mastery
  tracking still shown in Word List / Word Detail / Stats.
- "Repeat mistakes" (from the summary) and "Practice this word" (from word
  detail) are simple one-off drills and intentionally bypass the stage
  engine — see `AppShell`'s `startWithWords`.

## Structure

- `src/lib/auth.tsx` — React context around Supabase email/password auth
  (`signUp`, `signIn`, `signOut`, current `user`); `src/app/page.tsx` renders
  `AuthScreen` until there's a signed-in user, then mounts `StoreProvider`
  with that user's id
- `src/components/screens/AuthScreen.tsx` — the sign in / sign up form
- `src/lib/vocab*.ts` — the vocabulary dataset and typed model
- `src/lib/store.tsx` — React context wrapping Supabase reads/writes for the
  signed-in user (`userId` prop, no auth logic of its own anymore)
- `src/lib/learning.ts` — the spaced-repetition stage engine described above
- `src/lib/sessionLogic.ts` — pure helpers (direction mixing) plus the
  legacy queue builder still used by the one-off drill flow
- `src/components/exercises/*` — `LearnExercise` plus the original 8
  exercise types (translate, gap fill, multiple choice, sentence
  translation, matching, sentence building, multi-gap, confusable pairs)
- `src/components/screens/*` — Home, Session, Summary, Word List, Word
  Detail, Stats

## Status

**Working / done:**
- Mobile-first layout: the app shell is `100dvh` with no page-level scroll —
  only `<main>` scrolls, and only screens whose content genuinely exceeds
  one viewport (Word List, Stats) actually need to. Home and the exercise
  screen are sized to fit a standard phone (390×844) in one screen: the
  old "how sessions work" explainer card is gone from Home, replaced with
  three compact stat tiles (learned / sessions / accuracy) and the primary
  CTA pinned to the bottom of the screen; exercise cards use tighter
  spacing throughout and the card itself is a scroll container as a safety
  valve, not the page. Verified at 390×844 with Playwright — Home, the
  learn card, and an MC question with its feedback panel all render with
  zero page scroll.
- Icons instead of emoji everywhere (`lucide-react`): TopBar nav, favorite
  star, search, hints, feedback status (check/minus/x), back/continue
  arrows, stat tiles.
- Real accounts: sign up / sign in / sign out with email + password
  (`src/lib/auth.tsx`, `AuthScreen`). The app is gated behind auth — no
  account, no access, no anonymous fallback. Progress is scoped to
  `auth.uid()` via the same RLS policies as before, so this needed no
  schema changes, only removing the old `signInAnonymously()` call and
  gating the UI on a real session. Handles both possible Supabase project
  configs (email confirmation required or not) — shows a "check your
  inbox" message in the first case, logs straight in in the second.
- Full 4-stage learning engine (see above) driving the primary "Start
  Session" flow: adaptive ~10-word batches, in-session interleaved
  repetition, stage regression on mistakes, long-term spaced review with
  growing intervals, attempt-capped so sessions always terminate.
- Word list with search + filters, word detail, stats screen, session
  summary (now also shows words mastered vs. still in progress) — full
  parity with the original prototype, plus "repeat mistakes" / "practice
  this word" as simple one-off drills alongside the new engine.
- Supabase persistence (`word_progress` incl. stage columns, `format_stats`,
  `session_history`, `app_meta`), scoped per signed-in account via RLS.
- Production build verified locally (`npm run build`, clean `tsc`/`eslint`)
  and confirmed working on Vercel; also click-tested end-to-end locally
  with Playwright against a mocked Supabase backend — including the full
  sign-up → app → logout → sign-in-screen round trip — zero console errors.
- Build no longer crashes if Supabase env vars are missing at build time —
  it now fails softly at runtime with a visible error screen instead.

**Bug found & fixed during Playwright testing:** the learn card is the only
exercise that answers and advances in one click (every other exercise shows
a feedback panel and waits for a separate "Continue" click). Wiring it
through the same two-callback (`onAnswered` + `onNext`) path as the rest
meant two state updates fired back to back inside one synchronous handler —
the second silently discarded the first's queue growth, so every session
quietly died after exactly 10 questions instead of interleaving repeats.
Fixed by giving the learn card its own single atomic handler
(`onLearnAcknowledged` in `AppShell.tsx`) that computes and applies the
whole "record answer + advance index" step in one state update; all other
exercises still use the two-callback path safely, since a real render
happens between their two clicks. Confirmed fixed by re-running the same
Playwright script and inspecting the queue growth directly.

**Needs a one-time manual step (couldn't be automated — no SQL/DDL or Auth
config access from this session's tools):**
- Run `supabase/migrations/0001_init.sql` **and** `0002_learning_stages.sql`
  (in that order) once in the Supabase SQL Editor. If you already ran
  `0001_init.sql` before, you only need `0002_learning_stages.sql` now —
  it's additive (`alter table ... add column if not exists`).
- Confirm the **Email** auth provider is on (default) and decide on the
  **Confirm email** setting — see step 2 above. No action needed if you're
  happy with the default.
- Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
  Vercel project's Environment Variables (values in `.env.example`), then
  redeploy.

**Known limitations vs. a "real" app:**
- Any progress made while the app still used anonymous auth (before this
  change) is orphaned — it lived under a random anonymous user id with no
  way to claim it from a real account. Not a concern for a fresh setup.
- No "forgot password" flow yet — only sign up / sign in / sign out.
- No keyboard shortcuts (Enter-to-submit still works per input, but the
  original's global F/S/H/1-4 shortcuts were dropped in the Next.js
  rewrite to keep state management simple).
- Light theme only, by design — no dark mode toggle.
- No per-word stage badge in the UI (Word List / Word Detail) — this was a
  deliberate choice (see Q&A during design) to keep the engine invisible;
  the session-level "mastered / still in progress" summary is the only
  visible signal.
- No automated tests; correctness so far is verified by local build +
  manual click-through (Playwright) in this session, not a test suite.
