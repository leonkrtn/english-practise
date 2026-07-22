-- Lets a user permanently exclude individual vocabulary words ("I don't need
-- this one") — additive to app_meta, no new table needed. Mirrors
-- 0004_grammar_blocking.sql's grammar_meta.blocked_rule_ids for the vocab
-- side. Blocked words are excluded app-wide: from normal learning, review,
-- Writing's required-word picks, and Reading's vocab-gap eligibility.

alter table public.app_meta
  add column if not exists blocked_word_ids text[] not null default '{}';
