-- Two additive features, one migration:
--
-- 1. Gamification. XP is a single running total per user (levels are derived from it in the app,
--    so the curve can be retuned later without a data migration). Unlocked badges are stored as an
--    id array rather than a row per badge: the set is small, always read as a whole, and storing it
--    explicitly — instead of re-deriving it from progress every load — is what lets the app tell
--    "unlocked just now" apart from "unlocked months ago" and celebrate only the former.
--    Both live on app_meta, the vocab side's per-user singleton, since they span both domains.
--
-- 2. Test history. A test is a graded exam, deliberately kept out of session_history: it does not
--    touch the learning stages and is reported on the Portuguese 0-20 scale, so mixing it into the
--    practice-session feed would distort both the accuracy trends and the session counters.

alter table public.app_meta
  add column if not exists xp integer not null default 0,
  add column if not exists badge_ids text[] not null default '{}';

create table if not exists public.test_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  -- "vocab" | "grammar" | "both"
  scope text not null,
  total integer not null,
  correct integer not null,
  accuracy integer not null,
  -- Portuguese higher-education scale, 0-20, one decimal (e.g. 15.5).
  grade numeric(4, 1) not null,
  -- Seconds the learner took, for the result screen and personal bests.
  duration_seconds integer not null default 0
);
create index if not exists test_history_user_idx on public.test_history(user_id, occurred_at);

alter table public.test_history enable row level security;

drop policy if exists "own test_history" on public.test_history;
create policy "own test_history" on public.test_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
