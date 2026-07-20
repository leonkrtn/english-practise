import { GRAMMAR_RULES, type GrammarRule } from "./grammar-data";
import { sample, shuffle } from "./utils";
import type { AnswerResultKind, LearningStage } from "./types";
import type { GrammarRuleState } from "./grammarTypes";

export type GrammarStageKind = "learn" | "quiz" | "apply" | "produce" | "review";

export interface GrammarQueueItem {
  kind: GrammarStageKind;
  rule: GrammarRule;
}

/** Maps each stage to the exercise format that tests it, mirroring the vocab engine's one-format-per-stage design. */
const KIND_TO_FORMAT: Record<GrammarStageKind, string> = {
  learn: "g-learn",
  quiz: "g-mc",
  apply: "g-gap",
  produce: "g-build",
  review: "g-error",
};

export function grammarFormatFor(kind: GrammarStageKind): string {
  return KIND_TO_FORMAT[kind];
}

export function grammarKindForStage(stage: LearningStage): Exclude<GrammarStageKind, "review"> {
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

const REVIEW_INTERVALS = [2, 3, 5, 8, 13, 21];
export function grammarReviewInterval(streak: number): number {
  return REVIEW_INTERVALS[Math.min(Math.max(streak, 0), REVIEW_INTERVALS.length - 1)];
}

const GRAMMAR_BATCH_SIZE = 5;
const GRAMMAR_REVIEW_SAMPLE = 2;
export const GRAMMAR_MAX_ATTEMPTS = 5;

export interface GrammarBatch {
  activeRules: GrammarRule[];
  reviewRules: GrammarRule[];
}

/** Every rule minus any the user has permanently blocked ("I don't care about adjective order"). */
export function activeGrammarRules(blockedRuleIds: ReadonlySet<string> = new Set()): GrammarRule[] {
  return blockedRuleIds.size === 0 ? GRAMMAR_RULES : GRAMMAR_RULES.filter((r) => !blockedRuleIds.has(r.id));
}

/** Picks the ~5 rules this session works on (in-progress first, then new) plus a couple of due long-term reviews, most-overdue-first. Blocked rules are excluded entirely. */
export function buildGrammarBatch(
  getState: (id: string) => GrammarRuleState,
  totalPracticeSessions: number,
  blockedRuleIds: ReadonlySet<string> = new Set()
): GrammarBatch {
  const pool = activeGrammarRules(blockedRuleIds);
  const duePool = pool.filter((r) => {
    const s = getState(r.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  duePool.sort((a, b) => (getState(a.id).dueAtSession ?? 0) - (getState(b.id).dueAtSession ?? 0));
  const reviewRules = duePool.slice(0, GRAMMAR_REVIEW_SAMPLE);

  const inProgressPool = shuffle(
    pool.filter((r) => {
      const s = getState(r.id);
      return s.stage >= 1 && s.stage <= 3;
    })
  );
  const inProgressRules = inProgressPool.slice(0, GRAMMAR_BATCH_SIZE);

  const remaining = GRAMMAR_BATCH_SIZE - inProgressRules.length;
  const newPool = pool.filter((r) => getState(r.id).stage === 0);
  const newRules = remaining > 0 ? sample(newPool, remaining) : [];

  return { activeRules: inProgressRules.concat(newRules), reviewRules };
}

export function buildGrammarQueue(batch: GrammarBatch, getState: (id: string) => GrammarRuleState): GrammarQueueItem[] {
  const items: GrammarQueueItem[] = batch.activeRules.map((rule) => ({ kind: grammarKindForStage(getState(rule.id).stage), rule }));
  batch.reviewRules.forEach((rule) => items.push({ kind: "review", rule }));
  return shuffle(items);
}

export interface GrammarStageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: GrammarStageKind | null;
}

export function grammarNextAfterAnswer(
  kind: GrammarStageKind,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number
): GrammarStageOutcome {
  if (kind === "learn") {
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: "quiz" };
  }
  if (kind === "review") {
    if (result === "correct") {
      const rs = reviewStreak + 1;
      return { stage: 4, reviewStreak: rs, dueAtSession: totalPracticeSessions + grammarReviewInterval(rs), nextKind: null };
    }
    return { stage: 3, reviewStreak: 0, dueAtSession: null, nextKind: "produce" };
  }

  const taskStage: Record<"quiz" | "apply" | "produce", LearningStage> = { quiz: 1, apply: 2, produce: 3 };
  const current = taskStage[kind];

  if (result === "correct") {
    const newStage = (current + 1) as LearningStage;
    if (newStage >= 4) {
      return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + grammarReviewInterval(0), nextKind: null };
    }
    return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: grammarKindForStage(newStage) };
  }

  const newStage = Math.max(1, current - 1) as LearningStage;
  return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: grammarKindForStage(newStage) };
}

/** Where in the (growing) queue a follow-up task should be inserted — same spacing rule as the vocab engine. */
export function grammarInsertionIndex(currentIndex: number, queueLength: number): number {
  const offset = 2 + Math.floor(Math.random() * 3);
  return Math.min(currentIndex + offset, queueLength);
}

export function grammarStageKindLabel(kind: GrammarStageKind): string {
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
