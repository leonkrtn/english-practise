-- Learning-stage engine: adds a spaced-repetition stage per word on top of
-- the existing score/streak tracking (which stays as-is for the word list
-- / stats screens). Stage drives session composition only.
--
-- stage: 0 new, 1 learned (needs quiz), 2 quizzed (needs contextual use),
--        3 applied (needs free production), 4 produced (mastered-active,
--        enters long-term spaced review).
-- review_streak: consecutive successful long-term reviews at stage 4,
--        drives the growing review interval.
-- due_at_session: the value of app_meta.total_practice_sessions at which
--        this word becomes eligible to resurface for long-term review;
--        null while stage < 4 or immediately after a regression.

alter table public.word_progress
  add column if not exists stage smallint not null default 0,
  add column if not exists review_streak integer not null default 0,
  add column if not exists due_at_session integer;

alter table public.word_progress
  drop constraint if exists word_progress_stage_range;
alter table public.word_progress
  add constraint word_progress_stage_range check (stage between 0 and 4);
