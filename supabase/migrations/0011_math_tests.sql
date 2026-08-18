-- Math test history.
--
-- Deliberately its own table rather than a row in test_history: a math test is scored in points and
-- percent with a pass threshold, not on the Portuguese 0-20 scale, and it carries a topic scope that
-- has no counterpart on the English side. Squeezing it into test_history would mean a nullable grade
-- column and a scope column meaning two different things depending on the row.
--
-- Math RULE progress (which rules are learned, their spaced-repetition stage) needs no migration at
-- all: rule ids live in word_progress alongside vocabulary ids, whose word_id is plain text with no
-- foreign key, and WordState already carries stage / review_streak / due_at_session.

create table if not exists public.math_test_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  -- "all" | "group:<group>" | "topic:<topic>" — see scopeId() in src/lib/mathTest.ts
  scope text not null,
  points numeric(6, 2) not null,
  total integer not null,
  percent integer not null,
  passed boolean not null default false,
  duration_seconds integer not null default 0
);
create index if not exists math_test_history_user_idx on public.math_test_history(user_id, occurred_at);

alter table public.math_test_history enable row level security;

drop policy if exists "own math_test_history" on public.math_test_history;
create policy "own math_test_history" on public.math_test_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
