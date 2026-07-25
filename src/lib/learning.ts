import { activeVocab, CONFUSABLE_PAIRS, type Word } from "./vocab";
import { choice, sample, shuffle } from "./utils";
import type { AnswerResultKind, LearningStage, WordState } from "./types";
import { pickDirection, type QueueItem } from "./sessionLogic";

export type StageKind = "learn" | "quiz" | "match" | "apply" | "produce" | "review";

/** Every exercise format a mastered word can resurface as during long-term review — deliberately
 * wider than the single fixed "translate" format used before, so words you've known for months
 * don't always show the exact same question. All self-generate their content from the word's own
 * fields (no per-word authored variants needed), unlike the grammar rules' review formats. Left
 * out of the quiz/apply gate that drives mastery itself, so that progression stays untouched. */
export type ReviewFormat = "translate" | "build" | "mc" | "gap" | "multigap" | "confusable";
const SINGLE_WORD_REVIEW_FORMATS: ReviewFormat[] = ["translate", "build", "mc", "gap"];
export function pickReviewFormat(): ReviewFormat {
  return choice(SINGLE_WORD_REVIEW_FORMATS);
}

export interface LearningQueueItem {
  kind: StageKind;
  words: Word[];
  direction: "en-de" | "de-en";
  /** Only set when kind === "review" — which format to render this time (see ReviewFormat). */
  reviewFormat?: ReviewFormat;
}

const KIND_TO_FORMAT: Record<StageKind, QueueItem["format"]> = {
  learn: "learn",
  quiz: "mc",
  match: "match",
  apply: "gap",
  produce: "sentence",
  review: "translate",
};

export function toQueueItem(item: LearningQueueItem): QueueItem {
  const multiWord = item.kind === "match" || item.reviewFormat === "multigap" || item.reviewFormat === "confusable";
  const words = multiWord ? item.words : [item.words[0]];
  const format: QueueItem["format"] = item.kind === "review" ? item.reviewFormat || "translate" : KIND_TO_FORMAT[item.kind];
  return { format, words, direction: item.direction };
}

/** Sessions until a word resurfaces, indexed by consecutive successful long-term reviews. */
const REVIEW_INTERVALS = [2, 3, 5, 8, 13, 21];

export function reviewInterval(streak: number): number {
  return REVIEW_INTERVALS[Math.min(Math.max(streak, 0), REVIEW_INTERVALS.length - 1)];
}

const ACTIVE_KINDS: Exclude<StageKind, "learn" | "review" | "match" | "produce">[] = ["quiz", "apply"];

/**
 * Which task type to test a word with. Stage 0 (the very first encounter) is always "learn" —
 * everything past that picks a random format each time instead of one fixed type being tied to
 * a given stage, so a word doesn't always get quizzed the same way as it climbs toward mastery.
 * Progression itself still tracks the word's real persisted stage (see nextAfterAnswer) — only
 * which format is shown is randomized.
 */
export function pickKindForStage(stage: LearningStage): Exclude<StageKind, "match" | "review"> {
  if (stage === 0) return "learn";
  return choice(ACTIVE_KINDS);
}

/**
 * How many *consecutive* correct active-learning answers a word needs at the final pre-mastery
 * stage before it's trusted as mastered. A single lucky/careless correct answer no longer
 * promotes a word to mastery on its own — it has to hold up across several (spaced apart within
 * the session, not back-to-back, via insertionIndex).
 */
export const APPLY_REQUIRED_STREAK = 3;

/**
 * Typed production (Schreiben, and review's "translate" format) always shows German and asks for
 * English — you never have to type German, only recognize it. Recognition tasks (MC) have no
 * typing, so they keep testing both directions for well-rounded comprehension — including when MC
 * shows up as a review format, so it doesn't lose the word2trans/gapsentence variety it has at the
 * normal quiz stage. Build/gap/multigap/confusable ignore direction entirely, so it's irrelevant
 * for those review formats.
 */
export function directionForKind(kind: StageKind, reviewFormat?: ReviewFormat): "en-de" | "de-en" {
  if (kind === "produce") return "de-en";
  if (kind === "review") return reviewFormat && reviewFormat !== "translate" ? pickDirection("mixed") : "de-en";
  return pickDirection("mixed");
}

const ACTIVE_BATCH_SIZE = 10;
const REVIEW_SAMPLE_SIZE = 4;
export const MATCH_GROUP_SIZE = 4;
export const LEARNING_BATCH_SIZE = ACTIVE_BATCH_SIZE;

