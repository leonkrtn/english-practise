-- Learner-authored rule sets for the Rules mode.
--
-- Only the content lives here. Progress on a custom card stays where every other kind of progress
-- already is — word_progress, keyed by the card's id — because word_id is plain text with no foreign
-- key. That is also why card ids are generated client-side as "custom:<uuid>": the id has to exist
-- before the row does, so an answer given straight after creating a card has somewhere to go.

create table if not exists public.custom_memo_sets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists custom_memo_sets_user_idx on public.custom_memo_sets(user_id, created_at);

create table if not exists public.custom_memo_cards (
  -- "custom:<uuid>", matching the word_progress row that carries this card's learning stage.
  id text primary key,
  set_id uuid not null references public.custom_memo_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  -- The sentence to be reproduced from memory.
  statement text not null,
  explanation text not null default '',
  -- [{ "label": "...", "value": "..." }] — the checkable facts, drilled by the facts exercise.
  facts jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists custom_memo_cards_set_idx on public.custom_memo_cards(set_id, position);
create index if not exists custom_memo_cards_user_idx on public.custom_memo_cards(user_id);

alter table public.custom_memo_sets enable row level security;
alter table public.custom_memo_cards enable row level security;

drop policy if exists "own custom_memo_sets" on public.custom_memo_sets;
create policy "own custom_memo_sets" on public.custom_memo_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own custom_memo_cards" on public.custom_memo_cards;
create policy "own custom_memo_cards" on public.custom_memo_cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
