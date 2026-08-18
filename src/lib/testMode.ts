import { VOCAB, type Word } from "./vocab";
import { GRAMMAR_RULES, type GrammarRule } from "./grammar-data";
import { choice, sample, shuffle } from "./utils";
import { classifyAnswer, findGap } from "./answerCheck";
import type { WordState } from "./types";
import type { GrammarRuleState } from "./grammarTypes";

export type TestScope = "vocab" | "grammar" | "both";
export type TestLength = 15 | 25 | 40;

export const TEST_SCOPE_OPTIONS: { val: TestScope; label: string }[] = [
  { val: "both", label: "Both" },
  { val: "vocab", label: "Vocabulary" },
  { val: "grammar", label: "Grammar" },
];

export const TEST_LENGTH_OPTIONS: TestLength[] = [15, 25, 40];

/** A single exam question, fully self-contained: the test screen renders it without reaching back
 * into the vocab/grammar data, and nothing here depends on the learner's progress. That's what
 * makes a test reproducible and lets the result screen show a full answer key afterwards. */
export interface TestQuestion {
  id: string;
  domain: "vocab" | "grammar";
  kind: "mc" | "typed";
  /** Shown as a small label above the question, e.g. "Vocabulary · Translation". */
  category: string;
  prompt: string;
  /** Optional second line under the prompt (a sentence with a gap, a situation, …). */
  sub?: string;
  /** Set when kind === "mc". */
  options?: string[];
  correctIndex?: number;
  /** Set when kind === "typed" — every spelling accepted as fully correct. */
  accepted?: string[];
  /** Canonical answer, shown in the result screen's answer key. */
  solution: string;
}

export type TestAnswer =
  | { kind: "mc"; chosen: number | null }
  | { kind: "typed"; text: string };

/* ------------------------------------------------------- building a test ---- */

/**
 * Which words/rules a test may draw from. A graded exam over content the learner has never even
 * been shown would measure nothing, so the pool is everything already touched (seen at least once
 * or already mastered) — and only falls back to the full catalogue when that's too small to fill
 * the requested length, so an early test still works rather than silently coming up short.
 */
function vocabPool(getState: (id: string) => WordState, blocked: ReadonlySet<string>, needed: number): Word[] {
  const active = VOCAB.filter((w) => !blocked.has(w.id));
  const touched = active.filter((w) => getState(w.id).timesSeen > 0);
  return touched.length >= needed ? touched : active;
}

function grammarPool(getState: (id: string) => GrammarRuleState, blocked: ReadonlySet<string>, needed: number): GrammarRule[] {
  const active = GRAMMAR_RULES.filter((r) => !blocked.has(r.id));
  const touched = active.filter((r) => getState(r.id).timesSeen > 0);
  return touched.length >= needed ? touched : active;
}

function vocabQuestion(word: Word, index: number): TestQuestion {
  const samePool = VOCAB.filter((w) => w.type === word.type && w.id !== word.id);
  const id = `v${index}-${word.id}`;
  const gap = findGap(word.enSentence, word);
  // Only offer the gap variant when the word really appears in its own example sentence —
  // findGap returns null for irregular forms the regex can't match.
  const variants = gap ? ["mc-de", "mc-en", "typed", "gap"] : ["mc-de", "mc-en", "typed"];

  switch (choice(variants)) {
    case "mc-de": {
      const options = shuffle([word.de[0], ...sample(samePool, 3).map((w) => w.de[0])]);
      return {
        id,
        domain: "vocab",
        kind: "mc",
        category: "Vocabulary · Meaning",
        prompt: word.en,
        sub: "Which German translation fits?",
        options,
        correctIndex: options.indexOf(word.de[0]),
        solution: word.de.join(" / "),
      };
    }
    case "mc-en": {
      const options = shuffle([word.en, ...sample(samePool, 3).map((w) => w.en)]);
      return {
        id,
        domain: "vocab",
        kind: "mc",
        category: "Vocabulary · Meaning",
        prompt: word.de.join(" / "),
        sub: "Which English word fits?",
        options,
        correctIndex: options.indexOf(word.en),
        solution: word.en,
      };
    }
    case "gap": {
      const g = gap!;
      return {
        id,
        domain: "vocab",
        kind: "typed",
        category: "Vocabulary · Gap",
        prompt: word.enSentence.slice(0, g.index) + "______" + word.enSentence.slice(g.index + g.matched.length),
        sub: word.deSentence,
        accepted: [g.matched, word.en],
        solution: g.matched,
      };
    }
    default:
      return {
        id,
        domain: "vocab",
        kind: "typed",
        category: "Vocabulary · Translation",
        prompt: word.de.join(" / "),
        sub: "Translate into English",
        accepted: [word.en],
        solution: word.en,
      };
  }
}

