import { shuffle } from "./utils";
import { MATH_RULES } from "./mathRules";
import type { AnswerResultKind, WordState } from "./types";

// The differentiation-rules practice queue. Simpler than the vocab/grammar stage engine (learning.ts/
// grammarLearning.ts) — no due-date scheduling — since the content is a bounded set of 12 rules, not a
// multi-thousand-word bank. New rules are introduced (Learn) before being drilled, and drilling favours
// whichever rules currently score lowest.

export type MathTaskKind = "learn" | "solve" | "simplify";

export interface MathQueueItem {
  ruleId: string;
  kind: MathTaskKind;
  /** Index into rule.solve / rule.simplify; unused for "learn". */
  problemIndex: number;
}

export interface MathResultEntry {
  ruleId: string;
  format: string;
  result: AnswerResultKind;
}

const MATH_BATCH_SIZE = 10;

export function buildMathQueue(wordState: (id: string) => WordState, solveEnabled: boolean, batchSize = MATH_BATCH_SIZE): MathQueueItem[] {
  const learnItems: MathQueueItem[] = [];
  const practiceItems: MathQueueItem[] = [];
  MATH_RULES.forEach((rule) => {
    if (wordState(rule.id).timesSeen === 0) learnItems.push({ ruleId: rule.id, kind: "learn", problemIndex: 0 });
    if (solveEnabled) rule.solve.forEach((_, i) => practiceItems.push({ ruleId: rule.id, kind: "solve", problemIndex: i }));
    rule.simplify.forEach((_, i) => practiceItems.push({ ruleId: rule.id, kind: "simplify", problemIndex: i }));
  });
  const prioritized = shuffle(practiceItems).sort((a, b) => wordState(a.ruleId).score - wordState(b.ruleId).score);
  const remaining = Math.max(0, batchSize - learnItems.length);
  return [...learnItems, ...prioritized.slice(0, remaining)];
}
