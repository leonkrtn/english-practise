import { rule, type MathRule } from "./types";

export const ALGEBRA_RULES: MathRule[] = [
  rule({
    id: "alg1",
    topic: "algebra",
    category: "Powers",
    title: "Power Laws",
    difficulty: "foundation",
    formulaTex: "a^m \\cdot a^n = a^{m+n} \\qquad \\dfrac{a^m}{a^n} = a^{m-n} \\qquad (a^m)^n = a^{mn}",
    explanation:
      "Multiplying powers of the same base adds the exponents; dividing subtracts them; raising a power to a power multiplies them. The base has to be identical for any of this to apply — there is no rule that combines a^m with b^m into a single power unless m matches, in which case a^m·b^m = (ab)^m.",
    derivation: [
      "a^m \\cdot a^n = \\underbrace{(a \\cdots a)}_{m} \\cdot \\underbrace{(a \\cdots a)}_{n} = \\underbrace{a \\cdots a}_{m+n} = a^{m+n}",
      "\\text{Division is the same count run backwards, which is why it subtracts.}",
    ],
    pitfalls: [
      "a^m + a^n does NOT simplify — the laws are only about multiplication and division.",
      "(a+b)^n is not a^n + b^n. That is the single most common algebra error there is.",
      "A negative exponent is a reciprocal, not a negative number: a^{-n} = 1/a^n, and 2^{-3} = 1/8, not −8.",
    ],
    examples: [
      { problemTex: "x^3 \\cdot x^5", steps: ["x^{3+5}", "x^8"] },
      { problemTex: "\\dfrac{x^7}{x^2}", steps: ["x^{7-2}", "x^5"] },
      { problemTex: "(x^2)^4", steps: ["x^{2 \\cdot 4}", "x^8"] },
    ],
    simplify: [
      {
        promptTex: "x^4 \\cdot x^6",
        answer: "x^10",
        hints: ["Same base — what happens to the exponents when you multiply?", "Add them: 4 + 6."],
        solution: ["x^4 \\cdot x^6 = x^{4+6}", "= x^{10}"],
      },
      {
        promptTex: "\\dfrac{x^9}{x^4}",
        answer: "x^5",
        hints: ["Dividing powers of the same base subtracts the exponents.", "9 − 4 = 5."],
        solution: ["\\dfrac{x^9}{x^4} = x^{9-4}", "= x^{5}"],
      },
      {
        promptTex: "(x^3)^5",
        answer: "x^15",
        hints: ["A power of a power multiplies the exponents.", "3 · 5 = 15."],
        solution: ["(x^3)^5 = x^{3 \\cdot 5}", "= x^{15}"],
      },
      {
        promptTex: "x^{-3}",
        answer: "1/x^3",
        hints: ["A negative exponent means a reciprocal.", "a^{-n} = 1/a^n."],
        solution: ["x^{-3} = \\dfrac{1}{x^{3}}"],
      },
    ],
    mc: [
      {
        question: "Which simplification is correct?",
        promptTex: "(2x^3)^4",
        options: ["16x^{12}", "2x^{12}", "8x^{12}", "16x^{7}"],
        correctIndex: 0,
        hints: ["The exponent applies to the coefficient too.", "2^4 = 16, and (x^3)^4 = x^{12}."],
        solution: ["(2x^3)^4 = 2^4 \\cdot (x^3)^4", "= 16x^{12}"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Simplify } (x + y)^2",
        lines: ["(x+y)^2", "= x^2 + y^2"],
        wrongLineIndex: 1,
        correctedLineTex: "= x^2 + 2xy + y^2",
        explanation:
          "Squaring a sum is not squaring each term. Expand it: (x+y)(x+y) = x² + xy + yx + y² = x² + 2xy + y². The missing 2xy is the whole point of the binomial formula.",
      },
    ],
  }),

  rule({
    id: "alg2",
    topic: "algebra",
    category: "Powers",
    title: "Roots as Fractional Powers",
    difficulty: "foundation",
    formulaTex: "\\sqrt[n]{a^m} = a^{m/n} \\qquad \\sqrt{a} = a^{1/2}",
    explanation:
      "Every root is a power with a fractional exponent. Rewriting roots this way is what lets you differentiate, integrate and simplify them with the ordinary power rules instead of learning a second set of rules for radicals — in practice you should convert a root to a fractional power almost every time you meet one.",
    pitfalls: [
      "√(a+b) is not √a + √b. Roots do not distribute over sums, only over products and quotients.",
      "√(x²) = |x|, not x — the root always returns the non-negative value.",
    ],
    examples: [
      { problemTex: "\\sqrt{x}", steps: ["x^{1/2}"] },
      { problemTex: "\\sqrt[3]{x^2}", steps: ["x^{2/3}"] },
      { problemTex: "\\dfrac{1}{\\sqrt{x}}", steps: ["\\dfrac{1}{x^{1/2}}", "x^{-1/2}"] },
    ],
    simplify: [
      {
        promptTex: "\\sqrt[4]{x^3}",
        answer: "x^(3/4)",
        hints: ["The root index becomes the denominator of the exponent.", "n-th root of a^m is a^{m/n}."],
        solution: ["\\sqrt[4]{x^3} = x^{3/4}"],
      },
      {
        promptTex: "\\dfrac{1}{\\sqrt[3]{x}}",
        answer: "x^(-1/3)",
        accepted: ["1/x^(1/3)"],
        hints: ["First write the root as a fractional power.", "Then move it up with a negative exponent."],
        solution: ["\\dfrac{1}{\\sqrt[3]{x}} = \\dfrac{1}{x^{1/3}}", "= x^{-1/3}"],
      },
    ],
    mc: [
      {
        question: "Which is equal to this expression?",
        promptTex: "\\sqrt{x^5}",
        options: ["x^{5/2}", "x^{2/5}", "x^{5} \\cdot x^{1/2}", "x^{2.5} \\cdot 2"],
        correctIndex: 0,
        hints: ["Square root means exponent 1/2.", "Multiply the exponents: 5 · (1/2)."],
        solution: ["\\sqrt{x^5} = (x^5)^{1/2}", "= x^{5/2}"],
      },
    ],
  }),

  rule({
    id: "alg3",
    topic: "algebra",
    category: "Logarithms",
    title: "Logarithm Laws",
    difficulty: "core",
    formulaTex: "\\ln(ab) = \\ln a + \\ln b \\qquad \\ln\\dfrac{a}{b} = \\ln a - \\ln b \\qquad \\ln(a^n) = n \\ln a",
    explanation:
      "A logarithm answers \"what exponent turns the base into this number?\". Because exponents add when powers multiply, logarithms turn products into sums, quotients into differences, and powers into coefficients. That last law is the workhorse: it is how you get an unknown out of an exponent, which is exactly what you need for solving for time in a compound-interest problem.",
    derivation: [
      "\\text{Let } a = e^x \\text{ and } b = e^y, \\text{ so } \\ln a = x, \\ \\ln b = y.",
      "ab = e^x e^y = e^{x+y}",
      "\\ln(ab) = x + y = \\ln a + \\ln b",
    ],
    pitfalls: [
      "ln(a + b) does NOT split. There is no law for the log of a sum.",
      "ln(a)·ln(b) is not ln(ab). The product law turns a product inside the log into a sum outside it.",
      "ln is only defined for strictly positive arguments — ln(0) and ln(negative) do not exist.",
    ],
    examples: [
      { problemTex: "\\ln(x^3)", steps: ["3\\ln x"] },
      { problemTex: "\\ln\\dfrac{x^2}{y}", steps: ["\\ln(x^2) - \\ln y", "2\\ln x - \\ln y"] },
    ],
    simplify: [
      {
        promptTex: "\\ln(x^7)",
        answer: "7*ln(x)",
        hints: ["The power law brings the exponent to the front.", "ln(a^n) = n·ln(a)."],
        solution: ["\\ln(x^7) = 7\\ln x"],
      },
      {
        promptTex: "\\ln(5) + \\ln(x)",
        answer: "ln(5x)",
        hints: ["A sum of logs is the log of a product.", "Read the product law right-to-left."],
        solution: ["\\ln 5 + \\ln x = \\ln(5x)"],
      },
    ],
    mc: [
      {
        question: "Which step correctly isolates t?",
        promptTex: "1000 \\cdot 1.05^t = 2000",
        options: [
          "t = \\dfrac{\\ln 2}{\\ln 1.05}",
          "t = \\dfrac{\\ln 1.05}{\\ln 2}",
          "t = \\ln 2 - \\ln 1.05",
          "t = 2 \\cdot \\ln 1.05",
        ],
        correctIndex: 0,
        hints: ["Divide by 1000 first, then take ln of both sides.", "ln(1.05^t) = t·ln(1.05) — that is how t comes down."],
        solution: [
          "1.05^t = 2",
          "\\ln(1.05^t) = \\ln 2",
          "t \\ln 1.05 = \\ln 2",
          "t = \\dfrac{\\ln 2}{\\ln 1.05}",
        ],
      },
    ],
    error: [
      {
        promptTex: "\\text{Simplify } \\ln(x + 3)",
        lines: ["\\ln(x+3)", "= \\ln x + \\ln 3"],
        wrongLineIndex: 1,
        correctedLineTex: "\\text{cannot be simplified}",
        explanation:
          "The product law applies to ln(x·3), not ln(x+3). A logarithm of a sum has no expansion — leave it as it is.",
      },
    ],
    word: [
      {
        scenario:
          "An investment of €5,000 grows at 6% per year with annual compounding. After how many full years does it first exceed €10,000? Give the exact expression for t (unrounded).",
        promptTex: "5000 \\cdot 1.06^t = 10000",
        answer: "ln(2)/ln(1.06)",
        hints: ["Divide both sides by 5,000 first.", "Take ln of both sides, then use ln(a^t) = t·ln(a)."],
        solution: [
          "1.06^t = 2",
          "t \\ln 1.06 = \\ln 2",
          "t = \\dfrac{\\ln 2}{\\ln 1.06} \\approx 11.9",
          "\\text{so it first exceeds €10,000 in year 12.}",
        ],
      },
    ],
  }),

  rule({
    id: "alg4",
    topic: "algebra",
    category: "Equations",
    title: "Quadratic Formula",
    difficulty: "core",
    formulaTex: "ax^2 + bx + c = 0 \\;\\Rightarrow\\; x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    explanation:
      "The general solution of any quadratic. The expression under the root, D = b² − 4ac, is the discriminant and tells you the shape of the answer before you compute it: D > 0 gives two distinct real roots, D = 0 gives one (a double root, where the parabola just touches the axis), D < 0 gives no real roots at all.",
    derivation: [
      "ax^2 + bx + c = 0 \\quad | \\div a",
      "x^2 + \\tfrac{b}{a}x = -\\tfrac{c}{a}",
      "\\text{complete the square: add } \\left(\\tfrac{b}{2a}\\right)^2 \\text{ to both sides}",
      "\\left(x + \\tfrac{b}{2a}\\right)^2 = \\tfrac{b^2 - 4ac}{4a^2}",
      "x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
    ],
    pitfalls: [
      "The whole of −b sits above the fraction bar, and 2a divides the entire numerator — not just the root.",
      "Bring the equation to = 0 first. Applying the formula to ax² + bx = c with that c gives the wrong sign.",
      "a is the coefficient of x², not necessarily the first number you see. Order the terms first.",
    ],
    examples: [
      {
        problemTex: "x^2 - 5x + 6 = 0",
        steps: ["x = \\dfrac{5 \\pm \\sqrt{25 - 24}}{2}", "x = \\dfrac{5 \\pm 1}{2}", "x_1 = 3, \\quad x_2 = 2"],
      },
    ],
    steps: [
      {
        promptTex: "x^2 - 7x + 12 = 0",
        steps: [
          { instruction: "Compute the discriminant D = b² − 4ac.", answer: "1", hint: "b = −7, a = 1, c = 12. So D = 49 − 48." },
          { instruction: "Give the larger root.", answer: "4", hint: "x = (7 + √1)/2." },
          { instruction: "Give the smaller root.", answer: "3", hint: "x = (7 − √1)/2." },
        ],
        solution: ["D = (-7)^2 - 4(1)(12) = 49 - 48 = 1", "x = \\dfrac{7 \\pm 1}{2}", "x_1 = 4, \\quad x_2 = 3"],
      },
    ],
    mc: [
      {
        question: "How many real solutions does this equation have?",
        promptTex: "x^2 + 2x + 5 = 0",
        options: ["none", "exactly one", "two", "infinitely many"],
        correctIndex: 0,
        hints: ["Look only at the discriminant.", "D = 4 − 20 = −16, which is negative."],
        solution: ["D = 2^2 - 4(1)(5) = 4 - 20 = -16 < 0", "\\text{negative discriminant} \\Rightarrow \\text{no real roots}"],
      },
    ],
  }),

  rule({
    id: "alg5",
    topic: "algebra",
    category: "Fractions",
    title: "Algebraic Fractions",
    difficulty: "foundation",
    formulaTex: "\\dfrac{a}{b} \\pm \\dfrac{c}{d} = \\dfrac{ad \\pm cb}{bd} \\qquad \\dfrac{a}{b} \\cdot \\dfrac{c}{d} = \\dfrac{ac}{bd} \\qquad \\dfrac{a/b}{c/d} = \\dfrac{a}{b} \\cdot \\dfrac{d}{c}",
    explanation:
      "Adding fractions needs a common denominator; multiplying does not. Dividing by a fraction is multiplying by its reciprocal. When cancelling, you may only cancel factors — something multiplying the entire numerator and the entire denominator — never individual terms of a sum.",
    pitfalls: [
      "You cannot cancel across a sum: (x+3)/3 is not x. The 3 in the numerator is a term, not a factor.",
      "1/a + 1/b is not 1/(a+b). Put them over a common denominator: (b+a)/(ab).",
    ],
    examples: [
      { problemTex: "\\dfrac{1}{x} + \\dfrac{1}{y}", steps: ["\\dfrac{y}{xy} + \\dfrac{x}{xy}", "\\dfrac{x+y}{xy}"] },
      { problemTex: "\\dfrac{x^2 - 9}{x - 3}", steps: ["\\dfrac{(x-3)(x+3)}{x-3}", "x + 3 \\quad (x \\neq 3)"] },
    ],
    simplify: [
      {
        promptTex: "\\dfrac{x^2 - 4}{x - 2}",
        answer: "x+2",
        hints: ["Factor the numerator first — it is a difference of squares.", "x² − 4 = (x−2)(x+2), then cancel."],
        solution: ["\\dfrac{x^2-4}{x-2} = \\dfrac{(x-2)(x+2)}{x-2}", "= x + 2 \\quad (x \\neq 2)"],
      },
      {
        promptTex: "\\dfrac{2}{x} + \\dfrac{3}{x^2}",
        answer: "(2x+3)/x^2",
        hints: ["The common denominator is x².", "Multiply the first fraction by x/x."],
        solution: ["\\dfrac{2}{x} + \\dfrac{3}{x^2} = \\dfrac{2x}{x^2} + \\dfrac{3}{x^2}", "= \\dfrac{2x+3}{x^2}"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Simplify } \\dfrac{x + 6}{6}",
        lines: ["\\dfrac{x+6}{6}", "= x"],
        wrongLineIndex: 1,
        correctedLineTex: "= \\dfrac{x}{6} + 1",
        explanation:
          "The 6 in the numerator is a term added to x, not a factor multiplying it, so it cannot be cancelled against the denominator. Split the fraction instead.",
      },
    ],
  }),

  rule({
    id: "alg6",
    topic: "algebra",
    category: "Equations",
    title: "Binomial Formulas",
    difficulty: "foundation",
    formulaTex: "(a+b)^2 = a^2 + 2ab + b^2 \\qquad (a-b)^2 = a^2 - 2ab + b^2 \\qquad (a+b)(a-b) = a^2 - b^2",
    explanation:
      "Three expansions worth knowing by sight rather than deriving each time. The third one — the difference of squares — is the most useful in practice, because it factors backwards: any expression of the form a² − b² splits instantly into (a+b)(a−b), which is how most cancelling opportunities in algebraic fractions appear.",
    pitfalls: [
      "The middle term 2ab is the one people drop. (a+b)² has three terms, not two.",
      "a² + b² does not factor over the reals. Only the difference of squares does.",
    ],
    examples: [
      { problemTex: "(x+4)^2", steps: ["x^2 + 2 \\cdot x \\cdot 4 + 4^2", "x^2 + 8x + 16"] },
      { problemTex: "x^2 - 25", steps: ["x^2 - 5^2", "(x+5)(x-5)"] },
    ],
    simplify: [
      {
        promptTex: "(x+3)^2",
        answer: "x^2+6x+9",
        hints: ["Use (a+b)² = a² + 2ab + b².", "The middle term is 2·x·3."],
        solution: ["(x+3)^2 = x^2 + 2 \\cdot x \\cdot 3 + 9", "= x^2 + 6x + 9"],
      },
      {
        promptTex: "(x+7)(x-7)",
        answer: "x^2-49",
        hints: ["This is the difference-of-squares pattern.", "(a+b)(a−b) = a² − b²."],
        solution: ["(x+7)(x-7) = x^2 - 7^2", "= x^2 - 49"],
      },
    ],
  }),
];
