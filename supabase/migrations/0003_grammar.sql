-- Grammar learning engine: fully separate from vocabulary progress (own
-- tables, own session clock via grammar_meta), same stage-pipeline shape
-- as word_progress but scoped to grammar rules instead of words.

create table if not exists public.grammar_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id text not null,
  stage smallint not null default 0,
  review_streak integer not null default 0,
  due_at_session integer,
  times_seen integer not null default 0,
  times_correct integer not null default 0,
  times_incorrect integer not null default 0,
  times_almost integer not null default 0,
  last_seen timestamptz,
  recent_mistake boolean not null default false,
  streak integer not null default 0,
  score numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, rule_id)
);

alter table public.grammar_progress
  drop constraint if exists grammar_progress_stage_range;
alter table public.grammar_progress
  add constraint grammar_progress_stage_range check (stage between 0 and 4);

create table if not exists public.grammar_format_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null,
  correct integer not null default 0,
  almost integer not null default 0,
  incorrect integer not null default 0,
  primary key (user_id, format)
);

create table if not exists public.grammar_session_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  total integer not null,
  correct integer not null,
  almost integer not null,
  incorrect integer not null,
  accuracy integer not null,
  format text
);
create index if not exists grammar_session_history_user_idx on public.grammar_session_history(user_id, occurred_at);

create table if not exists public.grammar_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_practice_sessions integer not null default 0
);

alter table public.grammar_progress enable row level security;
alter table public.grammar_format_stats enable row level security;
alter table public.grammar_session_history enable row level security;
alter table public.grammar_meta enable row level security;

drop policy if exists "own grammar_progress" on public.grammar_progress;
create policy "own grammar_progress" on public.grammar_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own grammar_format_stats" on public.grammar_format_stats;
create policy "own grammar_format_stats" on public.grammar_format_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own grammar_session_history" on public.grammar_session_history;
create policy "own grammar_session_history" on public.grammar_session_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own grammar_meta" on public.grammar_meta;
create policy "own grammar_meta" on public.grammar_meta
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
