import { MATH_RULES, MATH_RULES_BY_ID, type MathRule, type MathTopic } from "./math";
import type { AnswerResultKind, LearningStage, WordState } from "./types";
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

/** Prefix used for this domain in the shared attempt/format bookkeeping — mirrors vocabKey()/grammarKey(). */
export const mathKey = (ruleId: string) => "m:" + ruleId;

export type MathTaskKind = "learn" | "mc" | "solve" | "simplify" | "steps" | "error" | "word" | "review";

/** The task types that can move a rule up the ladder — everything except the learn card and review. */
export type MathActiveKind = Exclude<MathTaskKind, "learn" | "review">;

/**
 * Which task types a rule may be tested with at each stage, ordered along the same
 * recognition → retrieval → production ladder the vocabulary and grammar engines use.
 *
 * Stage 1 is recognition (pick the right result), stages 2–3 are retrieval (produce it yourself,
 * or spot where a worked solution goes wrong), and stages 3–4 are application (guided multi-step
 * work and word problems). A rule that has no content authored for a given kind simply falls back
 * to whatever it does have — see availableKinds().
 */
const KINDS_BY_STAGE: Record<1 | 2 | 3 | 4, MathActiveKind[]> = {
  1: ["mc", "solve"],
  2: ["solve", "simplify", "error"],
  3: ["steps", "word", "solve"],
  4: ["word", "steps", "solve"],
};

/** Every kind a mastered rule can resurface as during long-term review. */
const REVIEW_KINDS: MathActiveKind[] = ["solve", "mc", "simplify", "steps", "error", "word"];

/** The exercise arrays on a rule, keyed by the task kind that renders them. */
function poolFor(rule: MathRule, kind: MathActiveKind): unknown[] {
  switch (kind) {
    case "mc":
      return rule.mc;
    case "solve":
      return rule.solve;
    case "simplify":
      return rule.simplify;
    case "steps":
      return rule.steps;
    case "error":
      return rule.error;
    case "word":
      return rule.word;
  }
}

/** The kinds that ask the learner to type an algebraic answer, as opposed to picking or tapping. */
const TYPED_KINDS: MathActiveKind[] = ["solve", "simplify", "steps", "word"];

/**
 * Which kinds this rule actually has content for.
 *
 * `allowTyped` is the Settings toggle: with it off, only the recognition formats (multiple choice,
 * find-the-error) are offered, for working through the material without typing expressions. If a
 * rule has no recognition content authored at all, its typed exercises are used anyway — an empty
 * list would mean the rule could never be practised.
 */
export function availableKinds(rule: MathRule, allowTyped = true): MathActiveKind[] {
  const all = REVIEW_KINDS.filter((k) => poolFor(rule, k).length > 0);
  if (allowTyped) return all;
  const recognitionOnly = all.filter((k) => !TYPED_KINDS.includes(k));
  return recognitionOnly.length > 0 ? recognitionOnly : all;
}

export interface MathQueueItem {
  kind: MathTaskKind;
  ruleId: string;
  /** Index into the rule's array for this kind. Unused for "learn". */
  problemIndex: number;
  /** Only set when kind === "review" — which kind to actually render this time. */
  reviewKind?: MathActiveKind;
}

/** The format id recorded in format stats, and what the format memory compares against. */
export function formatForMathItem(item: MathQueueItem): string {
  return "math-" + (item.kind === "review" ? item.reviewKind ?? "solve" : item.kind);
}

/** The kind an item actually renders as — collapses "review" onto its chosen inner kind. */
export function renderKindFor(item: MathQueueItem): Exclude<MathTaskKind, "review"> {
  if (item.kind !== "review") return item.kind;
  return item.reviewKind ?? "solve";
}

/**
 * Picks which task type to test a rule with next. Stage 0 is always the learn card. Above that the
 * stage's preferred list is filtered down to kinds the rule has content for, then drawn from while
 * avoiding whatever it was recently shown as.
 */
export function pickMathKindForStage(
  rule: MathRule,
  stage: LearningStage,
  recent: string[] = [],
  allowTyped = true
): Exclude<MathTaskKind, "review"> {
  if (stage === 0) return "learn";
  const available = availableKinds(rule, allowTyped);
  if (available.length === 0) return "learn";
  const preferred = (KINDS_BY_STAGE[stage as 1 | 2 | 3 | 4] ?? KINDS_BY_STAGE[3]).filter((k) => available.includes(k));
  const candidates = preferred.length > 0 ? preferred : available;
  const recentKinds = recent.map((f) => f.replace(/^math-/, "")).filter((k): k is MathActiveKind => candidates.includes(k as MathActiveKind));
  return pickAvoidingRecent(candidates, recentKinds);
}

function pickProblemIndex(rule: MathRule, kind: Exclude<MathTaskKind, "review">): number {
  if (kind === "learn") return 0;
  const pool = poolFor(rule, kind);
  return pool.length === 0 ? 0 : Math.floor(Math.random() * pool.length);
}

/** Builds one queue item for a rule at its current stage, choosing kind and problem index. */
function itemFor(rule: MathRule, stage: LearningStage, recent: string[] = [], allowTyped = true): MathQueueItem {
  const kind = pickMathKindForStage(rule, stage, recent, allowTyped);
  return { kind, ruleId: rule.id, problemIndex: pickProblemIndex(rule, kind) };
}

function reviewItemFor(rule: MathRule, recent: string[] = [], allowTyped = true): MathQueueItem {
  const available = availableKinds(rule, allowTyped);
  const reviewKind = available.length > 0 ? pickAvoidingRecent(available, recent.map((f) => f.replace(/^math-/, ""))) : "solve";
  return { kind: "review", ruleId: rule.id, problemIndex: pickProblemIndex(rule, reviewKind), reviewKind };
}

