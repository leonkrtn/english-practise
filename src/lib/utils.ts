import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class lists, letting a later conflicting utility (e.g. a caller-supplied
 * rounded-full) win over an earlier one — used by every shadcn/ui component. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

/**
 * normalize() with spaces removed too. Hyphenated terms lose their hyphen ("earn-out" → "earnout")
 * while the same term typed with a space keeps it ("earn out" → "earn out"), so the two forms only
 * line up once whitespace goes as well. Used purely for the equality check — the levenshtein
 * distance below still runs on the spaced form, so genuine typos are graded as before.
 */
export function normalizeTight(s: string): string {
  return normalize(s).replace(/ /g, "");
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
