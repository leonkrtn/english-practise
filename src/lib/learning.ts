import { activeVocab, type Word } from "./vocab";
import { sample, shuffle } from "./utils";
import type { AnswerResultKind, LearningStage, WordState } from "./types";
import { pickDirection, type QueueItem } from "./sessionLogic";

export type StageKind = "learn" | "quiz" | "match" | "apply" | "produce" | "review";

export interface LearningQueueItem {
  kind: StageKind;
  words: Word[];
  direction: "en-de" | "de-en";
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
  const words = item.kind === "match" ? item.words : [item.words[0]];
  return { format: KIND_TO_FORMAT[item.kind], words, direction: item.direction };
}

/** Sessions until a word resurfaces, indexed by consecutive successful long-term reviews. */
const REVIEW_INTERVALS = [2, 3, 5, 8, 13, 21];

export function reviewInterval(streak: number): number {
  return REVIEW_INTERVALS[Math.min(Math.max(streak, 0), REVIEW_INTERVALS.length - 1)];
}

export function kindForStage(stage: LearningStage): Exclude<StageKind, "match" | "review" | "produce"> {
  switch (stage) {
    case 0:
      return "learn";
    case 1:
      return "quiz";
    default:
      // "apply" is now the final active-learning gate before mastery — a correct answer here
      // promotes straight to stage 4. Also the graceful landing spot for any word a previous
      // version of the app already left sitting at stage 3 (the old "produce"/write-a-full-
      // sentence stage, since removed as a vocabulary task).
      return "apply";
  }
}

/**
 * Typed production (Schreiben / long-term review) always shows German and asks for English —
 * you never have to type German, only recognize it. Recognition tasks (MC) have no typing, so
 * they keep testing both directions for well-rounded comprehension.
 */
export function directionForKind(kind: StageKind): "en-de" | "de-en" {
  if (kind === "produce" || kind === "review") return "de-en";
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
    const kind = kindForStage(getState(word.id).stage);
    if (kind === "quiz") quizWords.push(word);
    else items.push({ kind, words: [word], direction: directionForKind(kind) });
  });

  const { groups, remaining } = popMatchGroups(shuffle(quizWords));
  groups.forEach((group) => items.push({ kind: "match", words: group, direction: directionForKind("match") }));

  batch.reviewWords.forEach((word) => items.push({ kind: "review", words: [word], direction: directionForKind("review") }));

  return { queue: shuffle(items), matchPool: remaining };
}

export interface StageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: StageKind | null;
}

/** Computes a word's next learning stage after an answer, and which task (if any) should follow up later in the same session. */
export function nextAfterAnswer(
  kind: StageKind,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number
): StageOutcome {
  if (kind === "learn") {
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: "quiz" };
  }
  if (kind === "review") {
    if (result === "correct") {
      const rs = reviewStreak + 1;
      return { stage: 4, reviewStreak: rs, dueAtSession: totalPracticeSessions + reviewInterval(rs), nextKind: null };
    }
    // A failed long-term review demotes back to the "apply" gate rather than the old
    // "produce"/write-a-full-sentence stage, since that's no longer part of the vocab pipeline.
    return { stage: 2, reviewStreak: 0, dueAtSession: null, nextKind: "apply" };
  }

  if (kind === "apply") {
    // "apply" is the final active-learning gate — correct promotes straight to mastery instead of
    // routing through a separate "produce" (write-a-full-sentence) stage, which isn't a vocabulary
    // task anymore. Failure demotes back to "quiz", same severity as before this stage was removed.
    if (result === "correct") {
      return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + reviewInterval(0), nextKind: null };
    }
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: "quiz" };
  }

  if (kind === "produce") {
    // No longer produced by kindForStage — kept only so a stray in-flight queue item from before
    // this stage was removed (a session already open in a browser tab during deploy) still
    // resolves to something instead of crashing.
    if (result === "correct") {
      return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + reviewInterval(0), nextKind: null };
    }
    return { stage: 2, reviewStreak: 0, dueAtSession: null, nextKind: "apply" };
  }

  // "match" is a group-testing variant of "quiz" — same stage-transition rules apply.
  const taskStage: Record<"quiz" | "match", LearningStage> = { quiz: 1, match: 1 };
  const current = taskStage[kind];

  if (result === "correct") {
    const newStage = (current + 1) as LearningStage;
    return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: kindForStage(newStage) };
  }

  const newStage = Math.max(1, current - 1) as LearningStage;
  return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: kindForStage(newStage) };
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
