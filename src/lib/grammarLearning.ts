import { GRAMMAR_RULES, type GrammarRule } from "./grammar-data";
import { choice, sample, shuffle } from "./utils";
import type { AnswerResultKind, LearningStage } from "./types";
import type { GrammarRuleState } from "./grammarTypes";

export type GrammarStageKind = "learn" | "quiz" | "apply" | "produce" | "review";

/** Every exercise format a mastered rule can resurface as during long-term review — deliberately
 * wider than the single fixed "g-error" format review used before, so a rule you've known for
 * months doesn't always show the exact same question. Left out of the quiz/apply/produce gate
 * that drives mastery itself, so that carefully-tuned progression stays untouched. */
export type GrammarReviewFormat = "g-error" | "g-mc" | "g-gap" | "g-build" | "g-conjugate" | "g-translate" | "g-transform" | "g-situation";
const REVIEW_FORMATS: GrammarReviewFormat[] = ["g-error", "g-mc", "g-gap", "g-build", "g-conjugate", "g-translate", "g-transform", "g-situation"];
export function pickReviewFormat(): GrammarReviewFormat {
  return choice(REVIEW_FORMATS);
}

export interface GrammarQueueItem {
  kind: GrammarStageKind;
  rule: GrammarRule;
  /** Only set when kind === "review" — which of the REVIEW_FORMATS to render this time. */
  reviewFormat?: GrammarReviewFormat;
}

/** Maps each task type to the exercise format that tests it. */
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

const GRAMMAR_ACTIVE_KINDS: Exclude<GrammarStageKind, "learn" | "review">[] = ["quiz", "apply", "produce"];

/**
 * Which task type to test a rule with. Stage 0 (the very first encounter) is always "learn" —
 * everything past that picks a random format each time instead of one fixed type per stage, so a
 * rule doesn't always get tested the same way as it climbs toward mastery. Progression itself
 * still tracks the rule's real persisted stage (see grammarNextAfterAnswer) — only which format
 * is shown is randomized.
 */
export function pickGrammarKindForStage(stage: LearningStage): Exclude<GrammarStageKind, "review"> {
  if (stage === 0) return "learn";
  return choice(GRAMMAR_ACTIVE_KINDS);
}

/**
 * How many *consecutive* correct active-learning answers a rule needs at the final pre-mastery
 * stage before it's trusted as mastered — mirrors the vocab engine's APPLY_REQUIRED_STREAK, so a
 * single lucky correct answer doesn't promote a rule to mastery on its own.
 */
export const GRAMMAR_MASTERY_REQUIRED_STREAK = 3;

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
  blockedRuleIds: ReadonlySet<string> = new Set(),
  includeReview: boolean = true
): GrammarBatch {
  const pool = activeGrammarRules(blockedRuleIds);

  if (!includeReview) {
    // "Nur Neues lernen": brand-new rules only — see buildLearningBatch's identical fix for why
    // in-progress rules can't be mixed back in here without defeating the whole point.
    const newPool = pool.filter((r) => getState(r.id).stage === 0);
    return { activeRules: sample(newPool, GRAMMAR_BATCH_SIZE), reviewRules: [] };
  }

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
  const items: GrammarQueueItem[] = batch.activeRules.map((rule) => ({ kind: pickGrammarKindForStage(getState(rule.id).stage), rule }));
  batch.reviewRules.forEach((rule) => items.push({ kind: "review", rule, reviewFormat: pickReviewFormat() }));
  return shuffle(items);
}

export interface GrammarStageOutcome {
  stage: LearningStage;
  reviewStreak: number;
  dueAtSession: number | null;
  nextKind: GrammarStageKind | null;
}

/**
 * Computes a rule's next learning stage after an answer, and which task (if any) should follow
 * up later in the same session. `currentStage` is the rule's actual persisted stage — since the
 * task format shown (`kind`) is now picked randomly rather than implied by the stage (see
 * pickGrammarKindForStage), progression has to read the real stage instead of inferring it from
 * which format happened to be tested this time.
 */
export function grammarNextAfterAnswer(
  kind: GrammarStageKind,
  currentStage: LearningStage,
  reviewStreak: number,
  result: AnswerResultKind,
  totalPracticeSessions: number
): GrammarStageOutcome {
  if (kind === "learn") {
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickGrammarKindForStage(1) };
  }
  if (kind === "review") {
    if (result === "correct") {
      const rs = reviewStreak + 1;
      return { stage: 4, reviewStreak: rs, dueAtSession: totalPracticeSessions + grammarReviewInterval(rs), nextKind: null };
    }
    // Forgetting a mastered rule sends it all the way back to the bottom of active learning, not
    // straight to "produce" — re-earning mastery means climbing the whole ladder again, not one
    // lucky sentence.
    return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickGrammarKindForStage(1) };
  }

  // Active learning — quiz/apply/produce. The format shown no longer implies the stage, so
  // promotion and demotion both key off the rule's real persisted stage.
  if (result === "correct") {
    if (currentStage >= 3) {
      // Final step before mastery: needs GRAMMAR_MASTERY_REQUIRED_STREAK consecutive correct
      // answers, reusing the reviewStreak field as that counter.
      const streak = reviewStreak + 1;
      if (streak >= GRAMMAR_MASTERY_REQUIRED_STREAK) {
        return { stage: 4, reviewStreak: 0, dueAtSession: totalPracticeSessions + grammarReviewInterval(0), nextKind: null };
      }
      return { stage: 3, reviewStreak: streak, dueAtSession: null, nextKind: pickGrammarKindForStage(3) };
    }
    const newStage = (currentStage + 1) as LearningStage;
    return { stage: newStage, reviewStreak: 0, dueAtSession: null, nextKind: pickGrammarKindForStage(newStage) };
  }

  // Any wrong active-learning answer knocks the rule straight back to stage 1 — no partial
  // credit for progress already made, regardless of which stage it fell at.
  return { stage: 1, reviewStreak: 0, dueAtSession: null, nextKind: pickGrammarKindForStage(1) };
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
