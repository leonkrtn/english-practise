/**
 * Every knob the learning engine turns, in one place — and the three presets the learner can
 * switch between.
 *
 * Before this file existed the numbers that shape a session (batch size, how far apart a word
 * repeats, how many correct answers mastery costs) were scattered as bare literals across
 * learning.ts and grammarLearning.ts, duplicated between the two domains, and impossible to
 * change without editing code. Collecting them here is what makes "the same session, but calmer"
 * or "the same session, but denser" a one-click choice instead of a rewrite.
 *
 * This file only holds the presets themselves — pure data, no persistence. The learner's actual
 * choice is account state stored on app_meta.learning_profile (migration 0010) and lives in
 * store.tsx alongside blocked_word_ids and xp, so it follows the account across devices instead of
 * being stuck to one browser. Engine functions in learning.ts / grammarLearning.ts take the
 * resulting LearningTuning as a required argument rather than reaching for a module-level default,
 * so there is no path through the algorithm that silently runs off a client-only fallback.
 */

export type LearningProfileId = "gentle" | "standard" | "intensive";

export interface LearningTuning {
  id: LearningProfileId;
  label: string;
  /** One-line description shown in Settings. */
  summary: string;

  // ---- How much a session takes on ----
  /** Vocabulary words worked on per session (in-progress first, then new ones fill up). */
  vocabBatchSize: number;
  /** Grammar rules worked on per session. */
  grammarBatchSize: number;
  /** Math rules worked on per session. Sits between the vocabulary and grammar sizes: a math rule
   * costs more than a word (its learn card is a page of explanation) but its practice tasks are
   * short, so a session can carry more of them than grammar's multi-sentence production drills. */
  mathBatchSize: number;
  /** How many brand-new (stage 0) items may enter a single session. Kept well below the batch
   * size on purpose: a session made entirely of unknown words needs a learn + several test tasks
   * for every single one, which is exactly the "same handful of words over and over" grind. */
  maxNewVocabPerSession: number;
  maxNewGrammarPerSession: number;
  maxNewMathPerSession: number;
  /** Due long-term reviews mixed into a normal session. */
  vocabReviewSample: number;
  grammarReviewSample: number;
  mathReviewSample: number;

  // ---- How often the same item comes back ----
  /** Hard floor on how many other questions must sit between two sightings of the same item.
   * The old engine used 2, which is why a word could feel like it was being asked on a loop. */
  minRepeatGap: number;
  /** How much further out each *additional* repeat of the same item is pushed. This is expanding
   * retrieval practice: recalling something after a longer delay each time is what actually
   * builds durable memory, whereas re-asking at a constant short gap mostly trains recognition
   * of the question. */
  repeatGapGrowth: number;
  /** Random slack added on top of the computed gap so the rhythm never becomes predictable. */
  repeatGapJitter: number;
  /** Ceiling on how many times one item may be asked within a single session. */
  maxAttemptsPerItem: number;

  // ---- How hard mastery is to earn and lose ----
  /** Consecutive correct answers required at the last stage before an item counts as mastered. */
  masteryStreak: number;
  /** Multiplier on the review-interval ladder. Above 1 = longer gaps between reviews. */
  reviewIntervalScale: number;
}

/** The spacing ladder every profile scales. Fibonacci-ish, in sessions, and longer at the top end
 * than the old [2,3,5,8,13,21] so a word you have genuinely known for months stops eating review
 * slots that newer words need more. */
export const BASE_REVIEW_INTERVALS = [2, 3, 5, 8, 13, 21, 34] as const;

export const LEARNING_PROFILES: Record<LearningProfileId, LearningTuning> = {
  gentle: {
    id: "gentle",
    label: "Ruhig",
    summary: "Kleine Portionen, viel Abstand zwischen Wiederholungen. Gut, wenn sich Sessions gehetzt anfühlen.",
    vocabBatchSize: 6,
    grammarBatchSize: 3,
    mathBatchSize: 5,
    maxNewVocabPerSession: 3,
    maxNewGrammarPerSession: 1,
    maxNewMathPerSession: 2,
    vocabReviewSample: 3,
    grammarReviewSample: 2,
    mathReviewSample: 3,
    minRepeatGap: 6,
    repeatGapGrowth: 4,
    repeatGapJitter: 2,
    maxAttemptsPerItem: 3,
    masteryStreak: 2,
    reviewIntervalScale: 1.3,
  },
  standard: {
    id: "standard",
    label: "Standard",
    summary: "Ausgewogenes Tempo — genug Abwechslung, damit du die Wörter lernst und nicht die Aufgaben.",
    vocabBatchSize: 10,
    grammarBatchSize: 5,
    mathBatchSize: 8,
    maxNewVocabPerSession: 4,
    maxNewGrammarPerSession: 2,
    maxNewMathPerSession: 4,
    vocabReviewSample: 5,
    grammarReviewSample: 3,
    mathReviewSample: 4,
    minRepeatGap: 5,
    repeatGapGrowth: 3,
    repeatGapJitter: 2,
    maxAttemptsPerItem: 4,
    masteryStreak: 3,
    reviewIntervalScale: 1,
  },
  intensive: {
    id: "intensive",
    label: "Intensiv",
    summary: "Mehr Stoff pro Session und strengere Mastery. Für Tage, an denen du wirklich Druck machen willst.",
    vocabBatchSize: 14,
    grammarBatchSize: 7,
    mathBatchSize: 12,
    maxNewVocabPerSession: 6,
    maxNewGrammarPerSession: 3,
    maxNewMathPerSession: 6,
    vocabReviewSample: 8,
    grammarReviewSample: 4,
    mathReviewSample: 6,
    minRepeatGap: 4,
    repeatGapGrowth: 3,
    repeatGapJitter: 3,
    maxAttemptsPerItem: 5,
    masteryStreak: 3,
    reviewIntervalScale: 0.8,
  },
};

export const PROFILE_ORDER: LearningProfileId[] = ["gentle", "standard", "intensive"];

/** What a brand-new account (or a row from before migration 0010) gets: app_meta.learning_profile
 * defaults to this value at the database level too, so the two defaults can't drift apart. */
export const DEFAULT_PROFILE_ID: LearningProfileId = "standard";

export function isLearningProfileId(value: unknown): value is LearningProfileId {
  return value === "gentle" || value === "standard" || value === "intensive";
}

export function tuningFor(id: LearningProfileId): LearningTuning {
  return LEARNING_PROFILES[id];
}

/** Sessions until an item resurfaces, given how many consecutive long-term reviews it has passed.
 * Scaled by the active profile, and never shorter than one session. */
export function reviewIntervalFor(streak: number, tuning: LearningTuning): number {
  const clamped = Math.min(Math.max(streak, 0), BASE_REVIEW_INTERVALS.length - 1);
  return Math.max(1, Math.round(BASE_REVIEW_INTERVALS[clamped] * tuning.reviewIntervalScale));
}
