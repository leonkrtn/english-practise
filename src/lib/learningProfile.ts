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
 * The profile is a device-level preference persisted in localStorage, exactly like the mute
 * setting in sound.ts — no Supabase migration needed, and it takes effect on the next session.
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
  /** How many brand-new (stage 0) items may enter a single session. Kept well below the batch
   * size on purpose: a session made entirely of unknown words needs a learn + several test tasks
   * for every single one, which is exactly the "same handful of words over and over" grind. */
  maxNewVocabPerSession: number;
  maxNewGrammarPerSession: number;
  /** Due long-term reviews mixed into a normal session. */
  vocabReviewSample: number;
  grammarReviewSample: number;

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
    maxNewVocabPerSession: 3,
    maxNewGrammarPerSession: 1,
    vocabReviewSample: 3,
    grammarReviewSample: 2,
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
    maxNewVocabPerSession: 4,
    maxNewGrammarPerSession: 2,
    vocabReviewSample: 5,
    grammarReviewSample: 3,
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
    maxNewVocabPerSession: 6,
    maxNewGrammarPerSession: 3,
    vocabReviewSample: 8,
    grammarReviewSample: 4,
    minRepeatGap: 4,
    repeatGapGrowth: 3,
    repeatGapJitter: 3,
    maxAttemptsPerItem: 5,
    masteryStreak: 3,
    reviewIntervalScale: 0.8,
  },
};

export const PROFILE_ORDER: LearningProfileId[] = ["gentle", "standard", "intensive"];

const STORAGE_KEY = "learning-profile";
const DEFAULT_PROFILE: LearningProfileId = "standard";

function isProfileId(value: string | null): value is LearningProfileId {
  return value === "gentle" || value === "standard" || value === "intensive";
}

/** Read straight from localStorage every time rather than caching in a module variable: the
 * engine is called from React render paths that may run before the settings screen has ever
 * mounted, and a stale cached value would silently apply the wrong profile for a whole session. */
export function activeProfileId(): LearningProfileId {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isProfileId(stored) ? stored : DEFAULT_PROFILE;
  } catch {
    // Private-mode Safari and friends throw on localStorage access rather than returning null.
    return DEFAULT_PROFILE;
  }
}

/** The tuning every engine function falls back to when no explicit override is passed. */
export function activeTuning(): LearningTuning {
  return LEARNING_PROFILES[activeProfileId()];
}

/** The default a server render and the hydrating client render both agree on. Reading localStorage
 * during render would make those two disagree, so components subscribe via useSyncExternalStore
 * with this as the server snapshot. */
export function defaultProfileId(): LearningProfileId {
  return DEFAULT_PROFILE;
}

const listeners = new Set<() => void>();

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setActiveProfile(id: LearningProfileId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Nothing to do — the session simply runs on the default profile.
  }
  listeners.forEach((listener) => listener());
}

/** Sessions until an item resurfaces, given how many consecutive long-term reviews it has passed.
 * Scaled by the active profile, and never shorter than one session. */
export function reviewIntervalFor(streak: number, tuning: LearningTuning): number {
  const clamped = Math.min(Math.max(streak, 0), BASE_REVIEW_INTERVALS.length - 1);
  return Math.max(1, Math.round(BASE_REVIEW_INTERVALS[clamped] * tuning.reviewIntervalScale));
}