/**
 * Builds a question from a rule, preferring its authored recognition variants. Free-production
 * variants (translate/transform) are deliberately left out: under exam conditions there's no
 * feedback round to explain a near-miss, so only tasks with an unambiguous right answer are fair
 * to grade. Returns null for a rule that has none of the usable variants authored.
 */
function grammarQuestion(rule: GrammarRule, index: number): TestQuestion | null {
  const id = `g${index}-${rule.id}`;
  const kinds: string[] = [];
  if (rule.mc.length) kinds.push("mc");
  if (rule.conjugate.length) kinds.push("conjugate");
  if (rule.situation.length) kinds.push("situation");
  if (rule.gap.length) kinds.push("gap");
  if (kinds.length === 0) return null;

  switch (choice(kinds)) {
    case "mc": {
      const v = choice(rule.mc);
      return {
        id,
        domain: "grammar",
        kind: "mc",
        category: `Grammar · ${rule.category}`,
        prompt: v.prompt,
        options: v.options,
        correctIndex: v.correctIndex,
        solution: v.options[v.correctIndex],
      };
    }
    case "conjugate": {
      const v = choice(rule.conjugate);
      return {
        id,
        domain: "grammar",
        kind: "mc",
        category: `Grammar · ${rule.category}`,
        prompt: v.template.replace("___", "______"),
        sub: "Which form belongs in the gap?",
        options: v.options,
        correctIndex: v.correctIndex,
        solution: v.options[v.correctIndex],
      };
    }
    case "situation": {
      const v = choice(rule.situation);
      const options = [v.optionA, v.optionB];
      return {
        id,
        domain: "grammar",
        kind: "mc",
        category: `Grammar · ${rule.category}`,
        prompt: v.situation,
        sub: "Which sentence fits the situation?",
        options,
        correctIndex: v.correctIndex,
        solution: options[v.correctIndex],
      };
    }
    default: {
      const v = choice(rule.gap);
      return {
        id,
        domain: "grammar",
        kind: "typed",
        category: `Grammar · ${rule.category}`,
        prompt: v.template.replace("___", "______"),
        sub: "Fill in the gap",
        accepted: [v.answer],
        solution: v.answer,
      };
    }
  }
}

/** Builds the exam paper. Vocabulary and grammar are split evenly for a "both" test, then the
 * whole thing is shuffled so the two domains interleave instead of arriving in blocks. */
export function buildTest(
  scope: TestScope,
  length: TestLength,
  getWordState: (id: string) => WordState,
  blockedWordIds: ReadonlySet<string>,
  getRuleState: (id: string) => GrammarRuleState,
  blockedRuleIds: ReadonlySet<string>
): TestQuestion[] {
  const vocabCount = scope === "grammar" ? 0 : scope === "vocab" ? length : Math.ceil(length / 2);
  const grammarCount = length - vocabCount;

  const questions: TestQuestion[] = [];

  if (vocabCount > 0) {
    const pool = vocabPool(getWordState, blockedWordIds, vocabCount);
    // sample() caps at the pool size, so a short pool is cycled through rather than repeated
    // back-to-back — the same word can reappear, but never as two adjacent questions.
    let picked = sample(pool, vocabCount);
    while (picked.length < vocabCount && pool.length > 0) picked = picked.concat(sample(pool, vocabCount - picked.length));
    picked.slice(0, vocabCount).forEach((w, i) => questions.push(vocabQuestion(w, i)));
  }

  if (grammarCount > 0) {
    const pool = grammarPool(getRuleState, blockedRuleIds, grammarCount);
    let picked = sample(pool, grammarCount);
    while (picked.length < grammarCount && pool.length > 0) picked = picked.concat(sample(pool, grammarCount - picked.length));
    picked.slice(0, grammarCount).forEach((r, i) => {
      const q = grammarQuestion(r, i);
      if (q) questions.push(q);
    });
  }

  return shuffle(questions);
}

