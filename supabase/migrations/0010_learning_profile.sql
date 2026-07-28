-- The learning-algorithm tuning ("Ruhig" / "Standard" / "Intensiv" — see
-- src/lib/learningProfile.ts) is per-account state, not a device preference: it has to follow the
-- learner between devices exactly like blocked_word_ids or xp, so it lives on app_meta, the same
-- per-user singleton, rather than in localStorage.

alter table public.app_meta
  add column if not exists learning_profile text not null default 'standard';

alter table public.app_meta
  drop constraint if exists app_meta_learning_profile_check;
alter table public.app_meta
  add constraint app_meta_learning_profile_check
    check (learning_profile in ('gentle', 'standard', 'intensive'));