/* ------------------------------------------------------------ batch building ---- */

/** Restricts the rule pool to one topic, or to everything when null. */
export function rulesInScope(topic: MathTopic | null): MathRule[] {
  return topic === null ? MATH_RULES : MATH_RULES.filter((r) => r.topic === topic);
}

export interface MathBatch {
  activeRules: MathRule[];
  reviewRules: MathRule[];
}

/**
 * Picks the rules this session works on plus the long-term reviews that have come due — the same
 * shape as buildLearningBatch()/buildGrammarBatch(): in-progress rules chosen by weakness, new
 * rules capped so a session isn't all unfamiliar material, reviews taken most-overdue-first.
 */
export function buildMathBatch(
  topic: MathTopic | null,
  getState: (id: string) => WordState,
  totalPracticeSessions: number,
  includeReview: boolean,
  tuning: LearningTuning
): MathBatch {
  const pool = rulesInScope(topic);
  const newPool = pool.filter((r) => getState(r.id).stage === 0);

  if (!includeReview) {
    return { activeRules: selectByWeakness(newPool, (r) => getState(r.id), tuning.mathBatchSize), reviewRules: [] };
  }

  const duePool = pool.filter((r) => {
    const s = getState(r.id);
    return s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions;
  });
  duePool.sort((a, b) => (getState(a.id).dueAtSession ?? 0) - (getState(b.id).dueAtSession ?? 0));
  const reviewRules = duePool.slice(0, tuning.mathReviewSample);

  const inProgressPool = pool.filter((r) => {
    const s = getState(r.id);
    return s.stage >= 1 && s.stage <= 3;
  });
  const inProgressRules = selectByWeakness(inProgressPool, (r) => getState(r.id), tuning.mathBatchSize);

  const room = tuning.mathBatchSize - inProgressRules.length;
  const newRules = room > 0 ? selectByWeakness(newPool, (r) => getState(r.id), Math.min(room, tuning.maxNewMathPerSession)) : [];

  return { activeRules: inProgressRules.concat(newRules), reviewRules };
}

export interface MathInitialQueue {
  queue: MathQueueItem[];
  formatMemory: FormatMemory;
}

export function buildMathQueue(batch: MathBatch, getState: (id: string) => WordState, allowTyped = true): MathInitialQueue {
  let formatMemory: FormatMemory = {};
  const items: MathQueueItem[] = [];

  const remember = (item: MathQueueItem) => {
    formatMemory = rememberFormat(formatMemory, mathKey(item.ruleId), formatForMathItem(item));
    return item;
  };

  batch.activeRules.forEach((r) => items.push(remember(itemFor(r, getState(r.id).stage, [], allowTyped))));
  batch.reviewRules.forEach((r) => items.push(remember(reviewItemFor(r, [], allowTyped))));

  return { queue: spreadByKey(items, (item) => item.ruleId), formatMemory };
}

/* --------------------------------------------------------------- progression ---- */

export interface MathStageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  /** The follow-up task to insert later this session, or null when none is due. */
  followUp: MathQueueItem | null;
}

export function mathNextAfterAnswer(
  item: MathQueueItem,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number,
  recentFormats: string[],
  tuning: LearningTuning,
  allowTyped = true
): MathStageOutcome {
  const transition = nextStage({
    isLearnCard: item.kind === "learn",
    isReview: item.kind === "review",
    currentStage,
    reviewStreak,
    result,
    totalPracticeSessions,
    tuning,
  });

  const rule = MATH_RULES_BY_ID[item.ruleId];
  return {
    stage: transition.stage,
    reviewStreak: transition.reviewStreak,
    dueAtSession: transition.dueAtSession,
    followUp: transition.followUp && rule ? itemFor(rule, transition.stage, recentFormats, allowTyped) : null,
  };
}

/** Where a follow-up task should be inserted — expanding gaps, same rule as the other two engines. */
export function mathInsertionIndex(currentIndex: number, queueLength: number, attemptNo: number, tuning: LearningTuning): number | null {
  return spacedInsertionIndex(currentIndex, queueLength, attemptNo, tuning);
}

export function maxAttemptsPerRule(tuning: LearningTuning): number {
  return tuning.maxAttemptsPerItem;
}

/* -------------------------------------------------------------------- stats ---- */

export interface MathTopicProgress {
  topic: MathTopic;
  total: number;
  learned: number;
  inProgress: number;
  /** Rules due for review right now. */
  due: number;
  accuracy: number;
}

export function topicProgress(topic: MathTopic, getState: (id: string) => WordState, totalPracticeSessions: number): MathTopicProgress {
  const rules = rulesInScope(topic);
  let learned = 0;
  let inProgress = 0;
  let due = 0;
  let correct = 0;
  let answered = 0;
  rules.forEach((r) => {
    const s = getState(r.id);
    if (s.stage === 4) learned++;
    else if (s.stage > 0) inProgress++;
    if (s.stage === 4 && s.dueAtSession !== null && s.dueAtSession <= totalPracticeSessions) due++;
    correct += s.timesCorrect;
    answered += s.timesCorrect + s.timesAlmost + s.timesIncorrect;
  });
  return {
    topic,
    total: rules.length,
    learned,
    inProgress,
    due,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
  };
}

/** One graded answer, reported back from an exercise component to the session. */
export interface MathResultEntry {
  ruleId: string;
  format: string;
  result: AnswerResultKind;
  hintsUsed: number;
}
