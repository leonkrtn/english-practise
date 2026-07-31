import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { VOCAB, type Word } from "./vocab";

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
function normalizeTight(s: string): string {
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

export type AnswerResult = "correct" | "almost" | "incorrect";
export type ErrorType = "empty" | "spelling" | "confused" | "wrong" | "skipped" | "unnatural" | "word order" | null;

/**
 * Reverse index over every surface form in the catalogue, built once on first use. Replaces a scan
 * of all ~2,300 words that re-normalised each of their German glosses on every wrong answer — that
 * scan measured ~5 ms per check, landing exactly when the feedback panel should appear.
 *
 * Both maps keep one entry per *word* rather than collapsing by key, because homographs (spread,
 * limit, constant) legitimately appear twice with different meanings.
 */
let formIndex: {
  /** normalised German gloss → the lowercase English words carrying it */
  deToEn: Map<string, string[]>;
  /** lowercase English word → each carrying word's normalised German glosses */
  enToDe: Map<string, string[][]>;
} | null = null;

function getFormIndex() {
  if (!formIndex) {
    const deToEn = new Map<string, string[]>();
    const enToDe = new Map<string, string[][]>();
    for (const w of VOCAB) {
      const enLower = w.en.toLowerCase();
      const deNorm = w.de.map(normalize);
      for (const d of deNorm) {
        const bucket = deToEn.get(d);
        if (bucket) bucket.push(enLower);
        else deToEn.set(d, [enLower]);
      }
      const enBucket = enToDe.get(enLower);
      if (enBucket) enBucket.push(deNorm);
      else enToDe.set(enLower, [deNorm]);
    }
    formIndex = { deToEn, enToDe };
  }
  return formIndex;
}

export function classifyAnswer(userRaw: string, accepted: string[]): { result: AnswerResult; errorType: ErrorType } {
  const user = normalize(userRaw);
  if (!user) return { result: "incorrect", errorType: "empty" };
  const acceptedNorm = accepted.map(normalize);
  if (acceptedNorm.includes(user)) return { result: "correct", errorType: null };
  // Second chance for hyphenated terms: "earn out" and "earn-out" both collapse to "earnout".
  const userTight = normalizeTight(userRaw);
  if (acceptedNorm.some((a) => a.replace(/ /g, "") === userTight)) return { result: "correct", errorType: null };

  let minDist = Infinity;
  acceptedNorm.forEach((a) => {
    const d = levenshtein(user, a);
    if (d < minDist) minDist = d;
  });
  const threshold = Math.max(1, Math.round(Math.max(...acceptedNorm.map((a) => a.length)) * 0.22));
  if (minDist > 0 && minDist <= threshold) {
    return { result: "almost", errorType: "spelling" };
  }

  // "Confused with another word": the answer is a real entry from the catalogue, just not this one —
  // either the German side of some other word, or an English word that isn't among the accepted ones.
  const { deToEn, enToDe } = getFormIndex();
  const isOtherGerman = (deToEn.get(user) ?? []).some((enLower) => enLower !== user);
  const isOtherEnglish =
    !accepted.some((a) => a.toLowerCase() === user) && (enToDe.get(user) ?? []).some((glosses) => !glosses.includes(user));
  if (isOtherGerman || isOtherEnglish) return { result: "incorrect", errorType: "confused" };
  return { result: "incorrect", errorType: "wrong" };
}

/**
 * Irregular English forms the suffix rules below can't reach, because the stem itself changes.
 * A closed set — only the verbs that actually appear inflected in an example sentence need an entry.
 */
const IRREGULAR_FORMS: Record<string, string[]> = {
  arise: ["arose", "arisen"],
  break: ["broke", "broken"],
  bring: ["brought"],
  build: ["built"],
  buy: ["bought"],
  catch: ["caught"],
  come: ["came"],
  creep: ["crept"],
  deal: ["dealt"],
  draw: ["drew", "drawn"],
  fall: ["fell", "fallen"],
  find: ["found"],
  forgive: ["forgave", "forgiven"],
  foresee: ["foresaw", "foreseen"],
  give: ["gave", "given"],
  hang: ["hung"],
  hold: ["held"],
  keep: ["kept"],
  kneel: ["knelt"],
  leave: ["left"],
  lose: ["lost"],
  mislead: ["misled"],
  overcome: ["overcame"],
  overtake: ["overtook", "overtaken"],
  rebuild: ["rebuilt"],
  rise: ["rose", "risen"],
  seek: ["sought"],
  sell: ["sold"],
  shrink: ["shrank", "shrunk", "shrunken"],
  speed: ["sped"],
  stand: ["stood"],
  take: ["took", "taken"],
  teach: ["taught"],
  tear: ["tore", "torn"],
  undergo: ["underwent", "undergone"],
  undertake: ["undertook", "undertaken"],
  underwrite: ["underwrote", "underwritten"],
  uphold: ["upheld"],
  wind: ["wound"],
  withdraw: ["withdrew", "withdrawn"],
  write: ["wrote", "written"],
};

/** How many words may sit between the parts of a phrasal verb before the match is rejected —
 * enough for "cheered *her* up" or "Hold *volume* constant", not enough to link unrelated clauses. */
const MAX_PARTICLE_GAP = 2;

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
}

