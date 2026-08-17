import { ALGEBRA_RULES } from "./algebra";
import { LIMITS_RULES } from "./limits";
import { DIFFERENTIATION_RULES } from "./differentiation";
import { CURVE_SKETCHING_RULES } from "./curve-sketching";
import { INTEGRATION_RULES } from "./integration";
import { MULTIVARIABLE_RULES } from "./multivariable";
import { LINEAR_ALGEBRA_RULES } from "./linear-algebra";
import { STATISTICS_RULES } from "./statistics";
import { FINANCIAL_MATH_RULES } from "./financial-math";
import type { MathDifficulty, MathRule, MathTopic } from "./types";

export * from "./types";

/** Display order — roughly the order you would learn them, foundations first. */
export const MATH_TOPIC_ORDER: MathTopic[] = [
  "algebra",
  "limits",
  "differentiation",
  "curve-sketching",
  "integration",
  "multivariable",
  "linear-algebra",
  "statistics",
  "financial-math",
];

export interface MathTopicMeta {
  label: string;
  blurb: string;
  /** Tailwind gradient pair, matching the palette the rest of the app uses. */
  grad: string;
  tint: string;
}

export const MATH_TOPIC_META: Record<MathTopic, MathTopicMeta> = {
  algebra: {
    label: "Algebra Foundations",
    blurb: "Powers, roots, logarithms, quadratics, fractions",
    grad: "from-blue to-blue-dark",
    tint: "bg-blue-light text-blue",
  },
  limits: {
    label: "Limits & Continuity",
    blurb: "Indeterminate forms, L'Hôpital, behaviour at infinity",
    grad: "from-purple to-purple-dark",
    tint: "bg-purple-light text-purple",
  },
  differentiation: {
    label: "Differentiation",
    blurb: "Every derivative rule, marginal analysis, elasticity",
    grad: "from-green to-green-dark",
    tint: "bg-green-light text-green",
  },
  "curve-sketching": {
    label: "Curve Sketching",
    blurb: "Monotonicity, extrema, inflection points, asymptotes",
    grad: "from-amber to-amber-dark",
    tint: "bg-amber-light text-amber",
  },
  integration: {
    label: "Integration",
    blurb: "Antiderivatives, substitution, by parts, areas",
    grad: "from-red to-red-dark",
    tint: "bg-red-light text-red",
  },
  multivariable: {
    label: "Multivariable Calculus",
    blurb: "Partial derivatives, Hessian, Lagrange multipliers",
    grad: "from-purple to-blue",
    tint: "bg-purple-light text-purple",
  },
  "linear-algebra": {
    label: "Linear Algebra",
    blurb: "Matrices, determinants, inverses, eigenvalues",
    grad: "from-blue to-purple",
    tint: "bg-blue-light text-blue",
  },
  statistics: {
    label: "Statistics & Probability",
    blurb: "Variance, expectation, correlation, regression",
    grad: "from-green to-blue",
    tint: "bg-green-light text-green",
  },
  "financial-math": {
    label: "Financial Mathematics",
    blurb: "Compounding, NPV, annuities, IRR, effective rates",
    grad: "from-amber to-red",
    tint: "bg-amber-light text-amber",
  },
};

export const MATH_DIFFICULTY_LABEL: Record<MathDifficulty, string> = {
  foundation: "Foundation",
  core: "Core",
  advanced: "Advanced",
};

export const MATH_DIFFICULTY_ORDER: MathDifficulty[] = ["foundation", "core", "advanced"];

export const MATH_RULES: MathRule[] = [
  ...ALGEBRA_RULES,
  ...LIMITS_RULES,
  ...DIFFERENTIATION_RULES,
  ...CURVE_SKETCHING_RULES,
  ...INTEGRATION_RULES,
  ...MULTIVARIABLE_RULES,
  ...LINEAR_ALGEBRA_RULES,
  ...STATISTICS_RULES,
  ...FINANCIAL_MATH_RULES,
];

export const MATH_RULES_BY_ID: Record<string, MathRule> = {};
MATH_RULES.forEach((r) => (MATH_RULES_BY_ID[r.id] = r));

export function rulesForTopic(topic: MathTopic): MathRule[] {
  return MATH_RULES.filter((r) => r.topic === topic);
}

/** Topics that actually carry content, in display order — the list every screen iterates. */
export const MATH_TOPICS: MathTopic[] = MATH_TOPIC_ORDER.filter((t) => MATH_RULES.some((r) => r.topic === t));
