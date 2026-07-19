import { VOCAB, CONFUSABLE_PAIRS, type Word } from "./vocab";
import { choice, sample } from "./utils";
import type { WordState, Direction, ExerciseFormat, SelectionMode } from "./types";

export type WordStateGetter = (id: string) => WordState;

export interface QueueItem {
  format: Exclude<ExerciseFormat, "mixed">;
  words: Word[];
  direction: "en-de" | "de-en";
}

export function buildPool(mode: SelectionMode, getState: WordStateGetter): Word[] {
  let pool: Word[];
  switch (mode) {
    case "new":
      pool = VOCAB.filter((w) => getState(w.id).timesSeen === 0);
      break;
    case "difficult":
      pool = VOCAB.filter((w) => {
        const s = getState(w.id);
        return s.timesSeen > 0 && s.score <= 2.5;
      });
      break;
    case "mistakes":
      pool = VOCAB.filter((w) => getState(w.id).recentMistake);
      break;
    case "favorites":
      pool = VOCAB.filter((w) => getState(w.id).favorite);
      break;
    default:
      pool = VOCAB.slice();
  }
  if (pool.length < 6) pool = VOCAB.slice();
  return pool;
}

function weightFor(word: Word, getState: WordStateGetter): number {
  const s = getState(word.id);
  return 1 / (s.score + 0.6);
}

function pickWords(pool: Word[], count: number, exclude: string[], getState: WordStateGetter): Word[] {
  const avail = pool.filter((w) => !exclude.includes(w.id));
  const base = avail.length >= count ? avail : pool;
  const weighted = base.map((w) => ({ w, key: Math.random() * weightFor(w, getState) }));
  weighted.sort((a, b) => b.key - a.key);
  const picked = weighted.slice(0, count).map((x) => x.w);
  if (picked.length < count) {
    const more = sample(
      pool.filter((w) => !picked.includes(w)),
      count - picked.length
    );
    return picked.concat(more);
  }
  return picked;
}

const FORMAT_WEIGHTS: Record<string, number> = {
  translate: 26,
  gap: 15,
  mc: 18,
  sentence: 14,
  build: 10,
  multigap: 6,
  match: 6,
  confusable: 5,
};

function pickFormat(): string {
  const entries = Object.entries(FORMAT_WEIGHTS);
  const total = entries.reduce((s, e) => s + e[1], 0);
  let r = Math.random() * total;
  for (const [k, v] of entries) {
    if (r < v) return k;
    r -= v;
  }
  return "translate";
}

export function pickDirection(direction: Direction): "en-de" | "de-en" {
  if (direction === "mixed") return Math.random() < 0.5 ? "en-de" : "de-en";
  return direction;
}

export function buildQueue(
  pool: Word[],
  format: ExerciseFormat,
  direction: Direction,
  target: number,
  getState: WordStateGetter
): QueueItem[] {
  const queue: QueueItem[] = [];
  let wordsUsed = 0;
  let guard = 0;
  let lastWordId: string | null = null;

  while (wordsUsed < target && guard < target * 4) {
    guard++;
    let fmt = format === "mixed" ? pickFormat() : format;
    if (fmt === "confusable" && CONFUSABLE_PAIRS.length === 0) fmt = "translate";

    if (fmt === "confusable") {
      const pair = choice(CONFUSABLE_PAIRS);
      queue.push({ format: "confusable", words: pair, direction: pickDirection(direction) });
      wordsUsed += 1;
      continue;
    }

    const needed = fmt === "match" ? Math.min(6, Math.max(4, Math.floor(target / 3))) : fmt === "multigap" ? 2 : 1;
    const excl = lastWordId ? [lastWordId] : [];
    const words = pickWords(pool, needed, excl, getState);
    if (words.length === 0) break;
    lastWordId = words[words.length - 1].id;
    queue.push({ format: fmt as QueueItem["format"], words, direction: pickDirection(direction) });
    wordsUsed += words.length;
  }
  return queue;
}
