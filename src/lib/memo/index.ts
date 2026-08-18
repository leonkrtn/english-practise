import { DEPRECIATION_RULES } from "./depreciation";
import type { MemoRule, MemoSetId } from "./types";

export * from "./types";

export interface MemoSetMeta {
  label: string;
  blurb: string;
  grad: string;
  tint: string;
  ring: [string, string];
}

/**
 * The rule sets available in the Rules mode. Adding another — revenue recognition, lease
 * accounting, a national GAAP's tax rules — is one content file plus one entry here; nothing in the
 * engine or the UI needs to change.
 */
export const MEMO_SET_META: Record<MemoSetId, MemoSetMeta> = {
  depreciation: {
    label: "Depreciation",
    blurb: "Methods, recognition, estimates, disposal",
    grad: "from-amber to-amber-dark",
    tint: "bg-amber-light text-amber",
    ring: ["#e8a12e", "#c9860f"],
  },
};

export const MEMO_SET_ORDER: MemoSetId[] = ["depreciation"];

export const MEMO_RULES: MemoRule[] = [...DEPRECIATION_RULES];

export const MEMO_RULES_BY_ID: Record<string, MemoRule> = {};
MEMO_RULES.forEach((r) => (MEMO_RULES_BY_ID[r.id] = r));

export function memoRulesForSet(setId: MemoSetId): MemoRule[] {
  return MEMO_RULES.filter((r) => r.setId === setId);
}

/** Sets that actually carry content, in display order. */
export const MEMO_SETS: MemoSetId[] = MEMO_SET_ORDER.filter((s) => MEMO_RULES.some((r) => r.setId === s));
