import { V1, V2, V3, V4, V5, A1, A2, A3, A4, A5, type RawEntry } from "./vocab-raw";

export type WordType = "verb" | "adjective";

export interface Word {
  id: string;
  en: string;
  de: string[];
  type: WordType;
  enSentence: string;
  deSentence: string;
  collocations: string[];
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

const RAW_VERBS = ([] as RawEntry[]).concat(V1, V2, V3, V4, V5);
const RAW_ADJ = ([] as RawEntry[]).concat(A1, A2, A3, A4, A5);

export const VOCAB: Word[] = [
  ...buildFrom(RAW_VERBS, "v", "verb"),
  ...buildFrom(RAW_ADJ, "a", "adjective"),
];

export const VOCAB_BY_ID: Record<string, Word> = {};
VOCAB.forEach((w) => (VOCAB_BY_ID[w.id] = w));

export const VOCAB_BY_EN: Record<string, Word> = {};
VOCAB.forEach((w) => {
  const key = w.en.toLowerCase();
  if (!VOCAB_BY_EN[key]) VOCAB_BY_EN[key] = w;
});

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
