# Vocabulary Trainer — EN/DE B2→C1

Next.js rebuild of the vocabulary trainer: 1,948 English↔German verbs and
adjectives, clean light "Apple" design, mobile-first. Home scrolls freely
(it's grown a full stats dashboard); the exercise/session view never scrolls
at the page level — only the exercise card itself scrolls internally if its
content needs more room. Progress is tied to a real account (email +
password via Supabase Auth) — you have to sign up before the app lets you
in, and everything you do is saved against that account instead of just a
browser. Sessions run on a 4-stage spaced-repetition engine (see below)
rather than a fixed exercise mix.

Alongside vocabulary there's a second, independent learning track:
**Grammar** — ~25 curated B2→C1 rules (tenses, conditionals, passive,
reported speech, relative clauses, modals, verb patterns, word order,
articles/nouns, prepositions, comparisons), covering sentence structure and
logic rather than single words. Vocabulary and Grammar run on the same
stage-based engine but keep entirely separate progress, and can be
practiced alone or interleaved in a **Mixed** session. Individual grammar
rules can be permanently blocked from Settings ("I don't care about
adjective order") — a blocked rule disappears app-wide: from normal
learning, from "review everything learned", and from Writing's required
grammar picks.

A fourth mode, **Writing**, is a free-writing exercise: pick a topic, write
a short English text that must use a handful of your already-learned words
and try to work in a couple of already-learned grammar constructs, then run
it through a real grammar/spelling check (the public LanguageTool API) —
errors are highlighted right in your text with correction suggestions
below. Unlocks once you've learned at least 5 words and 2 (unblocked)
grammar rules.

A fifth mode, **Linking**, drills sentence combining — the single most
research-backed technique for improving sentence-level writing quality (85+
studies since the 1970s). Each round shows two short, plain clauses and a
target logical relationship (contrast, cause, result, condition, time,
purpose, addition, example); you combine them into one natural sentence
using an appropriate connector, checked deterministically for the connector
plus a real LanguageTool grammar/spelling pass. A missing curated connector
no longer fails a grammatically clean sentence outright — it downgrades to
"almost" instead of "incorrect", since a correct sentence that just phrases
the relationship differently shouldn't be marked wrong. No unlock
requirement — it doesn't depend on learned vocabulary/grammar, so it's
available from the start.

Writing now draws from **35** topic templates (up from 10), each combined
with a fresh random pick of required words/grammar per attempt.

A **Goal** screen (flag icon in the top bar, plus a teaser banner on Home)
tracks a personal, honestly-calculated 5-week target: all active Grammar
rules plus a 600-word vocabulary milestone (chosen — not the full ~1,900-word
catalog — because a few hundred core words are what general language-
acquisition research says covers most everyday conversation; that's the
realistic definition of "English feels natural" at this stage). The clock
starts automatically the first time the app loads after this feature ships,
snapshotting current combined progress as a baseline so pace is computed
honestly as `(progress since start) / days elapsed`, compared against the
pace still required to hit the target on time. The Goal screen shows overall
progress, a Vocabulary/Grammar breakdown, current vs. required daily pace,
an on-track/behind-schedule badge, and a projected completion estimate if
the current pace would miss the 5-week window.

## Setup

1. In the Supabase project **English-practise**, open the SQL Editor and run,
   in order:
   - `supabase/migrations/0001_init.sql` — creates `word_progress`,
     `format_stats`, `session_history`, `app_meta`, all RLS-scoped to
     `auth.uid()`.
   - `supabase/migrations/0002_learning_stages.sql` — adds the `stage`,
     `review_streak`, `due_at_session` columns that drive the learning
     engine below.
   - `supabase/migrations/0003_grammar.sql` — creates `grammar_progress`,
     `grammar_format_stats`, `grammar_session_history`, `grammar_meta`,
     the fully separate tables backing the Grammar track (same RLS pattern,
     scoped to `auth.uid()`).
   - `supabase/migrations/0004_grammar_blocking.sql` — adds a
     `blocked_rule_ids text[]` column to `grammar_meta` for the
     per-rule blocking feature (Settings screen). Purely additive.
   - `supabase/migrations/0005_goal.sql` — adds `goal_started_at` and
     `goal_baseline_total` columns to `app_meta` for the 5-week goal
     feature (Goal screen). Purely additive.
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

Each word moves through 5 stages, tracked per-word in `word_progress.stage`.
The method follows well-supported memory research rather than one specific
named system: retrieval practice / the testing effect (you're always being
asked to produce the answer, not just re-read it), increasing retrieval
difficulty (recognition → cued recall → free production), spaced repetition
(the Ebbinghaus forgetting curve — reviews get further apart the more times
you get a word right), and interleaving (repeats are spread through the
session, never back-to-back, which research shows beats blocked practice).

| Stage | Task | Exercise used |
|---|---|---|
| 0 → 1 | **Kennenlernen** — plain info card (word, translation, example, collocations) | `LearnExercise` |
| 1 → 2 | **Abfragen** — recognition: multiple choice, or a Word Matching round (see below) | `McExercise` / `MatchExercise` |
| 2 → 3 | **Einbauen** — cued recall: use the word in a sentence context | `GapExercise` |
| 3 → 4 | **Schreiben** — free recall: type a full translated sentence | `SentenceExercise` |
| 4 (mastered-active) | **Wiederholung** — periodic long-term review | `TranslateExercise` |

**You only ever type English, never German.** German is always the
*meaning cue* (shown as the prompt, a hint, or a "German meaning:" label) —
you're never asked to produce German spelling. `directionForKind()` forces
`de-en` (German shown → English typed) for every typing-based stage
(Schreiben, Wiederholung); the fill-in-the-blank stage (Einbauen) fills an
English word into an English sentence regardless of direction. Only
Multiple Choice, which requires no typing, still tests recognition in both
directions for well-rounded comprehension.

**Word Matching is back** as the default way to clear the Abfragen stage.
Rather than testing each word individually, words due for their first
recognition test are pooled (`matchPool` in session state) until 4 are
ready, then presented together as a match-the-pairs round
(`MATCH_GROUP_SIZE = 4`, `popMatchGroups()`); leftovers get flushed as a
smaller round (or an individual MC question, if only one word remains) at
the end of the session so nothing goes untested. This typically kicks in
partway through your very first session, once a handful of new words have
been introduced.

Rules (`src/lib/learning.ts`):
- A session (`AppShell.startLearningSession`) pulls ~10 "active" words
  (in-progress words first, then new ones) plus up to 4 due long-term
  reviews, and builds a shuffled starting queue — one task per word at its
  current stage (or in the shared match pool, for stage-1 words). Due
  reviews are picked **most-overdue-first**, not randomly — with a growing
  pool of stage-4 ("Known") words, a fixed sample per session only clears
  the backlog if the longest-waiting words go first; random sampling could
  otherwise skip some indefinitely while always re-picking fresher ones.
  This is the "ab und zu abgefragt" confirmation that a mastered word is
  actually still remembered, not just marked done and forgotten about.
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
  badges in Word List / Word Detail) except for one visible signal: the
  **Known** filter in Word List and the **Known** stat on Home/Stats both
  mean "reached stage 4" — that's your dictionary of words you actually
  know, distinct from the older score-based practice stats.
- "Repeat mistakes" (from the summary) and "Practice this word" (from word
  detail) are simple one-off drills and intentionally bypass the stage
  engine — see `AppShell`'s `startWithWords`. They also only ever ask for
  English input, same rule as the main engine.

## Grammar engine

A second, parallel track (`src/lib/grammarLearning.ts`, `grammarStore.tsx`)
mirrors the vocabulary stage engine's shape exactly — same 5 stages, same
most-overdue-first review scheduling, same per-item attempt cap — but runs
on `GrammarRule` instead of `Word`, has its own Supabase tables and its own
`total_practice_sessions` clock, and has no Word Matching equivalent (no
grouping stage; grammar rules are always tested one at a time).

| Stage | Task | Exercise used |
|---|---|---|
| 0 → 1 | **Kennenlernen** — rule explanation + several example sentences | `GrammarLearnExercise` |
| 1 → 2 | **Abfragen** — multiple choice: which sentence is correct | `GrammarMcExercise` |
| 2 → 3 | **Einbauen** — fill in the gap with the correct form | `GrammarGapExercise` |
| 3 → 4 | **Schreiben** — rebuild a scrambled sentence in the right order | `GrammarBuildExercise` |
| 4 (mastered-active) | **Wiederholung** — tap the wrong word in a broken sentence | `GrammarErrorExercise` |

Rule data lives in `src/lib/grammar-data.ts` (`GRAMMAR_RULES`, ~25 entries),
each with a category badge (e.g. "Konditionalsätze", "Zeiten",
"Wortstellung") shown on every exercise card.

**Mode selector & Mixed sessions:** `AppShell`'s `SessionMode` is
`"vocab" | "grammar" | "mixed"`, chosen via the 3-way switcher on Home. A
Mixed session builds one growing, interleaved queue over a `UnifiedItem`
discriminated union (`{domain: "vocab", item}` | `{domain: "grammar",
item}`) — both domains' due items, retries, and stage progressions share the
same in-session growth/interleaving logic as the vocab-only engine, just
routed to the right exercise component (`ExerciseRouter` vs.
`GrammarExerciseRouter`) and the right store (`updateWord`/`recordSession`
vs. `updateRule`/`recordSession` on `useGrammarStore()`) per item. Ending a
Mixed session records a session entry in each track independently (only if
that track actually had results), so Vocabulary and Grammar stats, streaks,
and review schedules never bleed into each other.

**Blocking rules:** `grammar_meta.blocked_rule_ids` (a plain `text[]`,
loaded into `grammarStore.blockedRuleIds` as a `Set<string>`) is checked
everywhere a rule pool is built — `activeGrammarRules()` in
`grammarLearning.ts` is the single source of truth, used by
`buildGrammarBatch`, the "review everything learned" seed, and Home/Stats'
totals and category breakdowns. Toggled from the new Settings screen
(`SettingsScreen.tsx`, gear icon in the TopBar) — one switch per rule,
grouped by category for browsability, no bulk "block whole category"
action (blocking is per-rule by design).

## Writing

A fourth mode alongside Vocabulary/Grammar/Mixed, architecturally separate
from the stage engine — it's a single free-text submission checked once at
the end, not a queue of graded exercises.

- `src/lib/writingTopics.ts` — 10 base topic templates ("Grundgerüste");
  `AppShell.startWritingSession()` picks one at random each time, plus a
  fresh random sample of `WRITING_MIN_WORDS` (5) already-mastered
  (stage-4) words and `WRITING_MIN_RULES` (2) already-mastered, unblocked
  grammar rules — so the concrete task differs on every attempt even
  though the topic pool itself is fixed. The mode tile is disabled on Home
  with an explanatory hint until both minimums are met.
- `src/components/screens/WritingScreen.tsx` — shows the topic, the
  required words/rules as live-updating chips (checked off as soon as the
  writer's current text plausibly uses them), a textarea, and a "Prüfen"
  button.
- **Required words** are checked with a real (if lenient) stem match
  (`textUsesWord` in `src/lib/grammarUsageCheck.ts`) — inflected forms like
  "traveled" count for "travel". This is exact and does gate the flow (the
  chip only turns green once genuinely found in the text).
- **Required grammar** has no reliable way to verify actual construct usage
  without an LLM, so `textLikelyUsesGrammar` is an intentionally-labeled
  best-effort heuristic (checks for the rule's own gap-fill answer word,
  falling back to a per-category marker-word list) — shown as an advisory
  checklist, never a hard gate.
- **Grammar/spelling checking** is real: `src/lib/languageTool.ts` calls
  the public LanguageTool API (`api.languagetool.org/v2/check`, no key
  needed) directly from the browser. Matches are rendered as inline
  `<mark>` highlights in the submitted text (built as React text-node
  segments from the match offsets, not `dangerouslySetInnerHTML` — safe
  against both the API response and the writer's own input) plus a list
  below with each issue's category, message, and suggested replacements.
- Finishing a check records one entry to the existing
  `grammar_session_history` table with `format: "writing"` (no new table
  needed) — graded `correct` (all required words used, zero LanguageTool
  issues) / `almost` (words used, issues found) / `incorrect` (required
  words missing) — so Writing attempts show up in Home's streak, activity
  heatmap, and "Letzte Sessions" list (labeled "Writing", not "Grammar").

## Linking (sentence combining)

A fifth mode built specifically to address "I can't write really good
sentences" — sentence combining is the most consistently-replicated
technique in the writing-instruction research for improving syntactic
maturity and sentence quality, and works best when connectors are taught
grouped by logical relationship rather than as one big list (both from
research surveyed before building this — see the git history for sources).

- `src/lib/connectors-data.ts` — 8 connector categories (Addition,
  Contrast, Cause, Result, Condition, Time, Purpose, Example), each with
  its own accepted-connector word list (expanded with more synonyms per
  category — e.g. Contrast now also accepts "nevertheless", "nonetheless",
  "on the contrary"), plus a curated bank of ~45 short clause pairs tagged
  by category with a model combined sentence.
- `AppShell.startLinkingSession()` samples one clause pair per category
  (up to `LINKING_BATCH_SIZE` = 6), shuffled — so a session always spans
  several different relationship types rather than drilling one repeatedly.
- `src/components/exercises/LinkingExercise.tsx` — rendered inside the
  existing `SessionScreen` chrome (progress bar, exit button — same as
  the vocab/grammar queue, just with no favorite star), so it reuses that
  machinery instead of duplicating it the way `WritingScreen` had to.
  Shows both clauses, a "Bindewörter zeigen" hint revealing that
  category's connector bank, a text field (Enter confirms), and a
  "Prüfen" button.
- **Connector usage is a deterministic check**
  (`findUsedConnector` in `src/lib/connectorCheck.ts`) — whole-word/phrase
  matching against that category's accepted list — combined with a real
  LanguageTool grammar/spelling pass (same client + the shared
  `renderHighlighted` helper from `src/lib/textHighlight.tsx`, used by both
  Writing and Linking). Grading: connector found + clean → `correct`;
  connector found + issues → `almost`; no connector but otherwise clean →
  `almost` (a grammatically correct sentence that just phrases the
  relationship differently isn't wrong, it just missed the drill's specific
  focus); no connector + real issues → `incorrect`.
- The model sentence for that pair is always shown after checking
  ("So könnte es auch klingen") as a reference, never presented as the
  only right answer.
- Finishing a session records one aggregate entry to
  `grammar_session_history` with `format: "linking"` (same pattern as
  Writing, no new table), and each item also logs to
  `grammar_format_stats` for the per-format accuracy breakdown on Stats.
  No unlock gate — always available from Home.

## Goal (5-week basics target)

A personal, honestly-calculated target rather than a marketing number:
"all basics" is defined as all active Grammar rules (finite, ~25) plus a
600-word Vocabulary milestone. 600 is a deliberate, realistic pick — not
the full ~1,900-word catalog, which at a 5-week pace would require ~56
newly-mastered words/day and isn't achievable — chosen because general
language-acquisition research holds that a few hundred core words cover
most everyday conversation, which is what "English feels natural" actually
means at this stage.

- `src/lib/goal.ts` — `computeGoalStatus()`: pure calculation taking a
  start date, a baseline snapshot, and current vocab/grammar counts, and
  returning progress %, days elapsed/remaining, current vs. required daily
  pace, on-track/behind-schedule, and a projected-completion estimate.
  Pace is computed as `(current combined progress - baseline) / days
  elapsed` — the baseline is a one-time snapshot of combined progress taken
  when the goal starts, so pace reflects progress made *since* starting the
  goal, not lifetime progress. The first day is always treated as on-track
  (no penalizing "behind schedule" before there's any measurable pace yet).
- `supabase/migrations/0005_goal.sql` adds `goal_started_at` and
  `goal_baseline_total` to `app_meta`; `src/lib/store.tsx` loads them and
  exposes `startGoalIfNeeded(baselineTotal)`, an idempotent upsert guarded
  inside the `setState` updater against double-starting.
- `AppShell.tsx` has a one-time `useEffect` that calls
  `startGoalIfNeeded` with today's combined vocab+grammar progress the
  first time the app loads after this feature ships (a no-op on every
  later load, since `goal_started_at` is already set).
- `src/components/screens/GoalScreen.tsx` — the dedicated Goal screen:
  overall progress ring/bar, a Vocabulary/Grammar breakdown, and a "Dein
  Tempo" panel with current vs. required daily pace and a projected
  completion estimate if the current pace would miss the 5-week window.
  Reachable via a new Flag icon in `TopBar` and a compact teaser banner at
  the top of Home that shows live progress % and days remaining.

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
- `src/lib/grammar-data.ts` — the ~25-rule Grammar dataset and typed model
  (`GrammarRule`)
- `src/lib/grammarLearning.ts` — the Grammar stage engine, parallel to
  `learning.ts`
- `src/lib/grammarStore.tsx` — React context wrapping Supabase reads/writes
  for the signed-in user's Grammar progress (separate tables from vocab)
- `src/components/grammar-exercises/*` — the 5 Grammar exercise types
  (learn, multiple choice, gap fill, sentence build, error-tap) plus
  `GrammarExerciseRouter` and the shared `CategoryBadge`
- `src/components/screens/*` — Home (Vocabulary/Grammar/Mixed/Writing/
  Linking mode switcher + stats dashboard + Goal teaser banner), Session,
  Summary, Word List, Word Detail, Stats, Settings (grammar rule blocking),
  Writing, Goal (5-week basics target, see below)
- `src/lib/writingTopics.ts`, `src/lib/languageTool.ts`,
  `src/lib/grammarUsageCheck.ts` — the Writing feature (see below)
- `src/lib/connectors-data.ts`, `src/lib/connectorCheck.ts`,
  `src/components/exercises/LinkingExercise.tsx` — the Linking (sentence
  combining) feature (see below); `src/lib/textHighlight.tsx` is the
  LanguageTool-match highlighter shared by both Writing and Linking
- `src/lib/sound.ts` — synthesized Web Audio feedback tones (correct/
  almost/incorrect) with a mute toggle persisted in `localStorage`,
  wired into the shared `FeedbackPanel` so every exercise type gets it
  for free; `TopBar` has the mute button
- `src/lib/goal.ts`, `src/components/screens/GoalScreen.tsx` — the 5-week
  basics goal feature (see above)

## Status

**Working / done:**
- Writing mode (topic + required learned words/grammar + real LanguageTool
  grammar/spelling check), per-rule grammar blocking (new Settings screen),
  and Duolingo-style feedback sounds with a mute toggle — see the Writing
  and Grammar-engine sections above. Verified with Playwright against a
  mocked Supabase backend and a mocked LanguageTool endpoint: the Writing
  tile is correctly disabled with an explanatory hint below the learned-word
  threshold, the required-word chips turn green live as matching text is
  typed, a submitted spelling mistake is highlighted inline with the right
  suggestion rendered below, finishing a check logs a `format: "writing"`
  entry that shows up in Home's "Letzte Sessions" list, and toggling a rule
  off in Settings persists to `blocked_rule_ids` — zero console errors
  throughout. (One dev-only artifact ruled out during testing: React Strict
  Mode double-invokes the state-updater functions in `store.tsx`/
  `grammarStore.tsx` that call Supabase directly inside `setState(prev =>
  ...)`, so session-recording network calls appear to double-fire in `npm
  run dev` — confirmed via a production build that this never happens
  outside dev mode, so it's not a real bug, just how Strict Mode's
  purity-checking works.)
- English-only typing + Word Matching brought back (see Learning engine
  above for the research rationale and how pooling works) — verified with
  Playwright: Home has no Direction picker anymore, a match round reliably
  appears after ~4 new words in a first session and is fully solvable, and
  a typed prompt was confirmed to show German with "Translate to English"
  (never the reverse). Word List's "Mastered" filter was renamed **Known**
  and now means stage 4 (consistent with Home's "Gelernt" tile and Stats),
  not the old score threshold — that's the "dictionary of words I know".
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

- Grammar track (see Grammar engine above): ~25 rules across 5 stages, its
  own Supabase tables, mode selector on Home (Vocabulary / Grammar / Mixed),
  Mixed sessions interleaving both domains in one queue, combined Summary
  and Stats views. Verified with Playwright against a mocked Supabase
  backend: a pure Grammar session runs learn → MC → gap → build → error
  through to the Summary screen with zero console errors; a Mixed session
  was driven through 25 steps and confirmed to genuinely interleave vocab
  items ("Neues Verb"/"Neues Adjektiv" badges) with grammar rule categories
  ("Konditionalsätze", "Zeiten", "Wortstellung", …) in one growing queue,
  also zero console errors; `tsc --noEmit`, `eslint`, and a clean
  `next build` all pass.

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

- 35 Writing topics (up from 10) and a softer Linking grading rule (a
  grammatically clean sentence without a curated connector now scores
  "almost" instead of a hard "incorrect"), plus expanded per-category
  connector synonym lists — see the Writing and Linking sections above.
- The 5-week basics Goal feature (see Goal section above): migration
  `0005_goal.sql`, `src/lib/goal.ts`'s pace calculation, `GoalScreen`, the
  Home teaser banner, and the `TopBar` flag icon. Verified with Playwright
  against a mocked Supabase backend: the goal auto-starts on first load and
  persists a baseline snapshot via an `app_meta` upsert, the Home banner
  renders live progress and days remaining and navigates to the Goal
  screen on click, the Goal screen renders its progress bar, Vocabulary/
  Grammar breakdown, and pace panel correctly, and the flag icon in
  `TopBar` shows the active state on the Goal screen — zero console errors
  throughout. `tsc --noEmit`, `eslint`, and a clean `next build` all pass.

**Needs a one-time manual step (couldn't be automated — no SQL/DDL or Auth
config access from this session's tools):**
- Run `supabase/migrations/0001_init.sql`, `0002_learning_stages.sql`,
  `0003_grammar.sql`, `0004_grammar_blocking.sql`, and `0005_goal.sql` (in
  that order) once in the Supabase SQL Editor. If you already ran the first
  four, you only need `0005_goal.sql` now — it's two additive columns on
  `app_meta` (`goal_started_at`, `goal_baseline_total`), nothing else
  changes.
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
