import { MATH_RULES, MATH_TOPIC_META, MATH_TOPICS, type MathRule, type MathTopic } from "./math";
import { checkMathAnswer } from "./mathAnswerCheck";
import { choice, sample, shuffle } from "./utils";
import type { WordState } from "./types";

/* ------------------------------------------------------------------- scope ---- */

/** Named bundles of topics, so a test can cover "all of calculus" without listing five topics. */
export type MathTopicGroup = "calculus" | "quantitative";

export const MATH_GROUP_TOPICS: Record<MathTopicGroup, MathTopic[]> = {
  calculus: ["limits", "differentiation", "curve-sketching", "integration", "multivariable"],
  quantitative: ["linear-algebra", "statistics", "financial-math"],
};

export const MATH_GROUP_LABEL: Record<MathTopicGroup, string> = {
  calculus: "Calculus",
  quantitative: "Quantitative Methods",
};

export type MathTestScope = { kind: "all" } | { kind: "group"; group: MathTopicGroup } | { kind: "topic"; topic: MathTopic };

export type MathTestLength = 10 | 20 | 30;
export const MATH_TEST_LENGTH_OPTIONS: MathTestLength[] = [10, 20, 30];

export function scopeLabel(scope: MathTestScope): string {
  if (scope.kind === "all") return "All topics";
  if (scope.kind === "group") return MATH_GROUP_LABEL[scope.group];
  return MATH_TOPIC_META[scope.topic].label;
}

/** Stable string for storing the scope alongside a test result. */
export function scopeId(scope: MathTestScope): string {
  if (scope.kind === "all") return "all";
  if (scope.kind === "group") return "group:" + scope.group;
  return "topic:" + scope.topic;
}

/** Turns a stored scopeId back into a display label, for the test history in the stats screen. */
export function labelForScopeId(id: string): string {
  if (id === "all") return "All topics";
  if (id.startsWith("group:")) {
    const g = id.slice(6) as MathTopicGroup;
    return MATH_GROUP_LABEL[g] ?? id;
  }
  if (id.startsWith("topic:")) {
    const t = id.slice(6) as MathTopic;
    return MATH_TOPIC_META[t]?.label ?? id;
  }
  // Anything else is a label written by an older build — show it as-is rather than blanking it.
  return id;
}

export function topicsInScope(scope: MathTestScope): MathTopic[] {
  if (scope.kind === "all") return MATH_TOPICS;
  if (scope.kind === "group") return MATH_GROUP_TOPICS[scope.group].filter((t) => MATH_TOPICS.includes(t));
  return [scope.topic];
}

/* --------------------------------------------------------------- questions ---- */

/** One exam question, fully self-contained so the paper is reproducible and the result screen can
 * render a complete answer key without reaching back into the rule data. */
export interface MathTestQuestion {
  id: string;
  ruleId: string;
  topic: MathTopic;
  kind: "mc" | "typed";
  /** Small label above the question, e.g. "Differentiation · Chain Rule". */
  category: string;
  /** Prose instruction, when the question carries one. */
  question?: string;
  promptTex: string;
  options?: string[];
  correctIndex?: number;
  accepted?: string[];
  /** Canonical answer for the answer key. */
  solution: string;
  /** Full worked path, shown in the result screen. */
  solutionSteps: string[];
}

export type MathTestAnswer = { kind: "mc"; chosen: number | null } | { kind: "typed"; text: string };

/**
 * Which rules a test may draw from. Grading someone on content they have never been shown measures
 * nothing, so the pool is everything already touched — falling back to the full scope only when
 * that is too small to fill the requested length, so an early test still works.
 */
function rulePool(scope: MathTestScope, getState: (id: string) => WordState, needed: number): MathRule[] {
  const topics = topicsInScope(scope);
  const inScope = MATH_RULES.filter((r) => topics.includes(r.topic));
  const touched = inScope.filter((r) => getState(r.id).timesSeen > 0);
  return touched.length >= needed ? touched : inScope;
}

/**
 * Turns a rule into one exam question. Only the kinds with an unambiguous single right answer are
 * used — multiple choice and the typed solve/simplify/word problems. The guided step-by-step and
 * find-the-error formats are deliberately left out: under exam conditions there is no feedback
 * round, and a multi-part or tap-a-line task cannot be graded fairly in one shot.
 */
