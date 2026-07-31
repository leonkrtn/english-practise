import { GRAMMAR_RULES, type GrammarRule } from "./grammar-data";
import type { AnswerResultKind, LearningStage } from "./types";
import type { GrammarRuleState } from "./grammarTypes";
import type { LearningTuning } from "./learningProfile";
import {
  nextStage,
  pickAvoidingRecent,
  rememberFormat,
  selectByWeakness,
  spacedInsertionIndex,
  spreadByKey,
  type FormatMemory,
} from "./learningEngine";

/** Prefix used for this domain in the shared attempt/format bookkeeping — see vocabKey(). */
export const grammarKey = (ruleId: string) => "g:" + ruleId;

export type GrammarStageKind =
  | "learn"
  | "quiz"
  | "apply"
  | "produce"
  | "situation"
  | "conjugate"
  | "error"
  | "translate"
  | "transform"
  | "review";

/** The active-learning task types — everything that can move a rule up the ladder. */
export type GrammarActiveKind = Exclude<GrammarStageKind, "learn" | "review">;

/**
 * Which task types a rule can be tested with at each stage.
 *
 * The grammar data has always carried eight different exercise variants per rule, but active
 * learning only ever used three of them (multiple choice, gap-fill, sentence building) — the other
 * five were reserved for long-term review. That is a large part of why practising a rule felt like
 * answering the same question repeatedly: three formats spread across three stages guarantees
 * repeats, especially once a rule needs several attempts.
 *
 * All eight are now in rotation, ordered into the same recognition → retrieval → production ladder
 * the vocabulary engine uses, so each stage means something and offers three formats to vary
 * between. Every rule in grammar-data.ts carries a non-empty list for each variant, so any of
 * these is safe for any rule.
 */
const KINDS_BY_STAGE: Record<1 | 2 | 3 | 4, GrammarActiveKind[]> = {
  1: ["quiz", "situation", "conjugate"],
  2: ["apply", "error", "conjugate"],
  3: ["produce", "translate", "transform"],
  4: ["produce", "translate", "transform"],
};

/** Every exercise format a mastered rule can resurface as during long-term review. */
export type GrammarReviewFormat =
  | "g-error"
  | "g-mc"
  | "g-gap"
  | "g-build"
  | "g-conjugate"
  | "g-translate"
  | "g-transform"
  | "g-situation";

const REVIEW_FORMATS: GrammarReviewFormat[] = [
  "g-error",
  "g-mc",
  "g-gap",
  "g-build",
  "g-conjugate",
  "g-translate",
  "g-transform",
  "g-situation",
];

/** Picks a review format, avoiding the ones this rule most recently appeared as. */
export function pickReviewFormat(recent: string[] = []): GrammarReviewFormat {
  return pickAvoidingRecent(REVIEW_FORMATS, recent);
}

export interface GrammarQueueItem {
  kind: GrammarStageKind;
  rule: GrammarRule;
  /** Only set when kind === "review" — which of the REVIEW_FORMATS to render this time. */
  reviewFormat?: GrammarReviewFormat;
}

/** Maps each task type to the exercise format that tests it — also the id recorded in format stats. */
const KIND_TO_FORMAT: Record<GrammarStageKind, string> = {
  learn: "g-learn",
  quiz: "g-mc",
  apply: "g-gap",
  produce: "g-build",
  situation: "g-situation",
  conjugate: "g-conjugate",
  error: "g-error",
  translate: "g-translate",
  transform: "g-transform",
  review: "g-error",
};

/** The format a queue item actually renders as — what the format memory compares against. */
export function formatForGrammarItem(item: GrammarQueueItem): string {
  return item.kind === "review" ? item.reviewFormat || "g-error" : KIND_TO_FORMAT[item.kind];
}

/**
 * Which task type to test a rule with next. Stage 0 is always the learn card; above that the
 * stage's format list is drawn from while avoiding whatever this rule was recently shown as.
 */
export function pickGrammarKindForStage(stage: LearningStage, recent: string[] = []): Exclude<GrammarStageKind, "review"> {
  if (stage === 0) return "learn";
  const candidates = KINDS_BY_STAGE[stage as 1 | 2 | 3 | 4] ?? KINDS_BY_STAGE[3];
  const recentKinds = recent
    .map((fmt) => candidates.find((k) => KIND_TO_FORMAT[k] === fmt))
    .filter((k): k is GrammarActiveKind => k !== undefined);
  return pickAvoidingRecent(candidates, recentKinds);
}

