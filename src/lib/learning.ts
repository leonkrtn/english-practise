import { VOCAB, type Word } from "./vocab";
import { sample, shuffle } from "./utils";
import type { AnswerResultKind, Direction, LearningStage, WordState } from "./types";
import { pickDirection, type QueueItem } from "./sessionLogic";

export type StageKind = "learn" | "quiz" | "apply" | "produce" | "review";

export interface LearningQueueItem {
  kind: StageKind;
  word: Word;
  direction: "en-de" | "de-en";
}

const KIND_TO_FORMAT: Record<StageKind, QueueItem["format"]> = {
  learn: "learn",
  quiz: "mc",
  apply: "gap",
  produce: "sentence",
  review: "translate",
};

export function toQueueItem(item: LearningQueueItem): QueueItem {
  return { format: KIND_TO_FORMAT[item.kind], words: [item.word], direction: item.direction };
}

/** Sessions until a word resurfaces, indexed by consecutive successful long-term reviews. */
const REVIEW_INTERVALS = [2, 3, 5, 8, 13, 21];

export function reviewInterval(streak: number): number {
  return REVIEW_INTERVALS[Math.min(Math.max(streak, 0), REVIEW_INTERVALS.length - 1)];
}

export function kindForStage(stage: LearningStage): StageKind {
  switch (stage) {
    case 0:
      return "learn";
    case 1:
      return "quiz";
    case 2:
      return "apply";
    default:
      return "produce";
  }
}

const ACTIVE_BATCH_SIZE = 10;
const REVIEW_SAMPLE_SIZE = 3;
export const LEARNING_BATCH_SIZE = ACTIVE_BATCH_SIZE;

export interface LearningBatch {
  activeWords: Word[];
  reviewWords: Word[];
}

/** Picks the ~10 words this session works on (in-progress words first, then new ones) plus a few due long-term reviews. */
export function buildLearningBatch(getState: (id: string) => WordState, totalPracticeSessions: number): LearningBatch {
  const duePool = VOCAB.filter((w) => {
    const s = getState(w.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  const reviewWords = sample(duePool, Math.min(REVIEW_SAMPLE_SIZE, duePool.length));

  const inProgressPool = shuffle(
    VOCAB.filter((w) => {
      const s = getState(w.id);
      return s.stage >= 1 && s.stage <= 3;
    })
  );
  const inProgressWords = inProgressPool.slice(0, ACTIVE_BATCH_SIZE);

  const remaining = ACTIVE_BATCH_SIZE - inProgressWords.length;
  const newPool = VOCAB.filter((w) => getState(w.id).stage === 0);
  const newWords = remaining > 0 ? sample(newPool, remaining) : [];

  return { activeWords: inProgressWords.concat(newWords), reviewWords };
}

/** Builds the shuffled starting queue for a batch: one task per active word at its current stage, plus due reviews, interleaved. */
export function buildInitialQueue(
  batch: LearningBatch,
  getState: (id: string) => WordState,
  direction: Direction
): LearningQueueItem[] {
  const active: LearningQueueItem[] = batch.activeWords.map((word) => ({
    kind: kindForStage(getState(word.id).stage),
    word,
    direction: pickDirection(direction),
  }));
  const review: LearningQueueItem[] = batch.reviewWords.map((word) => ({
    kind: "review",
    word,
    direction: pickDirection(direction),
  }));
  return shuffle(active.concat(review));
}

export interface StageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: StageKind | null;
}

/** Computes the word's next learning stage after an answer, and which task (if any) should follow up later in the same session. */
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
    return { stage: 3, reviewStreak: 0, dueAtSession: null, nextKind: "produce" };
  }

  const taskStage: Record<Exclude<StageKind, "learn" | "review">, LearningStage> = { quiz: 1, apply: 2, produce: 3 };
  const current = taskStage[kind];

  if (result === "correct") {
    const newStage = (current + 1) as LearningStage;
    if (newStage >= 4) {
      return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + reviewInterval(0), nextKind: null };
    }
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

export const MAX_ATTEMPTS_PER_WORD = 5;

export function stageKindLabel(kind: StageKind): string {
  switch (kind) {
    case "learn":
      return "Kennenlernen";
    case "quiz":
      return "Abfragen";
    case "apply":
      return "Einbauen";
    case "produce":
      return "Schreiben";
    case "review":
      return "Wiederholung";
  }
}
