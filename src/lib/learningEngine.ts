/**
 * The domain-agnostic core of the learning algorithm, shared by the vocabulary engine
 * (learning.ts) and the grammar engine (grammarLearning.ts).
 *
 * Both engines used to carry their own near-identical copy of this logic, which meant every
 * improvement had to be made — and kept in sync — twice. Everything here is pure and takes its
 * numbers from a LearningTuning, so the two domains can share the mechanics while still differing
 * in batch size, format catalogue and pacing.
 *
 * The three ideas that do the heavy lifting against "I'm learning the exercises, not the words":
 *
 *  1. **Expanding gaps.** A repeat of the same item is pushed further out every time it comes
 *     back, instead of always reappearing 2–4 questions later.
 *  2. **Bags, not coin flips.** Formats and directions are drawn from a shuffled deck that
 *     refills when empty, so they come out evenly spread rather than clumping the way independent
 *     random picks do.
 *  3. **Format memory.** An item never gets tested in the same format twice in a row, in a
 *     session or across sessions.
 */

import { shuffle } from "./utils";
import type { AnswerResultKind, LearningStage } from "./types";
import { reviewIntervalFor, type LearningTuning } from "./learningProfile";

// ---------------------------------------------------------------------------
// Spacing: when may an item come back?
// ---------------------------------------------------------------------------

/**
 * Where in the (growing) queue a follow-up task for the item just answered should be inserted.
 *
 * The old rule was `currentIndex + 2..4` regardless of context, so an item climbing the ladder
 * could be asked five times inside a twenty-question session — close enough together that you
 * answer from short-term memory and, with only two formats in rotation, close enough that you
 * start recognising the question rather than recalling the word.
 *
 * The gap now grows with each repeat (`attemptNo` = how many times this item has been answered
 * this session): the first comeback sits ~minRepeatGap questions out, the next noticeably further,
 * and so on. Clamping to `queueLength` means that when the queue is too short to honour the gap
 * the item simply goes last — which spreads it as far as the session physically allows.
 */
export function spacedInsertionIndex(
  currentIndex: number,
  queueLength: number,
  attemptNo: number,
  tuning: LearningTuning
): number | null {
  const repeatsSoFar = Math.max(0, attemptNo - 1);
  const gap = tuning.minRepeatGap + repeatsSoFar * tuning.repeatGapGrowth;
  const jitter = tuning.repeatGapJitter > 0 ? Math.floor(Math.random() * (tuning.repeatGapJitter + 1)) : 0;
  const position = Math.min(currentIndex + gap + jitter, queueLength);

  // Near the end of a session there may be no room left to honour the gap, and appending would put
  // the item one or two questions after the one just answered — which tests short-term memory
  // rather than recall, exactly the effect this whole mechanism exists to avoid. In that case skip
  // the repeat entirely: the item keeps the stage it just earned and comes back in a later session.
  if (position - currentIndex < MIN_SEPARATION) return null;
  return position;
}

/** Closest two sightings of the same item may ever be. Below this, a "repeat" is just an echo. */
export const MIN_SEPARATION = 3;

// ---------------------------------------------------------------------------
// Bags: even spread instead of clumpy randomness
// ---------------------------------------------------------------------------

/**
 * A draw-without-replacement bag. Refills and reshuffles once empty, so over any run of N draws
 * from an N-item bag you see each option exactly once, in an unpredictable order.
 *
 * Independent random picks are what made the old rotation feel repetitive: with two options and a
 * coin flip, runs of three or four identical picks in a row are completely ordinary. A bag makes
 * those runs impossible while staying unpredictable.
 */
export function createBag<T>(items: readonly T[]): () => T {
  let deck: T[] = [];
  return () => {
    if (deck.length === 0) deck = shuffle(items.slice());
    return deck.pop() as T;
  };
}

/** Direction draws come from a bag so en→de and de→en stay balanced over a session. */
const directionBag = createBag<"en-de" | "de-en">(["en-de", "de-en"]);

