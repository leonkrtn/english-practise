-- Vocabulary Trainer: per-user progress storage (replaces localStorage)
-- Users are anonymous Supabase Auth users (auth.signInAnonymously()).

create table if not exists public.word_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  score numeric not null default 0,
  times_seen integer not null default 0,
  times_correct integer not null default 0,
  times_incorrect integer not null default 0,
  times_almost integer not null default 0,
  favorite boolean not null default false,
  spelling_errors integer not null default 0,
  confusions integer not null default 0,
  last_seen timestamptz,
  recent_mistake boolean not null default false,
  streak integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table if not exists public.format_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null,
  correct integer not null default 0,
  almost integer not null default 0,
  incorrect integer not null default 0,
  primary key (user_id, format)
);

create table if not exists public.session_history (
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
create index if not exists session_history_user_idx on public.session_history(user_id, occurred_at);

create table if not exists public.app_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_practice_sessions integer not null default 0
);

alter table public.word_progress enable row level security;
alter table public.format_stats enable row level security;
alter table public.session_history enable row level security;
alter table public.app_meta enable row level security;

drop policy if exists "own word_progress" on public.word_progress;
create policy "own word_progress" on public.word_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own format_stats" on public.format_stats;
create policy "own format_stats" on public.format_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own session_history" on public.session_history;
create policy "own session_history" on public.session_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own app_meta" on public.app_meta;
create policy "own app_meta" on public.app_meta
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