/**
 * Whether `token` as it appears in a sentence is an inflected form of `lemma`.
 *
 * Example sentences are written in natural English, so the word being taught usually shows up
 * conjugated ("arise" → "arose", "apply" → "applied", "build up" → "built up"). A plain prefix
 * match misses all of those, which used to silently drop the gap exercise for 102 words.
 */
function inflectionMatches(lemma: string, token: string): boolean {
  const l = lemma.toLowerCase();
  const t = token.toLowerCase().replace(/[^a-z'-]/g, "");
  if (!t) return false;
  if (t === l) return true;
  // Inflection only ever appends a short ending; anything longer is a different word.
  if (t.length > l.length + 4) return false;
  if (t.startsWith(l)) return true;
  // chase → chasing, flee → fled
  if (l.endsWith("e") && l.length > 3 && t.startsWith(l.slice(0, -1))) return true;
  // apply → applied, synergy → synergies, levy → levies
  if (l.endsWith("y") && t.startsWith(l.slice(0, -1) + "i")) return true;
  if ((IRREGULAR_FORMS[l] ?? []).includes(t)) return true;
  // Same stem, different ending: implied → implies. Deliberately strict (at least four shared
  // characters, and nearly the whole lemma) so "deny" doesn't match "denim".
  return commonPrefixLength(l, t) >= Math.max(4, l.length - 3) && t.length <= l.length + 3;
}

/**
 * Locates the taught word inside its own example sentence, tolerating inflection and multi-word
 * entries whose parts are conjugated separately ("build up" → "built up"). Returns the exact
 * surface text so the caller can blank it out or bold it verbatim.
 */
export function findGap(sentence: string, word: Word): { matched: string; index: number } | null {
  const exact = sentence.match(new RegExp("\\b" + escapeRegExp(word.en) + "\\w*", "i"));
  if (exact && exact.index !== undefined) return { matched: exact[0], index: exact.index };

  const parts = word.en.trim().split(/\s+/);
  // Tokenise on whitespace *and* hyphens, keeping each token's offset, so a compound written with a
  // hyphen in the sentence ("top-line growth") still matches a two-word entry ("top line") and can
  // be sliced back out of the original string with its real casing.
  const tokens: { text: string; index: number }[] = [];
  const tokenRe = /[^\s-]+/g;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(sentence)) !== null) tokens.push({ text: m[0], index: m.index });

  for (let start = 0; start < tokens.length; start++) {
    if (!inflectionMatches(parts[0], tokens[start].text)) continue;

    // Phrasal verbs take an object between verb and particle ("cheered her up"), so later parts may
    // sit a word or two further along rather than immediately after.
    let cursor = start + 1;
    let skipped = 0;
    let ok = true;
    for (let p = 1; p < parts.length; p++) {
      let found = -1;
      for (let k = cursor; k < tokens.length && skipped + (k - cursor) <= MAX_PARTICLE_GAP; k++) {
        if (inflectionMatches(parts[p], tokens[k].text)) {
          found = k;
          break;
        }
      }
      if (found === -1) {
        ok = false;
        break;
      }
      skipped += found - cursor;
      cursor = found + 1;
    }
    if (!ok) continue;

    const first = tokens[start];
    const last = tokens[cursor - 1];
    // Trailing sentence punctuation belongs to the sentence, not to the word.
    const matched = sentence.slice(first.index, last.index + last.text.length).replace(/[.,!?;:]+$/, "");
    if (matched) return { matched, index: first.index };
  }
  return null;
}