/** Pulls as many full groups of MATCH_GROUP_SIZE off the front of the pool as possible. */
export function popMatchGroups(pool: Word[]): { groups: Word[][]; remaining: Word[] } {
  const remaining = [...pool];
  const groups: Word[][] = [];
  while (remaining.length >= MATCH_GROUP_SIZE) {
    groups.push(remaining.splice(0, MATCH_GROUP_SIZE));
  }
  return { groups, remaining };
}

export interface LearningBatch {
  activeWords: Word[];
  reviewWords: Word[];
}

/**
 * Picks the ~10 words this session works on (in-progress words first, then new ones) plus a
 * few due long-term reviews — the "ab und zu abgefragt" confirmation for stage-4 words. Reviews
 * are picked most-overdue-first (not randomly): with a growing pool of known words, a fixed
 * sample size per session means the backlog only clears if the words waiting longest go first,
 * otherwise some could get skipped indefinitely in favor of always-fresher due words.
 */
export function buildLearningBatch(
  getState: (id: string) => WordState,
  totalPracticeSessions: number,
  blockedWordIds: ReadonlySet<string> = new Set(),
  includeReview: boolean = true
): LearningBatch {
  const pool = activeVocab(blockedWordIds);

  if (!includeReview) {
    // "Nur Neues lernen" means exactly that — brand-new words only. Mixing in-progress words back
    // in here would defeat the point: with even a handful of in-progress words already in flight,
    // they'd crowd out new ones every time (in-progress is filled first, up to ACTIVE_BATCH_SIZE),
    // so picking "only new" would barely change what you see session to session.
    const newPool = pool.filter((w) => getState(w.id).stage === 0);
    return { activeWords: sample(newPool, ACTIVE_BATCH_SIZE), reviewWords: [] };
  }

  const duePool = pool.filter((w) => {
    const s = getState(w.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  duePool.sort((a, b) => (getState(a.id).dueAtSession ?? 0) - (getState(b.id).dueAtSession ?? 0));
  const reviewWords = duePool.slice(0, REVIEW_SAMPLE_SIZE);

  const inProgressPool = shuffle(
    pool.filter((w) => {
      const s = getState(w.id);
      return s.stage >= 1 && s.stage <= 3;
    })
  );
  const inProgressWords = inProgressPool.slice(0, ACTIVE_BATCH_SIZE);

  const remaining = ACTIVE_BATCH_SIZE - inProgressWords.length;
  const newPool = pool.filter((w) => getState(w.id).stage === 0);
  const newWords = remaining > 0 ? sample(newPool, remaining) : [];

  return { activeWords: inProgressWords.concat(newWords), reviewWords };
}

export interface InitialQueue {
  queue: LearningQueueItem[];
  /** Words already due for their first "quiz" test that didn't (yet) fill a full match group — carried in session state and merged with words that reach this point mid-session. */
  matchPool: Word[];
}

/**
 * Builds the shuffled starting queue for a batch. Words due for their first "quiz" test are
 * grouped into Word Matching rounds (recognition practice, lower cognitive load) whenever
 * there are enough of them at once — any that don't fill a group go into `matchPool` instead
 * of the queue, to be combined with words that reach the same point later in the session.
 * Everything else gets one task per word at its current stage; due long-term reviews are mixed
 * in too, all interleaved together.
 */
export function buildInitialQueue(batch: LearningBatch, getState: (id: string) => WordState): InitialQueue {
  const quizWords: Word[] = [];
  const items: LearningQueueItem[] = [];

  batch.activeWords.forEach((word) => {
    const kind = pickKindForStage(getState(word.id).stage);
    if (kind === "quiz") quizWords.push(word);
    else items.push({ kind, words: [word], direction: directionForKind(kind) });
  });

  const { groups, remaining } = popMatchGroups(shuffle(quizWords));
  groups.forEach((group) => items.push({ kind: "match", words: group, direction: directionForKind("match") }));

  // Review-due words get varied formats instead of always "translate": at most one confusable
  // pair per session (only when BOTH pair members are already mastered, so whichever one gets
  // quizzed has a valid stage to transition from), the rest occasionally grouped into multigap
  // pairs, and otherwise a random single-word format — see pickReviewFormat().
  const reviewPool = shuffle(batch.reviewWords.slice());
  const usedIds = new Set<string>();
  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (usedIds.has(a.id) || usedIds.has(b.id)) continue;
    const aIsDue = reviewPool.some((w) => w.id === a.id);
    const bIsDue = reviewPool.some((w) => w.id === b.id);
    if (!aIsDue && !bIsDue) continue;
    if (getState(a.id).stage !== 4 || getState(b.id).stage !== 4) continue;
    items.push({ kind: "review", words: [a, b], direction: directionForKind("review", "confusable"), reviewFormat: "confusable" });
    usedIds.add(a.id);
    usedIds.add(b.id);
    break;
  }

  const remainingReview = reviewPool.filter((w) => !usedIds.has(w.id));
  while (remainingReview.length >= 2 && Math.random() < 0.35) {
    const pairWords = [remainingReview.shift()!, remainingReview.shift()!];
    items.push({ kind: "review", words: pairWords, direction: directionForKind("review", "multigap"), reviewFormat: "multigap" });
  }
  remainingReview.forEach((word) => {
    const fmt = pickReviewFormat();
    items.push({ kind: "review", words: [word], direction: directionForKind("review", fmt), reviewFormat: fmt });
  });

  return { queue: shuffle(items), matchPool: remaining };
}

export interface StageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: StageKind | null;
}

/**
 * Computes a word's next learning stage after an answer, and which task (if any) should follow
 * up later in the same session. `currentStage` is the word's actual persisted stage — since the
 * task format shown (`kind`) is now picked randomly rather than implied by the stage (see
 * pickKindForStage), progression has to read the real stage instead of inferring it from which
 * format happened to be tested this time.
 */
export function nextAfterAnswer(
  kind: StageKind,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number
): StageOutcome {
  if (kind === "learn") {
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickKindForStage(1) };
  }
  if (kind === "review") {
    if (result === "correct") {
      const rs = reviewStreak + 1;
      return { stage: 4, reviewStreak: rs, dueAtSession: totalPracticeSessions + reviewInterval(rs), nextKind: null };
    }
    // Forgetting a mastered word sends it all the way back to the bottom of active learning, not
    // partway back in — re-earning mastery means climbing the whole ladder again, not one quick
    // reconfirmation.
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickKindForStage(1) };
  }

  // Active learning — quiz/match/apply (and any stray legacy "produce" item left in-flight from
  // before that stage was removed). The format shown no longer implies the stage, so promotion
  // and demotion both key off the word's real persisted stage.
  if (result === "correct") {
    if (currentStage >= 3) {
      // Final step before mastery: needs APPLY_REQUIRED_STREAK consecutive correct answers,
      // reusing the reviewStreak field as that counter. A single correct answer here no longer
      // promotes to mastery on its own.
      const streak = reviewStreak + 1;
      if (streak >= APPLY_REQUIRED_STREAK) {
        return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + reviewInterval(0), nextKind: null };
      }
      return { stage: 3, reviewStreak: streak, dueAtSession: null, nextKind: pickKindForStage(3) };
    }
    const newStage = (currentStage + 1) as LearningStage;
    return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: pickKindForStage(newStage) };
  }

  // Any wrong active-learning answer knocks the word straight back to stage 1 — no partial
  // credit for progress already made, regardless of which stage it fell at.
  return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickKindForStage(1) };
}

/** Where in the (growing) queue a follow-up task should be inserted — a few items ahead, never right next, so repeats are spaced out. */
export function insertionIndex(currentIndex: number, queueLength: number): number {
  const offset = 2 + Math.floor(Math.random() * 3); // 2..4
  return Math.min(currentIndex + offset, queueLength);
}

/** End-of-session (or empty-queue) cleanup: turns whatever's left in the match pool into one last task instead of leaving it untested. */
export function flushMatchPool(pool: Word[]): LearningQueueItem[] {
  if (pool.length === 0) return [];
  if (pool.length === 1) return [{ kind: "quiz", words: [pool[0]], direction: directionForKind("quiz") }];
  return [{ kind: "match", words: pool, direction: directionForKind("match") }];
}

export const MAX_ATTEMPTS_PER_WORD = 5;

export function stageKindLabel(kind: StageKind): string {
  switch (kind) {
    case "learn":
      return "Kennenlernen";
    case "quiz":
      return "Abfragen";
    case "match":
      return "Wörter verbinden";
    case "apply":
      return "Einbauen";
    case "produce":
      return "Schreiben";
    case "review":
      return "Wiederholung";
  }
}
