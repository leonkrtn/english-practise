import { rule, type MathRule } from "./types";

export const LIMITS_RULES: MathRule[] = [
  rule({
    id: "lim1",
    topic: "limits",
    category: "Basics",
    title: "Limit by Substitution",
    difficulty: "foundation",
    formulaTex: "\\lim_{x \\to a} f(x) = f(a) \\quad \\text{if } f \\text{ is continuous at } a",
    explanation:
      "For any function built from polynomials, exponentials, logs and roots — anywhere those are defined — the limit is just the value. You substitute and you are done. Substitution only fails where the function has a hole, a jump or a pole, and that failure is exactly what the other limit techniques exist to repair.",
    pitfalls: [
      "Substituting into a denominator that becomes 0 is not an answer — it is the signal that you need another method.",
      "0/0 and ∞/∞ are indeterminate: they do not mean the limit is 1, or 0, or undefined. They mean 'more work needed'.",
    ],
    examples: [
      { problemTex: "\\lim_{x \\to 2} (x^2 + 3x)", steps: ["2^2 + 3 \\cdot 2", "4 + 6 = 10"] },
      { problemTex: "\\lim_{x \\to 0} e^{x} \\cos(0)", steps: ["e^0 \\cdot 1", "1"] },
    ],
    solve: [
      {
        promptTex: "\\lim_{x \\to 3} (x^2 - 2x + 1)",
        answer: "4",
        hints: ["This is a polynomial — it is continuous everywhere.", "Just substitute x = 3."],
        solution: ["3^2 - 2(3) + 1", "= 9 - 6 + 1 = 4"],
      },
      {
        promptTex: "\\lim_{x \\to 1} \\dfrac{x + 5}{x + 1}",
        answer: "3",
        hints: ["Check the denominator at x = 1 first — is it zero?", "It is 2, so substitution is safe."],
        solution: ["\\dfrac{1+5}{1+1} = \\dfrac{6}{2} = 3"],
      },
    ],
    mc: [
      {
        question: "What does substitution give here, and what does it tell you?",
        promptTex: "\\lim_{x \\to 2} \\dfrac{x^2 - 4}{x - 2}",
        options: [
          "0/0 — indeterminate, factor and cancel first",
          "0 — the limit is zero",
          "\\text{the limit does not exist}",
          "\\infty",
        ],
        correctIndex: 0,
        hints: ["Substitute x = 2 into numerator and denominator separately.", "Both give 0 — that is the 0/0 case."],
        solution: [
          "\\text{numerator: } 2^2 - 4 = 0",
          "\\text{denominator: } 2 - 2 = 0",
          "\\Rightarrow 0/0, \\text{ indeterminate — factor first}",
        ],
      },
    ],
  }),

  rule({
    id: "lim2",
    topic: "limits",
    category: "Indeterminate forms",
    title: "Factor and Cancel (0/0)",
    difficulty: "core",
    formulaTex: "\\lim_{x \\to a} \\dfrac{f(x)}{g(x)} \\;\\text{with}\\; f(a)=g(a)=0 \\;\\Rightarrow\\; \\text{factor out } (x-a)",
    explanation:
      "When substitution yields 0/0 in a rational function, the reason is always the same: both numerator and denominator contain the factor (x − a). Factor it out of each, cancel it, and substitute into what remains. The cancelled function agrees with the original everywhere except at the single point x = a — which is irrelevant, because a limit never looks at the point itself, only at what happens around it.",
    pitfalls: [
      "The cancelled function is not equal to the original at x = a. The original has a hole there; the limit still exists.",
      "If only the denominator goes to 0, this is not 0/0 — the limit is infinite, not indeterminate.",
    ],
    examples: [
      {
        problemTex: "\\lim_{x \\to 2} \\dfrac{x^2 - 4}{x - 2}",
        steps: ["\\dfrac{(x-2)(x+2)}{x-2}", "\\lim_{x \\to 2}(x+2)", "4"],
      },
      {
        problemTex: "\\lim_{x \\to 3} \\dfrac{x^2 - 9}{x^2 - 3x}",
        steps: ["\\dfrac{(x-3)(x+3)}{x(x-3)}", "\\lim_{x \\to 3} \\dfrac{x+3}{x}", "\\dfrac{6}{3} = 2"],
      },
    ],
    solve: [
      {
        promptTex: "\\lim_{x \\to 1} \\dfrac{x^2 - 1}{x - 1}",
        answer: "2",
        hints: ["Factor the numerator as a difference of squares.", "(x−1)(x+1)/(x−1) cancels to x+1."],
        solution: ["\\dfrac{(x-1)(x+1)}{x-1} = x+1", "\\lim_{x \\to 1}(x+1) = 2"],
      },
      {
        promptTex: "\\lim_{x \\to 0} \\dfrac{x^2 + 5x}{x}",
        answer: "5",
        hints: ["Factor x out of the numerator.", "x(x+5)/x = x+5, then substitute 0."],
        solution: ["\\dfrac{x(x+5)}{x} = x + 5", "\\lim_{x \\to 0}(x+5) = 5"],
      },
    ],
    steps: [
      {
        promptTex: "\\lim_{x \\to 4} \\dfrac{x^2 - 16}{x - 4}",
        steps: [
          { instruction: "Factor the numerator completely.", answer: "(x-4)(x+4)", hint: "It is a difference of squares: x² − 4²." },
          { instruction: "After cancelling (x−4), what expression remains?", answer: "x+4", hint: "The (x−4) appears once above and once below." },
          { instruction: "Substitute x = 4 into that to get the limit.", answer: "8", hint: "4 + 4." },
        ],
        solution: ["\\dfrac{x^2-16}{x-4} = \\dfrac{(x-4)(x+4)}{x-4}", "= x+4", "\\lim_{x \\to 4}(x+4) = 8"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Evaluate } \\lim_{x \\to 2} \\dfrac{x^2-4}{x-2}",
        lines: ["\\lim_{x \\to 2} \\dfrac{x^2-4}{x-2}", "= \\dfrac{0}{0}", "= 1"],
        wrongLineIndex: 2,
        correctedLineTex: "= \\lim_{x\\to2} \\dfrac{(x-2)(x+2)}{x-2} = 4",
        explanation:
          "0/0 is an indeterminate form, not a value. It does not equal 1 — it means the algebra is not finished. Factor and cancel, then substitute.",
      },
    ],
  }),

  rule({
    id: "lim3",
    topic: "limits",
    category: "Indeterminate forms",
    title: "L'Hôpital's Rule",
    difficulty: "core",
    formulaTex: "\\lim_{x\\to a}\\dfrac{f(x)}{g(x)} = \\lim_{x\\to a}\\dfrac{f'(x)}{g'(x)} \\quad \\text{for } \\tfrac{0}{0} \\text{ or } \\tfrac{\\infty}{\\infty}",
    explanation:
      "If a quotient gives 0/0 or ∞/∞, differentiate the numerator and the denominator separately — not as a quotient — and try the limit again. You may repeat this as often as the indeterminate form persists. It is the fastest route through limits that no amount of factoring would clear, particularly anything mixing exponentials, logs and polynomials.",
    pitfalls: [
      "You differentiate top and bottom SEPARATELY. This is not the quotient rule — no g² anywhere.",
      "Check the form first. Applying it to a limit that is not 0/0 or ∞/∞ produces a wrong answer.",
      "Forms like 0·∞ or ∞−∞ must be rewritten as a quotient before the rule applies.",
    ],
    derivation: [
      "\\text{Near } a: f(x) \\approx f'(a)(x-a), \\quad g(x) \\approx g'(a)(x-a) \\quad \\text{(since } f(a)=g(a)=0)",
      "\\dfrac{f(x)}{g(x)} \\approx \\dfrac{f'(a)(x-a)}{g'(a)(x-a)} = \\dfrac{f'(a)}{g'(a)}",
    ],
    examples: [
      {
        problemTex: "\\lim_{x \\to 0} \\dfrac{e^x - 1}{x}",
        steps: ["\\text{form } 0/0", "\\lim_{x\\to0} \\dfrac{e^x}{1}", "= 1"],
      },
      {
        problemTex: "\\lim_{x \\to \\infty} \\dfrac{\\ln x}{x}",
        steps: ["\\text{form } \\infty/\\infty", "\\lim_{x\\to\\infty} \\dfrac{1/x}{1}", "= 0"],
      },
    ],
    solve: [
      {
        promptTex: "\\lim_{x \\to 0} \\dfrac{\\sin x}{x}",
        answer: "1",
        hints: ["Check the form: both go to 0.", "Differentiate top and bottom: cos(x)/1, then substitute 0."],
        solution: ["\\text{form } 0/0", "\\lim_{x\\to0}\\dfrac{\\cos x}{1} = \\cos 0 = 1"],
      },
      {
        promptTex: "\\lim_{x \\to 0} \\dfrac{e^{2x} - 1}{x}",
        answer: "2",
        hints: ["Both numerator and denominator go to 0.", "d/dx(e^{2x}) = 2e^{2x}; at x = 0 that is 2."],
        solution: ["\\text{form } 0/0", "\\lim_{x\\to0}\\dfrac{2e^{2x}}{1} = 2"],
      },
    ],
    mc: [
      {
        question: "Is L'Hôpital's rule applicable here?",
        promptTex: "\\lim_{x \\to 1} \\dfrac{x + 2}{x - 3}",
        options: [
          "\\text{No — substitution gives } 3/(-2), \\text{ not indeterminate}",
          "\\text{Yes, the form is } 0/0",
          "\\text{Yes, the form is } \\infty/\\infty",
          "\\text{Yes, it always works on quotients}",
        ],
        correctIndex: 0,
        hints: ["Substitute x = 1 into both parts first.", "You get 3 and −2 — a perfectly ordinary quotient."],
        solution: ["\\dfrac{1+2}{1-3} = \\dfrac{3}{-2} = -1.5", "\\text{Not indeterminate — just substitute.}"],
      },
    ],
  }),

  rule({
    id: "lim4",
    topic: "limits",
    category: "Behaviour at infinity",
    title: "Limits at Infinity",
    difficulty: "core",
    formulaTex: "\\lim_{x \\to \\infty} \\dfrac{a_n x^n + \\cdots}{b_m x^m + \\cdots} = \\begin{cases} 0 & n < m \\\\ a_n/b_m & n = m \\\\ \\pm\\infty & n > m\\end{cases}",
    explanation:
      "For a rational function as x → ±∞, only the highest power in the numerator and the highest power in the denominator matter — everything else becomes negligible. Compare the two degrees: lower on top means the limit is 0, equal degrees means the ratio of the leading coefficients, higher on top means it diverges. This is also exactly how you find the horizontal asymptote of a rational function.",
    pitfalls: [
      "It is the ratio of the leading COEFFICIENTS when the degrees match, not 1.",
      "Constant terms are irrelevant at infinity but decisive at a finite point — do not carry the habit over.",
    ],
    derivation: [
      "\\text{Divide numerator and denominator by } x^m:",
      "\\dfrac{a_n x^{n-m} + \\cdots}{b_m + \\cdots} \\quad \\text{all terms with } x \\text{ in a denominator} \\to 0",
    ],
    examples: [
      { problemTex: "\\lim_{x\\to\\infty} \\dfrac{3x^2 + 5}{6x^2 - x}", steps: ["\\text{degrees equal (2 and 2)}", "\\dfrac{3}{6} = \\dfrac{1}{2}"] },
      { problemTex: "\\lim_{x\\to\\infty} \\dfrac{4x}{x^3 + 1}", steps: ["\\text{degree 1 < degree 3}", "0"] },
    ],
    solve: [
      {
        promptTex: "\\lim_{x \\to \\infty} \\dfrac{2x^3 + x}{5x^3 - 4}",
        answer: "2/5",
        hints: ["Compare the degrees of numerator and denominator.", "Both are 3 — take the ratio of leading coefficients."],
        solution: ["\\text{degrees equal}", "= \\dfrac{2}{5}"],
      },
      {
        promptTex: "\\lim_{x \\to \\infty} \\dfrac{7x^2}{x^4 + 3}",
        answer: "0",
        hints: ["Degree 2 on top, degree 4 below.", "The denominator grows much faster."],
        solution: ["\\text{numerator degree } 2 < \\text{denominator degree } 4", "= 0"],
      },
    ],
    word: [
      {
        scenario:
          "A firm's average cost is C(q) = (400 + 12q) / q euros per unit. What does the average cost approach as production q grows without bound?",
        promptTex: "\\lim_{q \\to \\infty} \\dfrac{400 + 12q}{q}",
        answer: "12",
        unit: "€",
        hints: ["Split the fraction into two terms first.", "400/q → 0 as q → ∞, leaving just the 12."],
        solution: [
          "\\dfrac{400 + 12q}{q} = \\dfrac{400}{q} + 12",
          "\\lim_{q\\to\\infty}\\dfrac{400}{q} = 0",
          "\\Rightarrow \\text{average cost} \\to 12 \\text{ €/unit (the marginal cost)}",
        ],
      },
    ],
  }),

  rule({
    id: "lim5",
    topic: "limits",
    category: "Continuity",
    title: "Continuity",
    difficulty: "core",
    formulaTex: "f \\text{ continuous at } a \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = f(a)",
    explanation:
      "Three things must agree: the limit from the left, the limit from the right, and the actual function value. If the one-sided limits differ, the graph jumps. If they agree with each other but not with f(a) — or f(a) does not exist — there is a removable hole. Continuity matters practically because it is the precondition for the intermediate value theorem, for differentiability, and for evaluating limits by plain substitution.",
    pitfalls: [
      "Differentiable implies continuous, but not the reverse — |x| is continuous at 0 and has no derivative there.",
      "A piecewise function needs checking only at the seams; inside each piece it inherits that piece's continuity.",
    ],
    examples: [
      {
        problemTex: "f(x) = \\begin{cases} x^2 & x \\le 1 \\\\ 2x - 1 & x > 1 \\end{cases} \\text{ at } x=1",
        steps: ["\\text{left: } 1^2 = 1", "\\text{right: } 2(1)-1 = 1", "f(1) = 1 \\Rightarrow \\text{continuous}"],
      },
    ],
    mc: [
      {
        question: "At which point is this function discontinuous?",
        promptTex: "f(x) = \\dfrac{x+1}{x^2 - 9}",
        options: ["x = 3 \\text{ and } x = -3", "x = -1", "x = 9", "\\text{nowhere}"],
        correctIndex: 0,
        hints: ["A rational function breaks exactly where its denominator is zero.", "Solve x² − 9 = 0."],
        solution: ["x^2 - 9 = 0 \\Rightarrow x = \\pm 3", "\\text{poles at } x = 3 \\text{ and } x = -3"],
      },
    ],
    steps: [
      {
        promptTex: "f(x) = \\begin{cases} x + c & x \\le 2 \\\\ 3x - 4 & x > 2 \\end{cases}",
        steps: [
          { instruction: "Evaluate the right-hand limit as x → 2⁺.", answer: "2", hint: "Substitute x = 2 into 3x − 4." },
          { instruction: "The left-hand piece at x = 2 gives 2 + c. What must c be for continuity?", answer: "0", hint: "Set 2 + c equal to the right-hand limit of 2." },
        ],
        solution: [
          "\\lim_{x\\to2^+} (3x-4) = 2",
          "\\lim_{x\\to2^-}(x+c) = 2 + c",
          "2 + c = 2 \\Rightarrow c = 0",
        ],
      },
    ],
  }),
];