export function balancedDirection(): "en-de" | "de-en" {
  return directionBag();
}

// ---------------------------------------------------------------------------
// Format memory: never the same question shape twice in a row
// ---------------------------------------------------------------------------

/** Which formats an item was most recently shown in, newest last. Keyed by prefixed item id. */
export type FormatMemory = Record<string, string[]>;

/** How many past formats per item we keep — enough to avoid the last two without over-constraining
 * a catalogue that may only have three or four entries. */
const MEMORY_DEPTH = 3;

export function rememberFormat(memory: FormatMemory, itemKey: string, format: string): FormatMemory {
  const prev = memory[itemKey] || [];
  return { ...memory, [itemKey]: [...prev, format].slice(-MEMORY_DEPTH) };
}

/**
 * Picks from `candidates`, avoiding the formats this item was most recently shown in.
 *
 * `avoidDepth` is capped so that there is always at least one candidate left to choose from: with
 * a two-entry catalogue we can only rule out the single most recent format, and ruling out
 * everything would mean falling back to a blind pick — exactly the behaviour we are replacing.
 */
export function pickAvoidingRecent<T extends string>(candidates: readonly T[], recent: readonly string[] = []): T {
  if (candidates.length === 0) throw new Error("pickAvoidingRecent needs at least one candidate");
  if (candidates.length === 1) return candidates[0];

  const avoidDepth = Math.min(recent.length, candidates.length - 1, MEMORY_DEPTH);
  const banned = new Set(recent.slice(recent.length - avoidDepth));
  const fresh = candidates.filter((c) => !banned.has(c));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------------------------------------------------------------------------
// Batch selection: which items does this session work on?
// ---------------------------------------------------------------------------

/** The progress fields both WordState and GrammarRuleState expose, and all the selection logic needs. */
export interface ProgressLike {
  score: number;
  stage: LearningStage;
  timesSeen: number;
  timesIncorrect: number;
  recentMistake: boolean;
  lastSeen: number | null;
}

/**
 * How urgently an item needs work — higher wins a place in the batch.
 *
 * The old engine picked in-progress items with a plain shuffle, which treats a word you keep
 * getting wrong exactly like one you nearly know. Weighting by actual weakness means struggling
 * items come back sooner and solid ones stop taking up slots, so the batch itself carries more
 * variety instead of the same random draw every session.
 */
export function weaknessScore(state: ProgressLike, now: number = Date.now()): number {
  // score is a 0–5 mastery estimate; invert it so low scores rank high.
  let urgency = (5 - Math.min(5, Math.max(0, state.score))) * 2;

  if (state.recentMistake) urgency += 3;

  const errorRate = state.timesSeen > 0 ? state.timesIncorrect / state.timesSeen : 0;
  urgency += errorRate * 4;

  // Staleness, capped at a week so a word untouched for months doesn't permanently outrank
  // everything else once the learner comes back from a break.
  if (state.lastSeen !== null) {
    const days = (now - state.lastSeen) / 86_400_000;
    urgency += Math.min(days, 7) * 0.4;
  } else {
    urgency += 1;
  }

  return urgency;
}

/**
 * Ranks by weakness but with deliberate noise, so the batch is weighted toward what needs work
 * without being the identical list every single session. Pure ranking would be optimal on paper
 * and monotonous in practice — the noise is what keeps sessions feeling different.
 */
export function selectByWeakness<T>(items: T[], getState: (item: T) => ProgressLike, count: number): T[] {
  if (count <= 0) return [];
  const now = Date.now();
  return items
    .map((item) => ({ item, key: weaknessScore(getState(item), now) + Math.random() * 4 }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((entry) => entry.item);
}

/**
 * Orders a queue so that consecutive entries belong to different items wherever possible.
 *
 * `shuffle` alone can put two tasks for the same word back to back, which reads as a bug even
 * when it isn't. This walks the shuffled list and, whenever the next entry repeats the previous
 * entry's item, swaps in the first later entry that doesn't.
 */
export function spreadByKey<T>(items: T[], keyOf: (item: T) => string): T[] {
  const pool = shuffle(items);
  const out: T[] = [];
  let lastKey: string | null = null;

  while (pool.length > 0) {
    let idx = pool.findIndex((entry) => keyOf(entry) !== lastKey);
    if (idx === -1) idx = 0; // Only same-key entries left — nothing to gain by searching further.
    const [picked] = pool.splice(idx, 1);
    out.push(picked);
    lastKey = keyOf(picked);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Progression: what an answer does to an item's stage
// ---------------------------------------------------------------------------

export interface StageTransition {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  /** Whether this item should be asked again later in the same session. */
  followUp: boolean;
}

function clampStage(value: number): LearningStage {
  return Math.min(4, Math.max(0, value)) as LearningStage;
}

/**
 * The shared stage ladder for both domains.
 *
 * Two deliberate departures from the previous behaviour, both aimed at the same complaint —
 * that sessions circle the same few items:
 *
 *  - **"Almost" no longer counts as a failure.** A one-letter typo used to reset a word from the
 *    brink of mastery all the way to stage 1, which then demanded the entire ladder again. It now
 *    holds the item where it is: no progress, no punishment, one more look later.
 *  - **A wrong answer demotes by one stage, not to the bottom.** Knocking a stage-3 item back to
 *    stage 1 meant re-earning three or four more sightings inside the same session, which is a
 *    large share of why sessions felt like a loop. Losing one step still hurts without
 *    manufacturing busywork.
 */
export function nextStage(params: {
  /** The learn card — the very first, purely informational encounter. */
  isLearnCard: boolean;
  /** A long-term review of an already-mastered item. */
  isReview: boolean;
  currentStage: LearningStage;
  reviewStreak: number;
  result: AnswerResultKind;
  totalPracticeSessions: number;
  tuning: LearningTuning;
}): StageTransition {
  const { isLearnCard, isReview, currentStage, reviewStreak, result, totalPracticeSessions, tuning } = params;

  if (isLearnCard) {
    return { stage: 1, reviewStreak: 0, dueAtSession: null, followUp: true };
  }

  if (isReview) {
    if (result === "correct") {
      const streak = reviewStreak + 1;
      return {
        stage: 4,
        reviewStreak: streak,
        dueAtSession: totalPracticeSessions + reviewIntervalFor(streak, tuning),
        followUp: false,
      };
    }
    if (result === "almost") {
      // Still mastered, but the spacing ladder restarts — it comes back soon rather than in a month.
      return {
        stage: 4,
        reviewStreak: 0,
        dueAtSession: totalPracticeSessions + reviewIntervalFor(0, tuning),
        followUp: false,
      };
    }
    // Genuinely forgotten. Back into active learning, but at stage 2 rather than 1: this is a word
    // that was mastered once, not a word met for the first time.
    return { stage: 2, reviewStreak: 0, dueAtSession: null, followUp: true };
  }

  // ---- Active learning ----
  if (result === "almost") {
    return { stage: currentStage, reviewStreak, dueAtSession: null, followUp: true };
  }

  if (result === "correct") {
    if (currentStage >= 3) {
      const streak = reviewStreak + 1;
      if (streak >= tuning.masteryStreak) {
        return {
          stage: 4,
          reviewStreak: 0,
          dueAtSession: totalPracticeSessions + reviewIntervalFor(0, tuning),
          followUp: false,
        };
      }
      return { stage: 3, reviewStreak: streak, dueAtSession: null, followUp: true };
    }
    return { stage: clampStage(currentStage + 1), reviewStreak: 0, dueAtSession: null, followUp: true };
  }

  // Wrong: one step back, never below stage 1, and the mastery streak is forfeited.
  return { stage: clampStage(Math.max(1, currentStage - 1)), reviewStreak: 0, dueAtSession: null, followUp: true };
}
