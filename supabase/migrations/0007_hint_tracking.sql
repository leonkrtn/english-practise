-- Tracks how many times the Hint button has ever been clicked for a given word, so that data
-- can be used (alongside score) to flag words that need extra practice — a word can have a
-- decent score from always getting there with a hint, which score alone wouldn't surface.

alter table public.word_progress
  add column if not exists hints_used integer not null default 0;
