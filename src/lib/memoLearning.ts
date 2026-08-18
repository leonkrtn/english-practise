import { MEMO_RULES, MEMO_RULES_BY_ID, memoRulesForSet, type MemoRule, type MemoSetId } from "./memo";
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

/** Prefix for this domain in the shared attempt/format bookkeeping — mirrors vocabKey()/mathKey(). */
export const memoKey = (ruleId: string) => "memo:" + ruleId;

export type MemoTaskKind = "learn" | "flashcard" | "cloze" | "mc" | "truefalse" | "order" | "facts" | "review";

export type MemoActiveKind = Exclude<MemoTaskKind, "learn" | "review">;

/**
 * The ladder for rote memorisation, which is a different shape from the math one.
 *
 * Stage 1 is recognition (multiple choice, true/false) — can you pick the right statement out of a
 * line-up. Stage 2 is cued recall (cloze, order) — can you produce the missing piece with the
 * sentence in front of you. Stages 3–4 are free recall (flashcard, facts) — nothing on screen but
 * the rule's name, which is the only test that proves you actually know it.
 */
const KINDS_BY_STAGE: Record<1 | 2 | 3 | 4, MemoActiveKind[]> = {
  1: ["mc", "truefalse"],
  2: ["cloze", "order", "truefalse"],
  3: ["flashcard", "facts", "cloze"],
  4: ["flashcard", "facts", "mc"],
};

const REVIEW_KINDS: MemoActiveKind[] = ["flashcard", "facts", "cloze", "mc", "truefalse", "order"];

function poolSize(rule: MemoRule, kind: MemoActiveKind): number {
  switch (kind) {
    case "cloze":
      return rule.cloze.length;
    case "mc":
      return rule.mc.length;
    case "truefalse":
      return rule.trueFalse.length;
    case "order":
      return rule.order.length;
    case "facts":
      return rule.facts.length > 0 ? 1 : 0;
    case "flashcard":
      // Always available: every rule has a statement to recall.
      return 1;
  }
}

/** Which kinds this rule has content for. Flashcard is always present, so this is never empty. */
export function availableMemoKinds(rule: MemoRule): MemoActiveKind[] {
  return REVIEW_KINDS.filter((k) => poolSize(rule, k) > 0);
}

export interface MemoQueueItem {
  kind: MemoTaskKind;
  ruleId: string;
  problemIndex: number;
  reviewKind?: MemoActiveKind;
}

export function formatForMemoItem(item: MemoQueueItem): string {
  return "memo-" + (item.kind === "review" ? item.reviewKind ?? "flashcard" : item.kind);
}

export function memoRenderKind(item: MemoQueueItem): Exclude<MemoTaskKind, "review"> {
  if (item.kind !== "review") return item.kind;
  return item.reviewKind ?? "flashcard";
}

export function pickMemoKindForStage(rule: MemoRule, stage: LearningStage, recent: string[] = []): Exclude<MemoTaskKind, "review"> {
  if (stage === 0) return "learn";
  const available = availableMemoKinds(rule);
  if (available.length === 0) return "learn";
  const preferred = (KINDS_BY_STAGE[stage as 1 | 2 | 3 | 4] ?? KINDS_BY_STAGE[3]).filter((k) => available.includes(k));
  const candidates = preferred.length > 0 ? preferred : available;
  const recentKinds = recent
    .map((f) => f.replace(/^memo-/, ""))
    .filter((k): k is MemoActiveKind => candidates.includes(k as MemoActiveKind));
  return pickAvoidingRecent(candidates, recentKinds);
}

function pickIndex(rule: MemoRule, kind: Exclude<MemoTaskKind, "review">): number {
  if (kind === "learn" || kind === "flashcard" || kind === "facts") return 0;
  const n = poolSize(rule, kind as MemoActiveKind);
  return n === 0 ? 0 : Math.floor(Math.random() * n);
}