/* ---------------------------------------------------------------- grading ---- */

/** Points a single answer is worth, 0-1. A typed near-miss (a spelling slip on an otherwise right
 * answer) scores half rather than nothing — the same "almost" tier the practice modes use. */
export function scoreAnswer(question: TestQuestion, answer: TestAnswer | undefined): number {
  if (!answer) return 0;
  if (question.kind === "mc") {
    return answer.kind === "mc" && answer.chosen === question.correctIndex ? 1 : 0;
  }
  if (answer.kind !== "typed" || !answer.text.trim()) return 0;
  const cls = classifyAnswer(answer.text, question.accepted || []);
  return cls.result === "correct" ? 1 : cls.result === "almost" ? 0.5 : 0;
}

export type GradeBand = "reprovado" | "suficiente" | "bom" | "muito-bom" | "excelente";

export interface TestGrade {
  /** Portuguese higher-education scale, 0-20, one decimal — the scale used at Católica Lisbon. */
  grade: number;
  /** The same grade rounded to an integer, which is how it would be entered on a transcript. */
  finalGrade: number;
  band: GradeBand;
  bandLabel: string;
  passed: boolean;
  points: number;
  total: number;
  accuracy: number;
}

const BANDS: { min: number; band: GradeBand; label: string }[] = [
  { min: 18, band: "excelente", label: "Excelente" },
  { min: 16, band: "muito-bom", label: "Muito Bom" },
  { min: 14, band: "bom", label: "Bom" },
  { min: 10, band: "suficiente", label: "Suficiente" },
  { min: 0, band: "reprovado", label: "Reprovado" },
];

export const BAND_STYLES: Record<GradeBand, { text: string; grad: string; tint: string }> = {
  excelente: { text: "text-purple", grad: "from-purple to-blue", tint: "bg-purple-light" },
  "muito-bom": { text: "text-green", grad: "from-green to-blue", tint: "bg-green-light" },
  bom: { text: "text-green", grad: "from-green to-green-dark", tint: "bg-green-light" },
  suficiente: { text: "text-amber", grad: "from-amber to-amber-dark", tint: "bg-amber-light" },
  reprovado: { text: "text-red", grad: "from-red to-red-dark", tint: "bg-red-light" },
};

/** Which qualitative band a 0-20 grade falls into. Read off the rounded transcript grade, so a
 * 9.5 that rounds up to 10 counts as Suficiente rather than Reprovado. */
export function bandForGrade(grade: number): { band: GradeBand; label: string } {
  const finalGrade = Math.round(grade);
  const match = BANDS.find((b) => finalGrade >= b.min)!;
  return { band: match.band, label: match.label };
}

/**
 * Portuguese grading, done the Portuguese way: the raw score is scaled linearly onto 0-20 (an exam
 * worth 200 points divided by 10 is literally how it's marked), and 10 is the pass mark — which is
 * also why "half the paper right" lands exactly on a pass rather than on a fail.
 */
export function gradeTest(points: number, total: number): TestGrade {
  const safeTotal = total || 1;
  const grade = Math.round((points / safeTotal) * 20 * 10) / 10;
  const finalGrade = Math.round(grade);
  const band = bandForGrade(grade);
  return {
    grade,
    finalGrade,
    band: band.band,
    bandLabel: band.label,
    passed: finalGrade >= 10,
    points,
    total: safeTotal,
    accuracy: Math.round((points / safeTotal) * 100),
  };
}
