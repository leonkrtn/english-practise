// Schema for the Mathematics content. Deliberately separate from vocab/grammar: a math rule is a
// formula plus a body of explanation, and its exercises are typed algebraic answers rather than
// natural language, so none of the vocabulary machinery transfers.
//
// Typed answers use plain ASCII math syntax, not LaTeX: `^` for powers, `*` for multiplication,
// `/` for division, parentheses to group, `sqrt(x)`, `ln(x)`, `log(x)`, `e^x`. See mathAnswerCheck.ts
// for exactly what the normalizer forgives. Every *Tex field is real LaTeX, rendered by Formula.tsx.

export type MathTopic =
  | "algebra"
  | "limits"
  | "differentiation"
  | "curve-sketching"
  | "integration"
  | "multivariable"
  | "linear-algebra"
  | "statistics"
  | "financial-math";

/** Three tiers so a topic can carry both the entry-level rule and the exam-level one. */
export type MathDifficulty = "foundation" | "core" | "advanced";

/** A worked example on the Learn card: the problem, then the solution as ordered lines. */
export interface MathWorkedExample {
  problemTex: string;
  /** Ordered LaTeX lines. Each is one visible step; the last is the result. */
  steps: string[];
}

/** Typed-answer problem — used by the "solve", "simplify" and (with `scenario`) "word" kinds. */
export interface MathProblem {
  promptTex: string;
  /** Canonical answer in ASCII math syntax. */
  answer: string;
  /** Other forms accepted as fully correct (e.g. an unsimplified but valid result). */
  accepted?: string[];
  /** Revealed one at a time, cheapest first. Costs XP, same as the vocabulary hints. */
  hints: string[];
  /** The full worked path, shown in the feedback panel after answering. LaTeX lines. */
  solution: string[];
}

/** Recognition question: which rule applies, or which of four results is right. */
export interface MathMcProblem {
  /** Prose question above the formula, e.g. "Which rule do you apply first?". */
  question: string;
  promptTex: string;
  /** LaTeX options. */
  options: string[];
  correctIndex: number;
  hints: string[];
  solution: string[];
}

/** Guided multi-step solve: each step is checked on its own before the next is revealed. */
export interface MathStepProblem {
  promptTex: string;
  steps: { instruction: string; answer: string; accepted?: string[]; hint: string }[];
  solution: string[];
}

/** A worked solution containing exactly one wrong line — tap it, then see the correction. */
export interface MathErrorProblem {
  promptTex: string;
  /** LaTeX lines of the (flawed) worked solution. */
  lines: string[];
  wrongLineIndex: number;
  correctedLineTex: string;
  explanation: string;
}

/** Applied/word problem: prose scenario, typed numeric or algebraic answer. */
export interface MathWordProblem {
  scenario: string;
  /** Optional formula shown under the scenario. */
  promptTex?: string;
  answer: string;
  accepted?: string[];
  /** Rendered next to the input, e.g. "€" or "%" — display only, never part of the answer. */
  unit?: string;
  hints: string[];
  solution: string[];
}

export interface MathRule {
  id: string;
  topic: MathTopic;
  /** Sub-heading within the topic, e.g. "Produkt & Quotient". */
  category: string;
  title: string;
  difficulty: MathDifficulty;
  formulaTex: string;
  /** The main explanation — several sentences, not a one-liner. */
  explanation: string;
  /** Where the formula comes from. LaTeX/prose lines, shown collapsed on the Learn card. */
  derivation?: string[];
  /** The mistakes people actually make with this rule. */
  pitfalls: string[];
  examples: MathWorkedExample[];
  solve: MathProblem[];
  simplify: MathProblem[];
  mc: MathMcProblem[];
  steps: MathStepProblem[];
  error: MathErrorProblem[];
  word: MathWordProblem[];
}

/** Convenience for authoring: fills in every exercise array that a rule doesn't use, so each topic
 * file only spells out the kinds it actually has content for. */
export type MathRuleInput = Omit<MathRule, "solve" | "simplify" | "mc" | "steps" | "error" | "word"> &
  Partial<Pick<MathRule, "solve" | "simplify" | "mc" | "steps" | "error" | "word">>;

export function rule(input: MathRuleInput): MathRule {
  return {
    solve: [],
    simplify: [],
    mc: [],
    steps: [],
    error: [],
    word: [],
    ...input,
  };
}
