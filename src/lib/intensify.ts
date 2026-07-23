import type { WordState } from "./types";

/**
 * A word "needs intensification" when hints are relied on disproportionately often relative to
 * how many times it's actually been attempted — a signal the existing difficulty score can miss,
 * since a hint-assisted correct answer still counts as correct (just at reduced score credit, see
 * store.updateWord). Two words can end up with the same score while one of them only ever gets
 * there with help — that's the one that actually needs more practice.
 */
export const INTENSIFY_MIN_ATTEMPTS = 2;
export const INTENSIFY_HINT_RATIO = 0.5;

export function hintRatio(state: WordState): number {
  return state.timesSeen > 0 ? state.hintsUsed / state.timesSeen : 0;
}

export function needsIntensification(state: WordState): boolean {
  return state.timesSeen >= INTENSIFY_MIN_ATTEMPTS && hintRatio(state) >= INTENSIFY_HINT_RATIO;
}
