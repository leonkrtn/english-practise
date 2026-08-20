import { DEPRECIATION_RULES } from "./depreciation";
import {
  DIFFERENTIATION_FORMULA_RULES,
  FINANCE_FORMULA_RULES,
  INTEGRATION_FORMULA_RULES,
  STATISTICS_FORMULA_RULES,
} from "./formulaSets";
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
 * The rule sets shipped with the app. Adding another — revenue recognition, lease accounting, a
 * national GAAP's tax rules — is one content file plus one entry here; nothing in the engine or the
 * UI needs to change.
 *
 * The four formula sets are projections of the Mathematics content and share its progress: their
 * rules carry the math rule's id, so a formula learned in either mode counts in both.
 */
export const BUILTIN_SET_META: Record<string, MemoSetMeta> = {
  depreciation: {
    label: "Depreciation",
    blurb: "Methods, recognition, estimates, disposal",
    grad: "from-amber to-amber-dark",
    tint: "bg-amber-light text-amber",
    ring: ["#e8a12e", "#c9860f"],
  },
  "differentiation-formulas": {
    label: "Differentiation Formulas",
    blurb: "The derivative sheet, verbatim",
    grad: "from-green to-green-dark",
    tint: "bg-green-light text-green",
    ring: ["#1eb676", "#0e9464"],
  },
  "integration-formulas": {
    label: "Integration Formulas",
    blurb: "Antiderivatives and the techniques",
    grad: "from-red to-red-dark",
    tint: "bg-red-light text-red",
    ring: ["#e8483a", "#c23325"],
  },
  "finance-formulas": {
    label: "Finance Formulas",
    blurb: "Compounding, annuities, NPV, perpetuities",
    grad: "from-blue to-blue-dark",
    tint: "bg-blue-light text-blue",
    ring: ["#0071e3", "#0058b8"],
  },
  "statistics-formulas": {
    label: "Statistics Formulas",
    blurb: "Spread, expectation, correlation, regression",
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
    ring: ["#8b5cf6", "#6d3fd4"],
  },
};

/** Look of a learner's own set — one identity for all of them, so they read as a family. */
export const CUSTOM_SET_META: Omit<MemoSetMeta, "label"> = {
  blurb: "Your own cards",
  grad: "from-blue to-purple",
  tint: "bg-blue-light text-blue",
  ring: ["#0071e3", "#8b5cf6"],
};

export const BUILTIN_SET_ORDER: MemoSetId[] = [
  "depreciation",
  "differentiation-formulas",
  "integration-formulas",
  "finance-formulas",
  "statistics-formulas",
];

export const BUILTIN_MEMO_RULES: MemoRule[] = [
  ...DEPRECIATION_RULES,
  ...DIFFERENTIATION_FORMULA_RULES,
  ...INTEGRATION_FORMULA_RULES,
  ...FINANCE_FORMULA_RULES,
  ...STATISTICS_FORMULA_RULES,
];

/* ------------------------------------------------------------ the live registry ---- */

/**
 * A learner's own sets arrive from the database after sign-in, so the pool cannot be a module
 * constant. The store pushes them in here once loaded; everything else reads through the accessors
 * below. Components must not memoise on the registry alone — they take `store.customMemoVersion`
 * as a dependency so a change re-renders them.
 */
export interface CustomMemoSet {
  id: string;
  label: string;
}

let customSets: CustomMemoSet[] = [];
let customRules: MemoRule[] = [];
let allRules: MemoRule[] = BUILTIN_MEMO_RULES;
let byId: Record<string, MemoRule> = {};
const rebuildIndex = () => {
  allRules = customRules.length > 0 ? [...BUILTIN_MEMO_RULES, ...customRules] : BUILTIN_MEMO_RULES;
  byId = {};
  allRules.forEach((r) => (byId[r.id] = r));
};
rebuildIndex();

export function setCustomMemoContent(sets: CustomMemoSet[], rules: MemoRule[]): void {
  customSets = sets;
  customRules = rules;
  rebuildIndex();
}

export function memoRules(): MemoRule[] {
  return allRules;
}

export function memoRuleById(id: string): MemoRule | undefined {
  return byId[id];
}

export function memoRulesForSet(setId: MemoSetId): MemoRule[] {
  return allRules.filter((r) => r.setId === setId);
}

export function customMemoSets(): CustomMemoSet[] {
  return customSets;
}

/** Built-in look, or the shared custom look carrying that set's own name. */
export function memoSetMeta(setId: MemoSetId): MemoSetMeta {
  const builtin = BUILTIN_SET_META[setId];
  if (builtin) return builtin;
  const own = customSets.find((s) => s.id === setId);
  return { ...CUSTOM_SET_META, label: own?.label ?? "My set" };
}

/** Sets that actually carry content, built-in first, then the learner's own. */
export function memoSets(): MemoSetId[] {
  const builtin = BUILTIN_SET_ORDER.filter((s) => allRules.some((r) => r.setId === s));
  return [...builtin, ...customSets.map((s) => s.id)];
}