/** Every rule minus any the learner has permanently blocked ("I don't care about adjective order"). */
export function activeGrammarRules(blockedRuleIds: ReadonlySet<string> = new Set()): GrammarRule[] {
  return blockedRuleIds.size === 0 ? GRAMMAR_RULES : GRAMMAR_RULES.filter((r) => !blockedRuleIds.has(r.id));
}

export interface GrammarBatch {
  activeRules: GrammarRule[];
  reviewRules: GrammarRule[];
}

/**
 * Picks the rules this session works on plus the long-term reviews that have come due. Mirrors
 * buildLearningBatch(): in-progress rules are chosen by how much they actually need work rather
 * than at random, new rules are capped so a session isn't all unfamiliar material, and reviews are
 * taken most-overdue-first so the backlog clears.
 */
export function buildGrammarBatch(
  getState: (id: string) => GrammarRuleState,
  totalPracticeSessions: number,
  blockedRuleIds: ReadonlySet<string>,
  includeReview: boolean,
  tuning: LearningTuning
): GrammarBatch {
  const pool = activeGrammarRules(blockedRuleIds);
  const newPool = pool.filter((r) => getState(r.id).stage === 0);

  if (!includeReview) {
    return { activeRules: selectByWeakness(newPool, (r) => getState(r.id), tuning.grammarBatchSize), reviewRules: [] };
  }

  const duePool = pool.filter((r) => {
    const s = getState(r.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  duePool.sort((a, b) => (getState(a.id).dueAtSession ?? 0) - (getState(b.id).dueAtSession ?? 0));
  const reviewRules = duePool.slice(0, tuning.grammarReviewSample);

  const inProgressPool = pool.filter((r) => {
    const s = getState(r.id);
    return s.stage >= 1 && s.stage <= 3;
  });
  const inProgressRules = selectByWeakness(inProgressPool, (r) => getState(r.id), tuning.grammarBatchSize);

  const room = tuning.grammarBatchSize - inProgressRules.length;
  const newRules = room > 0 ? selectByWeakness(newPool, (r) => getState(r.id), Math.min(room, tuning.maxNewGrammarPerSession)) : [];

  return { activeRules: inProgressRules.concat(newRules), reviewRules };
}

export interface GrammarInitialQueue {
  queue: GrammarQueueItem[];
  /** Seeded with the format each rule starts on, so the first follow-up already avoids a repeat. */
  formatMemory: FormatMemory;
}

export function buildGrammarQueue(
  batch: GrammarBatch,
  getState: (id: string) => GrammarRuleState
): GrammarInitialQueue {
  let formatMemory: FormatMemory = {};
  const items: GrammarQueueItem[] = [];

  const remember = (item: GrammarQueueItem) => {
    formatMemory = rememberFormat(formatMemory, grammarKey(item.rule.id), formatForGrammarItem(item));
    return item;
  };

  batch.activeRules.forEach((rule) => {
    items.push(remember({ kind: pickGrammarKindForStage(getState(rule.id).stage), rule }));
  });
  batch.reviewRules.forEach((rule) => {
    items.push(remember({ kind: "review", rule, reviewFormat: pickReviewFormat() }));
  });

  return { queue: spreadByKey(items, (item) => item.rule.id), formatMemory };
}

export interface GrammarStageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: GrammarStageKind | null;
}

/**
 * Computes a rule's next learning stage after an answer, and which task (if any) should follow up
 * later in the same session. The ladder itself is the shared one — see nextStage().
 */
export function grammarNextAfterAnswer(
  kind: GrammarStageKind,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number,
  recentFormats: string[],
  tuning: LearningTuning
): GrammarStageOutcome {
  const transition = nextStage({
    isLearnCard: kind === "learn",
    isReview: kind === "review",
    currentStage,
    reviewStreak,
    result,
    totalPracticeSessions,
    tuning,
  });

  return {
    stage: transition.stage,
    reviewStreak: transition.reviewStreak,
    dueAtSession: transition.dueAtSession,
    nextKind: transition.followUp ? pickGrammarKindForStage(transition.stage, recentFormats) : null,
  };
}

/** Where a follow-up task should be inserted — expanding gaps, same rule as the vocab engine.
 * Returns null when the remaining queue is too short to space the repeat properly. */
export function grammarInsertionIndex(
  currentIndex: number,
  queueLength: number,
  attemptNo: number,
  tuning: LearningTuning
): number | null {
  return spacedInsertionIndex(currentIndex, queueLength, attemptNo, tuning);
}

/** How many times one rule may be asked within a single session, per the active profile. */
export function maxAttemptsPerRule(tuning: LearningTuning): number {
  return tuning.maxAttemptsPerItem;
}

