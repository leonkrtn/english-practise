import type { Word } from "./vocab";
import type { GrammarRule } from "./grammar-data";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lenient stem match so inflected forms count (e.g. "travel" -> "traveled", "traveling"). */
export function textUsesWord(text: string, word: Word): boolean {
  const stem = word.en.length > 4 ? word.en.slice(0, -1) : word.en;
  return new RegExp("\\b" + escapeRegex(stem), "i").test(text);
}

/** Category-level marker words as a fallback net when the rule's own gap-answer word doesn't
 * literally appear (e.g. the writer paraphrased the construct slightly differently). */
const CATEGORY_MARKERS: Record<string, string[]> = {
  Zeiten: ["have", "has", "had", "used to", "going to", "will"],
  Konditionalsätze: ["if"],
  Passiv: ["is", "are", "was", "were", "been", "be"],
  "Reported Speech": ["said", "told", "asked"],
  Relativsätze: ["who", "which", "that"],
  Modalverben: ["must", "should", "can't", "cannot", "might", "could", "have to"],
  Verbmuster: ["to", "ing"],
  Wortstellung: [],
  "Artikel & Nomen": ["a ", "an ", "the ", "much", "many"],
  Präpositionen: ["at", "on", "in"],
  Vergleiche: ["than", "more", "most", "er "],
};

/**
 * Best-effort, approximate detector for whether a piece of free text plausibly uses a given
 * grammar construct. There is no reliable way to verify actual grammatical usage without an
 * LLM, so this is intentionally a soft signal (shown in the UI as "erkannt" / "nicht erkannt,
 * bitte prüfen"), not a hard pass/fail gate — unlike the required-word check, which is exact.
 */
export function textLikelyUsesGrammar(text: string, rule: GrammarRule): boolean {
  const lower = text.toLowerCase();
  const hasAnswerMarker = rule.gap.some((g) => {
    const marker = g.answer.toLowerCase();
    return marker.length > 2 && lower.includes(marker);
  });
  if (hasAnswerMarker) return true;
  const fallback = CATEGORY_MARKERS[rule.category] || [];
  return fallback.some((m) => new RegExp("\\b" + escapeRegex(m.trim()), "i").test(text));
}