/** `drill` skips the learn card: a stage-0 rule is lifted to stage 1 so practice starts immediately. */
function itemFor(rule: MemoRule, stage: LearningStage, recent: string[] = [], drill = false): MemoQueueItem {
  const effective = drill && stage === 0 ? 1 : stage;
  const kind = pickMemoKindForStage(rule, effective, recent);
  return { kind, ruleId: rule.id, problemIndex: pickIndex(rule, kind) };
}

function reviewItemFor(rule: MemoRule, recent: string[] = []): MemoQueueItem {
  const available = availableMemoKinds(rule);
  const reviewKind = available.length > 0 ? pickAvoidingRecent(available, recent.map((f) => f.replace(/^memo-/, ""))) : "flashcard";
  return { kind: "review", ruleId: rule.id, problemIndex: pickIndex(rule, reviewKind), reviewKind };
}

/* ------------------------------------------------------------ batch building ---- */

export function memoRulesInScope(setId: MemoSetId | null): MemoRule[] {
  return setId === null ? MEMO_RULES : memoRulesForSet(setId);
}

export interface MemoBatch {
  activeRules: MemoRule[];
  reviewRules: MemoRule[];
}

export function buildMemoBatch(
  setId: MemoSetId | null,
  getState: (id: string) => WordState,
  totalPracticeSessions: number,
  includeReview: boolean,
  tuning: LearningTuning,
  drill = false
): MemoBatch {
  const pool = memoRulesInScope(setId);
  const newPool = pool.filter((r) => getState(r.id).stage === 0);

  if (drill) {
    return { activeRules: selectByWeakness(pool, (r) => getState(r.id), tuning.mathBatchSize), reviewRules: [] };
  }

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

export interface MemoInitialQueue {
  queue: MemoQueueItem[];
  formatMemory: FormatMemory;
}

export function buildMemoQueue(batch: MemoBatch, getState: (id: string) => WordState, drill = false): MemoInitialQueue {
  let formatMemory: FormatMemory = {};
  const items: MemoQueueItem[] = [];
  const remember = (item: MemoQueueItem) => {
    formatMemory = rememberFormat(formatMemory, memoKey(item.ruleId), formatForMemoItem(item));
    return item;
  };
  batch.activeRules.forEach((r) => items.push(remember(itemFor(r, getState(r.id).stage, [], drill))));
  batch.reviewRules.forEach((r) => items.push(remember(reviewItemFor(r))));
  return { queue: spreadByKey(items, (i) => i.ruleId), formatMemory };
}

/* --------------------------------------------------------------- progression ---- */

export interface MemoStageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  followUp: MemoQueueItem | null;
}

export function memoNextAfterAnswer(
  item: MemoQueueItem,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number,
  recentFormats: string[],
  tuning: LearningTuning,
  drill = false
): MemoStageOutcome {
  const transition = nextStage({
    isLearnCard: item.kind === "learn",
    isReview: item.kind === "review",
    currentStage,
    reviewStreak,
    result,
    totalPracticeSessions,
    tuning,
  });
  const rule = MEMO_RULES_BY_ID[item.ruleId];
  return {
    stage: transition.stage,
    reviewStreak: transition.reviewStreak,
    dueAtSession: transition.dueAtSession,
    followUp: transition.followUp && rule ? itemFor(rule, transition.stage, recentFormats, drill) : null,
  };
}

export function memoInsertionIndex(currentIndex: number, queueLength: number, attemptNo: number, tuning: LearningTuning): number | null {
  return spacedInsertionIndex(currentIndex, queueLength, attemptNo, tuning);
}

export function maxAttemptsPerMemoRule(tuning: LearningTuning): number {
  return tuning.maxAttemptsPerItem;
}

export interface MemoResultEntry {
  ruleId: string;
  format: string;
  result: AnswerResultKind;
  hintsUsed: number;
}

/* -------------------------------------------------------------------- stats ---- */

export interface MemoSetProgress {
  setId: MemoSetId;
  total: number;
  learned: number;
  inProgress: number;
  due: number;
  accuracy: number;
}

export function memoSetProgress(setId: MemoSetId, getState: (id: string) => WordState, totalPracticeSessions: number): MemoSetProgress {
  const rules = memoRulesForSet(setId);
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
  return { setId, total: rules.length, learned, inProgress, due, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
}
