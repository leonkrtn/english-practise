// Content for the Mathematics mode: the calculus rules themselves (formulas), not English
// vocabulary about them — that's the existing "math" WordCategory in vocab.ts. Deliberately its
// own content module, structured by `topic` so a later addition (integration, limits) is a new
// topic value plus more MathRule entries, not a schema change.
//
// Typed answers use plain ASCII math syntax, not LaTeX: `^` for powers, explicit `*` for every
// multiplication (including between two letters — see mathAnswerCheck.ts for why), `/` for
// division, parentheses to group. `promptTex`/`formulaTex`/example fields are real LaTeX, rendered
// with Formula.tsx.

export type MathTopic = "differentiation";

export const MATH_TOPIC_LABEL: Record<MathTopic, string> = {
  differentiation: "Differentiation",
};

/** A worked example shown on the Learn card — not graded, just demonstrates the rule in use. */
export interface MathWorkedExample {
  problemTex: string;
  solutionTex: string;
}

/** One typed-answer practice question. `accepted` lists other correct forms besides `answer` —
 * e.g. a rule applied directly (3x^2/x^3) alongside its simplified form (3/x) — since Solve
 * problems ask for the rule's direct result and don't require the learner to also simplify it. */
export interface MathProblem {
  promptTex: string;
  answer: string;
  accepted?: string[];
}

export interface MathRule {
  id: string;
  topic: MathTopic;
  category: string;
  title: string;
  formulaTex: string;
  explanation: string;
  examples: MathWorkedExample[];
  solve: MathProblem[];
  simplify: MathProblem[];
}

