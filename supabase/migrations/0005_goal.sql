-- The "5-week basics goal": a personal target (all Grammar rules + a core
-- Vocabulary milestone mastered) with a start date and a baseline snapshot,
-- so pace/velocity can be computed as (current - baseline) / days elapsed.
-- Lives on app_meta (the vocab side's per-user singleton) since it spans
-- both domains and only needs one home. Purely additive.

alter table public.app_meta
  add column if not exists goal_started_at timestamptz,
  add column if not exists goal_baseline_total integer;
