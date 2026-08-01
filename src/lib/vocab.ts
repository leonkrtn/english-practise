import { V1, V2, V3, V4, V5, A1, A2, A3, A4, A5, type RawEntry } from "./vocab-raw";
import {
  FIN_ACCOUNTING,
  FIN_VALUATION,
  FIN_DEALS,
  FIN_CAPITAL,
  FIN_MARKETS,
  MATH_OPERATIONS,
  MATH_ALGEBRA,
  MATH_STATS,
  MATH_DESCRIBING,
  type DomainEntry,
} from "./domain-vocab-raw";

export type WordType = "verb" | "adjective" | "noun" | "term";

export const WORD_TYPE_LABEL: Record<WordType, string> = {
  verb: "Verb",
  adjective: "Adjective",
  noun: "Noun",
  term: "Term",
};

/** Compact form for the fixed-width chip in the word list. */
export const WORD_TYPE_SHORT: Record<WordType, string> = {
  verb: "V",
  adjective: "ADJ",
  noun: "N",
  term: "TRM",
};

/** Which specialist track a word belongs to. Undefined means the general vocabulary — the bulk of
 * VOCAB — which every mode may draw from. */
export type WordCategory = "finance" | "math";

export interface Word {
  id: string;
  en: string;
  de: string[];
  type: WordType;
  enSentence: string;
  deSentence: string;
  collocations: string[];
  category?: WordCategory;
  /**
   * English gloss used as the prompt instead of the German translation. Only set for jargon whose
   * German "equivalent" is either the same English word (EBITDA, carry) or too loose to grade a
   * typed answer against — see the definition-driven branch in TranslateExercise / McExercise.
   */
  definition?: string;
}

function buildFrom(raw: RawEntry[], prefix: string, type: WordType): Word[] {
  return raw.map((e, i) => ({
    id: prefix + (i + 1),
    en: e[0],
    de: e[1].split("|").map((s) => s.trim()),
    type,
    enSentence: e[2],
    deSentence: e[3],
    collocations: e[4] ? e[4].split("|").map((s) => s.trim()) : [],
  }));
}

function buildDomainFrom(raw: DomainEntry[], prefix: string, category: WordCategory): Word[] {
  return raw.map((e, i) => ({
    id: prefix + (i + 1),
    en: e[0],
    de: e[1].split("|").map((s) => s.trim()),
    type: e[5],
    enSentence: e[2],
    deSentence: e[3],
    collocations: e[4] ? e[4].split("|").map((s) => s.trim()) : [],
    category,
    ...(e[6] ? { definition: e[6] } : {}),
  }));
}

const RAW_VERBS = ([] as RawEntry[]).concat(V1, V2, V3, V4, V5);
const RAW_ADJ = ([] as RawEntry[]).concat(A1, A2, A3, A4, A5);
const RAW_FINANCE = ([] as DomainEntry[]).concat(FIN_ACCOUNTING, FIN_VALUATION, FIN_DEALS, FIN_CAPITAL, FIN_MARKETS);
const RAW_MATH = ([] as DomainEntry[]).concat(MATH_OPERATIONS, MATH_ALGEBRA, MATH_STATS, MATH_DESCRIBING);

export const VOCAB: Word[] = [
  ...buildFrom(RAW_VERBS, "v", "verb"),
  ...buildFrom(RAW_ADJ, "a", "adjective"),
  ...buildDomainFrom(RAW_FINANCE, "f", "finance"),
  ...buildDomainFrom(RAW_MATH, "m", "math"),
];

export const VOCAB_BY_ID: Record<string, Word> = {};
VOCAB.forEach((w) => (VOCAB_BY_ID[w.id] = w));

export const VOCAB_BY_EN: Record<string, Word> = {};
VOCAB.forEach((w) => {
  const key = w.en.toLowerCase();
  if (!VOCAB_BY_EN[key]) VOCAB_BY_EN[key] = w;
});

/** Finance/math terms skip "Schreiben" — the exercise kind that asks the learner to write their own
 * free sentence with the word. A term like EBITDA or a mathematical fixed expression isn't
 * naturally used in improvised prose the way a general verb or adjective is, so that drill would
 * ask the learner to invent English around a term rather than drill the term itself. */
export function allowsSentenceExercises(word: Word): boolean {
  return word.category === undefined;
}

/** Whether a word belongs in the general Vocabulary track. Math terms only surface through the
 * Finance mode's math scope — mixing "median" or "quotient" into ordinary verb/adjective practice
 * doesn't read as vocabulary in the same way. Finance terms are common enough in everyday business
 * English that they stay mixed into the regular vocabulary session too. */
export function inGeneralVocab(word: Word): boolean {
  return word.category !== "math";
}

/**
 * Whether a stored progress row counts towards the Vocabulary track's "x of y words" readouts.
 *
 * The single definition every screen must agree on: Home, the statistics screen and the 5-week
 * goal's baseline each used to filter differently, so the same account showed three different
 * "words learned" numbers. Rejects rows whose word no longer exists, words the learner excluded,
 * and math terms — none of which the Vocabulary session can ever draw.
 */
export function countsTowardVocab(wordId: string, blockedWordIds: ReadonlySet<string>): boolean {
  const word = VOCAB_BY_ID[wordId];
  return !!word && !blockedWordIds.has(wordId) && inGeneralVocab(word);
}

/** How many words the Vocabulary track can draw from at all — the denominator for those readouts. */
export function generalVocabTotal(blockedWordIds: ReadonlySet<string>): number {
  return VOCAB.reduce((n, w) => (inGeneralVocab(w) && !blockedWordIds.has(w.id) ? n + 1 : n), 0);
}

/** VOCAB minus any words the learner has permanently excluded — mirrors activeGrammarRules(). */
export function activeVocab(blockedWordIds: ReadonlySet<string> = new Set()): Word[] {
  return blockedWordIds.size === 0 ? VOCAB : VOCAB.filter((w) => !blockedWordIds.has(w.id));
}

/** Which slice of the specialist vocabulary a Finance-mode session draws from. */
export type DomainScope = "finance" | "math" | "both";

/** Predicate form of a DomainScope, for filtering a word pool down to that slice. General
 * vocabulary is always excluded — that is the whole point of the mode. */
export function inDomainScope(scope: DomainScope): (word: Word) => boolean {
  if (scope === "both") return (w) => w.category !== undefined;
  return (w) => w.category === scope;
}

/**
 * The German side to show wherever a word is paired against its translation. Specialist terms are
 * often used untranslated in German too (Tranche, EBITDA), so `de[0]` can literally repeat the
 * English word — which would turn a matching round into a free point. Prefers the first gloss that
 * actually differs, and falls back to the English definition if none does.
 */
export function germanGloss(word: Word): string {
  const distinct = word.de.find((d) => d.toLowerCase() !== word.en.toLowerCase());
  return distinct ?? word.definition ?? word.de[0];
}

const CONFUSABLE_RAW: [string, string][] = [
  ["raise", "rise"],
  ["affect", "effect"],
  ["economic", "economical"],
  ["efficient", "effective"],
  ["sensible", "sensitive"],
  ["actual", "current"],
  ["comprehensive", "comprehensible"],
  ["imply", "infer"],
  ["ensure", "assure"],
  ["convince", "persuade"],
];

export const CONFUSABLE_PAIRS: [Word, Word][] = CONFUSABLE_RAW
  .map(([a, b]) => [VOCAB_BY_EN[a], VOCAB_BY_EN[b]] as [Word, Word])
  .filter((p) => p[0] && p[1]);
