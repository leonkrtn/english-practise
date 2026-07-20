-- Lets a user permanently block individual grammar rules ("I don't care about
-- adjective order") — additive to grammar_meta, no new table needed. Blocked
-- rules are excluded app-wide: from the normal grammar learning engine, the
-- "review everything learned" session, and the Writing feature's required
-- grammar picks.

alter table public.grammar_meta
  add column if not exists blocked_rule_ids text[] not null default '{}';
