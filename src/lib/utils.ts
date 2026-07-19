import { VOCAB, type Word } from "./vocab";

export function normalize(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[.,!?;:'"()\-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  a = a || "";
  b = b || "";
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type AnswerResult = "correct" | "almost" | "incorrect";
export type ErrorType = "empty" | "spelling" | "confused" | "wrong" | "skipped" | "unnatural" | "word order" | null;

export function classifyAnswer(userRaw: string, accepted: string[]): { result: AnswerResult; errorType: ErrorType } {
  const user = normalize(userRaw);
  if (!user) return { result: "incorrect", errorType: "empty" };
  const acceptedNorm = accepted.map(normalize);
  if (acceptedNorm.includes(user)) return { result: "correct", errorType: null };

  let minDist = Infinity;
  acceptedNorm.forEach((a) => {
    const d = levenshtein(user, a);
    if (d < minDist) minDist = d;
  });
  const threshold = Math.max(1, Math.round(Math.max(...acceptedNorm.map((a) => a.length)) * 0.22));
  if (minDist > 0 && minDist <= threshold) {
    return { result: "almost", errorType: "spelling" };
  }

  const hitOther = VOCAB.some((w) => {
    return (
      (w.en.toLowerCase() !== user && w.de.some((d) => normalize(d) === user)) ||
      (w.de.every((d) => normalize(d) !== user) &&
        w.en.toLowerCase() === user &&
        !accepted.map((a) => a.toLowerCase()).includes(user))
    );
  });
  if (hitOther) return { result: "incorrect", errorType: "confused" };
  return { result: "incorrect", errorType: "wrong" };
}

export function findGap(sentence: string, word: Word): { matched: string; index: number } | null {
  const re = new RegExp("\\b" + escapeRegExp(word.en) + "\\w*", "i");
  const m = sentence.match(re);
  if (!m || m.index === undefined) return null;
  return { matched: m[0], index: m.index };
}
