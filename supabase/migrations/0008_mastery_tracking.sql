-- Timestamps when a word/rule first ever reached stage 4 ("gelernt"), so Stats can show a real
-- cumulative "words/rules learned over time" chart instead of only a current snapshot. Words/
-- rules already at stage 4 before this migration simply have mastered_at = null — the app treats
-- them as a baseline count at the start of the chart window rather than backfilling a fake date.

alter table public.word_progress
  add column if not exists mastered_at timestamptz;

alter table public.grammar_progress
  add column if not exists mastered_at timestamptz;
