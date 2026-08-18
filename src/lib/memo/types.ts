// Schema for the Rules mode: content to be memorised verbatim — depreciation rules, formula sheets,
// thresholds — as opposed to the Mathematics mode's formulas you derive and apply.
//
// Two display flavours share one schema. A "prose" rule (depreciation) leads with a sentence you
// must be able to say; a "formula" rule leads with the formula itself, rendered as KaTeX, with the
// sentence demoted to a gloss. The exercise mix adapts: formula rules get a formula-cloze format and
// render their multiple-choice options as maths.

/** Built-in sets are named constants; a learner's own sets carry their database id as the key. */
export type MemoSetId = string;

/** How a rule leads: with its sentence, or with its formula. */
export type MemoDisplay = "prose" | "formula";

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

/**
 * A formula with one piece removed, picked from four candidates.
 *
 * Deliberately multiple choice rather than typed: reproducing LaTeX by hand tests keyboard skill,
 * not memory. `templateTex` must contain exactly one `\square`, which is where the chosen option is
 * substituted for the preview.
 */
export interface MemoFormulaCloze {
  templateTex: string;
  /** LaTeX fragments; exactly one is correct. */
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MemoMc {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Render the options as KaTeX rather than plain text. Set automatically for formula rules. */
  optionsAreTex?: boolean;
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
  /** The one sentence you must be able to produce from memory — or, for formula rules, the gloss. */
  statement: string;
  /** Context and reasoning. Not itself memorised. */
  explanation: string;
  /** The hard, checkable core: rates, periods, thresholds, conditions. */
  facts: MemoFact[];
  formulaTex?: string;
  display: MemoDisplay;
  example?: string;
  mnemonic?: string;
  cloze: MemoCloze[];
  formulaCloze: MemoFormulaCloze[];
  mc: MemoMc[];
  trueFalse: MemoTrueFalse[];
  order: MemoOrder[];
  /** True for a learner-authored card — drives the edit affordance and the exercise mix. */
  custom?: boolean;
}

/** Authoring convenience — fills in the exercise arrays a rule doesn't use. */
export type MemoRuleInput = Omit<MemoRule, "cloze" | "formulaCloze" | "mc" | "trueFalse" | "order" | "display"> &
  Partial<Pick<MemoRule, "cloze" | "formulaCloze" | "mc" | "trueFalse" | "order" | "display">>;

export function memoRule(input: MemoRuleInput): MemoRule {
  return { display: "prose", cloze: [], formulaCloze: [], mc: [], trueFalse: [], order: [], ...input };
}
