// Schema for the Rules mode: prose rules to be memorised verbatim — depreciation, recognition
// criteria, thresholds — as opposed to the Mathematics mode's formulas you derive and apply.
//
// The two are deliberately separate content types. A math rule is a formula plus worked algebra; a
// memo rule is a statement plus a set of hard facts (rates, periods, conditions) that you either
// know or you don't. That difference drives everything: no KaTeX-first layout, no algebraic answer
// checking, and an exercise mix built around recall rather than computation.

export type MemoSetId = "depreciation";

/** One memorisable fact: a label and the value that must come back with it. */
export interface MemoFact {
  label: string;
  value: string;
  /** Alternative phrasings accepted when the learner types this value back. */
  accepted?: string[];
}

/** Fill the blank in a rule statement. `text` contains "___" exactly once. */
export interface MemoCloze {
  text: string;
  answer: string;
  accepted?: string[];
  hint?: string;
}

export interface MemoMc {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** A statement that is either right or wrong — the fastest way to drill misconceptions. */
export interface MemoTrueFalse {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

/** Put the steps of a procedure back into order. `steps` is the correct order; shuffled at render. */
export interface MemoOrder {
  prompt: string;
  steps: string[];
}

export interface MemoRule {
  id: string;
  setId: MemoSetId;
  category: string;
  title: string;
  /** The one sentence you must be able to produce from memory. Kept short on purpose. */
  statement: string;
  /** Context and reasoning — why the rule is what it is. Not itself memorised. */
  explanation: string;
  /** The hard, checkable core: rates, periods, thresholds, conditions. */
  facts: MemoFact[];
  /** Optional formula, rendered with KaTeX when the rule has a computational side. */
  formulaTex?: string;
  /** A concrete worked case, in prose. */
  example?: string;
  /** A memory hook, where one genuinely helps. */
  mnemonic?: string;
  cloze: MemoCloze[];
  mc: MemoMc[];
  trueFalse: MemoTrueFalse[];
  order: MemoOrder[];
}

/** Authoring convenience — fills in the exercise arrays a rule doesn't use. */
export type MemoRuleInput = Omit<MemoRule, "cloze" | "mc" | "trueFalse" | "order"> &
  Partial<Pick<MemoRule, "cloze" | "mc" | "trueFalse" | "order">>;

export function memoRule(input: MemoRuleInput): MemoRule {
  return { cloze: [], mc: [], trueFalse: [], order: [], ...input };
}