export const MATH_RULES: MathRule[] = [
  {
    id: "mr1",
    topic: "differentiation",
    category: "Grundregeln",
    title: "Constant Rule",
    formulaTex: "(k)' = 0",
    explanation:
      "The derivative of a constant is always zero. A constant doesn't change as x changes, so its rate of change — the whole point of a derivative — is nothing.",
    examples: [
      { problemTex: "(5)'", solutionTex: "0" },
      { problemTex: "(-3)'", solutionTex: "0" },
    ],
    solve: [
      { promptTex: "f(x) = 7", answer: "0" },
      { promptTex: "f(x) = -12", answer: "0" },
    ],
    simplify: [],
  },
  {
    id: "mr2",
    topic: "differentiation",
    category: "Grundregeln",
    title: "Power Rule",
    formulaTex: "(x^k)' = kx^{k-1}",
    explanation: "Bring the exponent down as a multiplying factor, then reduce the exponent by one.",
    examples: [
      { problemTex: "(x^3)'", solutionTex: "3x^2" },
      { problemTex: "(x^5)'", solutionTex: "5x^4" },
    ],
    solve: [
      { promptTex: "f(x) = x^4", answer: "4*x^3" },
      { promptTex: "f(x) = x^7", answer: "7*x^6" },
    ],
    simplify: [{ promptTex: "2x^3 + 3x^3", answer: "5*x^3" }],
  },
  {
    id: "mr3",
    topic: "differentiation",
    category: "Grundregeln",
    title: "Constant Multiple Rule",
    formulaTex: "(kf)' = kf'",
    explanation: "A constant factor pulls straight through the derivative — differentiate what it's multiplying, then multiply by the constant again.",
    examples: [{ problemTex: "(5x^2)'", solutionTex: "5 \\cdot 2x = 10x" }],
    solve: [
      { promptTex: "f(x) = 6x^3", answer: "18*x^2" },
      { promptTex: "f(x) = -2x^5", answer: "-10*x^4" },
    ],
    simplify: [{ promptTex: "4 \\cdot 3x^2", answer: "12*x^2" }],
  },
  {
    id: "mr4",
    topic: "differentiation",
    category: "Grundregeln",
    title: "Sum / Difference Rule",
    formulaTex: "(f \\pm g)' = f' \\pm g'",
    explanation: "Differentiate a sum or difference term by term — each part doesn't affect the others.",
    examples: [{ problemTex: "(x^2 + x^3)'", solutionTex: "2x + 3x^2" }],
    solve: [
      { promptTex: "f(x) = x^3 + x^2", answer: "3*x^2+2*x", accepted: ["2*x+3*x^2"] },
      { promptTex: "f(x) = x^4 - x^2", answer: "4*x^3-2*x", accepted: ["-2*x+4*x^3"] },
    ],
    simplify: [{ promptTex: "(3x^2+2x) - (x^2+2x)", answer: "2*x^2" }],
  },
  {
    id: "mr5",
    topic: "differentiation",
    category: "Produkt & Quotient",
    title: "Product Rule",
    formulaTex: "(f \\times g)' = f' \\times g + f \\times g'",
    explanation: "Differentiate the first factor and keep the second, plus keep the first and differentiate the second.",
    examples: [{ problemTex: "(x \\cdot x^2)'", solutionTex: "1 \\cdot x^2 + x \\cdot 2x = 3x^2" }],
    solve: [
      { promptTex: "f(x) = x^2(x+1)", answer: "3*x^2+2*x", accepted: ["2*x+3*x^2"] },
      { promptTex: "f(x) = x(x^2+3)", answer: "3*x^2+3", accepted: ["3+3*x^2"] },
    ],
    simplify: [{ promptTex: "2x(x+1) + x^2 \\cdot 1", answer: "3*x^2+2*x" }],
  },
  {
    id: "mr6",
    topic: "differentiation",
    category: "Produkt & Quotient",
    title: "Quotient Rule",
    formulaTex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{f' \\times g - f \\times g'}{g^2}",
    explanation: "Numerator times bottom's derivative subtracted from bottom times numerator's derivative, all over the bottom squared.",
    examples: [{ problemTex: "\\left(\\dfrac{x^2}{x}\\right)'", solutionTex: "\\dfrac{2x \\cdot x - x^2 \\cdot 1}{x^2} = 1" }],
    solve: [
      { promptTex: "f(x) = \\dfrac{2x}{x+1}", answer: "2/(x+1)^2" },
      { promptTex: "f(x) = \\dfrac{x+3}{x}", answer: "-3/x^2" },
    ],
    simplify: [],
  },
  {
    id: "mr7",
    topic: "differentiation",
    category: "Kettenregel",
    title: "Generalized Power Rule",
    formulaTex: "(f^n)' = nf^{n-1}f'",
    explanation: "The power rule for a function raised to a power instead of just x — bring the exponent down, reduce it by one, then multiply by the inner function's own derivative.",
    examples: [{ problemTex: "\\left((x^2+1)^3\\right)'", solutionTex: "3(x^2+1)^2 \\cdot 2x = 6x(x^2+1)^2" }],
    solve: [
      { promptTex: "f(x) = (x+2)^4", answer: "4*(x+2)^3" },
      { promptTex: "f(x) = (x^2-1)^3", answer: "6*x*(x^2-1)^2" },
    ],
    simplify: [{ promptTex: "2(x+2)^3 + 2(x+2)^3", answer: "4*(x+2)^3" }],
  },
  {
    id: "mr8",
    topic: "differentiation",
    category: "Kettenregel",
    title: "Chain Rule",
    formulaTex: "[f(g(x))]' = f'(g(x)) \\times g'(x)",
    explanation: "For a function built from an outer function wrapped around an inner one, differentiate the outer function (leaving the inner one untouched inside it), then multiply by the inner function's own derivative.",
    examples: [{ problemTex: "\\left((2x+3)^5\\right)'", solutionTex: "5(2x+3)^4 \\cdot 2 = 10(2x+3)^4" }],
    solve: [
      { promptTex: "f(x) = (5x-2)^3", answer: "15*(5x-2)^2" },
      { promptTex: "f(x) = e^{4x}", answer: "4*e^(4x)" },
    ],
    simplify: [],
  },
  {
    id: "mr9",
    topic: "differentiation",
    category: "Exponential- & Logarithmusfunktionen",
    title: "Exponential Rule (base e)",
    formulaTex: "(e^f)' = f'e^f",
    explanation: "The exponential function eᶠ reproduces itself under differentiation — you just carry along the inner function's own derivative as a factor.",
    examples: [{ problemTex: "\\left(e^{x^2}\\right)'", solutionTex: "2x \\cdot e^{x^2}" }],
    solve: [
      { promptTex: "f(x) = e^{x^3}", answer: "3*x^2*e^(x^3)" },
      { promptTex: "f(x) = e^{3x}", answer: "3*e^(3x)" },
    ],
    simplify: [{ promptTex: "2e^{3x} + e^{3x}", answer: "3*e^(3x)" }],
  },
  {
    id: "mr10",
    topic: "differentiation",
    category: "Exponential- & Logarithmusfunktionen",
    title: "Exponential Rule (general base)",
    formulaTex: "(a^f)' = f' \\, a^f \\ln a",
    explanation: "For a base other than e, the same idea picks up one extra factor: the natural log of the base.",
    examples: [{ problemTex: "(2^x)'", solutionTex: "2^x \\ln 2" }],
    solve: [
      { promptTex: "f(x) = 3^x", answer: "3^x*ln(3)" },
      { promptTex: "f(x) = 5^{2x}", answer: "2*5^(2x)*ln(5)" },
    ],
    simplify: [{ promptTex: "1 \\cdot 2^x \\ln 2", answer: "2^x*ln(2)" }],
  },
  {
    id: "mr11",
    topic: "differentiation",
    category: "Exponential- & Logarithmusfunktionen",
    title: "Natural Log Rule",
    formulaTex: "(\\ln f)' = \\dfrac{f'}{f}",
    explanation: "The derivative of a natural log is the inner function's derivative divided by the inner function itself.",
    examples: [{ problemTex: "\\left(\\ln(x^2+1)\\right)'", solutionTex: "\\dfrac{2x}{x^2+1}" }],
    solve: [
      { promptTex: "f(x) = \\ln(x^3)", answer: "3*x^2/x^3", accepted: ["3/x"] },
      { promptTex: "f(x) = \\ln(x^2)", answer: "2*x/x^2", accepted: ["2/x"] },
    ],
    simplify: [{ promptTex: "\\dfrac{5x^4}{x^5}", answer: "5/x" }],
  },
  {
    id: "mr12",
    topic: "differentiation",
    category: "Exponential- & Logarithmusfunktionen",
    title: "General Log Rule",
    formulaTex: "(\\log_a f)' = \\dfrac{f'}{f \\ln a}",
    explanation: "Same as the natural log rule, but divided by one extra factor: the natural log of the base.",
    examples: [{ problemTex: "\\left(\\log_2(x^2+1)\\right)'", solutionTex: "\\dfrac{2x}{(x^2+1)\\ln 2}" }],
    solve: [
      { promptTex: "f(x) = \\log_{10}(x)", answer: "1/(x*ln(10))" },
      { promptTex: "f(x) = \\log_2(x^3)", answer: "3*x^2/(x^3*ln(2))", accepted: ["3/(x*ln(2))"] },
    ],
    simplify: [{ promptTex: "\\dfrac{4x^3}{x^4 \\ln 3}", answer: "4/(x*ln(3))" }],
  },
];

export const MATH_RULES_BY_ID: Record<string, MathRule> = {};
MATH_RULES.forEach((r) => (MATH_RULES_BY_ID[r.id] = r));