function buildQuestion(rule: MathRule, index: number): MathTestQuestion | null {
  const kinds: string[] = [];
  if (rule.mc.length) kinds.push("mc");
  if (rule.solve.length) kinds.push("solve");
  if (rule.simplify.length) kinds.push("simplify");
  if (rule.word.length) kinds.push("word");
  if (kinds.length === 0) return null;

  const id = `mt${index}-${rule.id}`;
  const category = `${MATH_TOPIC_META[rule.topic].label} · ${rule.title}`;

  switch (choice(kinds)) {
    case "mc": {
      const v = choice(rule.mc);
      return {
        id,
        ruleId: rule.id,
        topic: rule.topic,
        kind: "mc",
        category,
        question: v.question,
        promptTex: v.promptTex,
        options: v.options,
        correctIndex: v.correctIndex,
        solution: v.options[v.correctIndex],
        solutionSteps: v.solution,
      };
    }
    case "word": {
      const v = choice(rule.word);
      return {
        id,
        ruleId: rule.id,
        topic: rule.topic,
        kind: "typed",
        category,
        question: v.scenario,
        promptTex: v.promptTex ?? "",
        accepted: [v.answer, ...(v.accepted ?? [])],
        solution: v.answer,
        solutionSteps: v.solution,
      };
    }
    case "simplify": {
      const v = choice(rule.simplify);
      return {
        id,
        ruleId: rule.id,
        topic: rule.topic,
        kind: "typed",
        category,
        question: "Simplify",
        promptTex: v.promptTex,
        accepted: [v.answer, ...(v.accepted ?? [])],
        solution: v.answer,
        solutionSteps: v.solution,
      };
    }
    default: {
      const v = choice(rule.solve);
      return {
        id,
        ruleId: rule.id,
        topic: rule.topic,
        kind: "typed",
        category,
        question: "Solve",
        promptTex: v.promptTex,
        accepted: [v.answer, ...(v.accepted ?? [])],
        solution: v.answer,
        solutionSteps: v.solution,
      };
    }
  }
}

export function buildMathTest(scope: MathTestScope, length: MathTestLength, getState: (id: string) => WordState): MathTestQuestion[] {
  const pool = rulePool(scope, getState, length);
  if (pool.length === 0) return [];

  // sample() caps at the pool size, so a short pool is cycled through rather than repeated
  // back-to-back — the same rule can reappear, but never as two adjacent questions.
  let picked = sample(pool, length);
  while (picked.length < length && pool.length > 0) picked = picked.concat(sample(pool, length - picked.length));

  const questions: MathTestQuestion[] = [];
  picked.slice(0, length).forEach((r, i) => {
    const q = buildQuestion(r, i);
    if (q) questions.push(q);
  });
  return shuffle(questions);
}

/* ----------------------------------------------------------------- grading ---- */

/** Points for one answer. Unlike the English tests there is no half-credit tier: a math answer is
 * either right or it isn't, and the numeric comparison already forgives rounding and notation. */
export function scoreMathAnswer(question: MathTestQuestion, answer: MathTestAnswer | undefined): number {
  if (!answer) return 0;
  if (question.kind === "mc") return answer.kind === "mc" && answer.chosen === question.correctIndex ? 1 : 0;
  if (answer.kind !== "typed" || !answer.text.trim()) return 0;
  return checkMathAnswer(answer.text, question.accepted ?? []) ? 1 : 0;
}

/** Pass mark, as a share of the total. */
export const MATH_PASS_THRESHOLD = 0.6;

export interface MathTestResultSummary {
  points: number;
  total: number;
  percent: number;
  passed: boolean;
}

export function gradeMathTest(points: number, total: number): MathTestResultSummary {
  const safeTotal = total || 1;
  const percent = Math.round((points / safeTotal) * 100);
  return { points, total: safeTotal, percent, passed: points / safeTotal >= MATH_PASS_THRESHOLD };
}

/** Colour band for the result screen — purely presentational, keyed off the percentage. */
export function mathBandFor(percent: number): { label: string; grad: string; text: string; tint: string } {
  if (percent >= 90) return { label: "Excellent", grad: "from-purple to-blue", text: "text-purple", tint: "bg-purple-light" };
  if (percent >= 75) return { label: "Very good", grad: "from-green to-blue", text: "text-green", tint: "bg-green-light" };
  if (percent >= 60) return { label: "Pass", grad: "from-green to-green-dark", text: "text-green", tint: "bg-green-light" };
  if (percent >= 40) return { label: "Just missed", grad: "from-amber to-amber-dark", text: "text-amber", tint: "bg-amber-light" };
  return { label: "Fail", grad: "from-red to-red-dark", text: "text-red", tint: "bg-red-light" };
}

/** One finished math test, as stored in math_test_history. */
export interface MathTestRecord {
  date: number;
  scope: string;
  points: number;
  total: number;
  percent: number;
  passed: boolean;
  durationSeconds: number;
}
