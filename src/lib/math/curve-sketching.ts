import { rule, type MathRule } from "./types";

export const CURVE_SKETCHING_RULES: MathRule[] = [
  rule({
    id: "cs1",
    topic: "curve-sketching",
    category: "Monotonicity",
    title: "Increasing and Decreasing",
    difficulty: "foundation",
    formulaTex: "f'(x) > 0 \\Rightarrow f \\text{ increasing} \\qquad f'(x) < 0 \\Rightarrow f \\text{ decreasing}",
    explanation:
      "The sign of the first derivative tells you the direction of the function. To find the intervals, compute f', find where it is zero or undefined, and test the sign of f' in each resulting interval. Those zeros are the only places the direction can change, which is why they alone partition the domain.",
    pitfalls: [
      "You test the sign of f', not of f. A function can be negative and still increasing.",
      "f'(x) = 0 at a single point does not by itself break monotonicity — x³ has f'(0) = 0 and is increasing throughout.",
    ],
    examples: [
      {
        problemTex: "f(x) = x^2 - 4x",
        steps: ["f'(x) = 2x - 4", "f'(x) = 0 \\Rightarrow x = 2", "x<2: f'<0 \\text{ (decreasing)}, \\; x>2: f'>0 \\text{ (increasing)}"],
      },
    ],
    solve: [
      {
        promptTex: "f(x) = x^2 - 6x + 5. \\text{ At which } x \\text{ does it switch from decreasing to increasing?}",
        answer: "3",
        hints: ["Find where f'(x) = 0.", "f'(x) = 2x − 6 = 0."],
        solution: ["f'(x) = 2x - 6", "2x - 6 = 0 \\Rightarrow x = 3"],
      },
    ],
    mc: [
      {
        question: "On which interval is this function increasing?",
        promptTex: "f(x) = x^3 - 3x",
        options: ["x < -1 \\text{ and } x > 1", "-1 < x < 1", "x > 0", "\\text{everywhere}"],
        correctIndex: 0,
        hints: ["f'(x) = 3x² − 3 = 3(x−1)(x+1).", "This is positive outside [−1, 1]."],
        solution: ["f'(x) = 3x^2 - 3 = 3(x-1)(x+1)", "f' > 0 \\text{ for } x < -1 \\text{ or } x > 1"],
      },
    ],
  }),

  rule({
    id: "cs2",
    topic: "curve-sketching",
    category: "Extrema",
    title: "Local Extrema",
    difficulty: "core",
    formulaTex: "f'(x_0) = 0 \\;\\text{and}\\; \\begin{cases} f''(x_0) < 0 & \\text{maximum} \\\\ f''(x_0) > 0 & \\text{minimum}\\end{cases}",
    explanation:
      "A local extremum requires a horizontal tangent, so f'(x₀) = 0 is the necessary condition — these points are called stationary or critical points. To classify them, look at the second derivative: negative curvature means the graph opens downward, so the stationary point is a peak; positive curvature means a trough. If f''(x₀) = 0 too, the test is inconclusive and you must fall back on checking the sign change of f' around x₀.",
    pitfalls: [
      "f'(x₀) = 0 is necessary but NOT sufficient — x³ has f'(0) = 0 and no extremum there, just a saddle.",
      "The signs are counter-intuitive at first: f'' < 0 gives a MAXIMUM.",
      "On a closed interval, always also check the endpoints — a global extremum can sit at a boundary where f' ≠ 0.",
    ],
    examples: [
      {
        problemTex: "f(x) = x^2 - 4x + 7",
        steps: ["f'(x) = 2x - 4 = 0 \\Rightarrow x = 2", "f''(x) = 2 > 0 \\Rightarrow \\text{minimum}", "f(2) = 3, \\text{ so the minimum is } (2, 3)"],
      },
    ],
    steps: [
      {
        promptTex: "f(x) = x^3 - 12x",
        steps: [
          { instruction: "Find f'(x).", answer: "3*x^2-12", accepted: ["-12+3*x^2"], hint: "Power rule, term by term." },
          { instruction: "Give the positive solution of f'(x) = 0.", answer: "2", hint: "3x² = 12, so x² = 4." },
          { instruction: "f''(x) = 6x. What is f''(2)?", answer: "12", hint: "Substitute x = 2 into 6x." },
        ],
        solution: [
          "f'(x) = 3x^2 - 12 = 0 \\Rightarrow x = \\pm 2",
          "f''(x) = 6x",
          "f''(2) = 12 > 0 \\Rightarrow \\text{minimum at } x=2",
          "f''(-2) = -12 < 0 \\Rightarrow \\text{maximum at } x=-2",
        ],
      },
    ],
    mc: [
      {
        question: "f'(3) = 0 and f''(3) = −5. What is at x = 3?",
        promptTex: "f'(3)=0, \\quad f''(3)=-5",
        options: ["\\text{a local maximum}", "\\text{a local minimum}", "\\text{an inflection point}", "\\text{nothing special}"],
        correctIndex: 0,
        hints: ["Negative second derivative means the curve opens downward.", "A downward-opening curve with a flat tangent is a peak."],
        solution: ["f'(3)=0 \\Rightarrow \\text{stationary}", "f''(3) < 0 \\Rightarrow \\text{concave} \\Rightarrow \\text{maximum}"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Classify the stationary point of } f(x)=x^2+2x",
        lines: ["f'(x) = 2x + 2 = 0 \\Rightarrow x = -1", "f''(x) = 2 > 0", "\\Rightarrow \\text{maximum at } x=-1"],
        wrongLineIndex: 2,
        correctedLineTex: "\\Rightarrow \\text{minimum at } x=-1",
        explanation:
          "A positive second derivative means the graph is convex (opens upward), so the stationary point is a minimum. Maximum requires f'' < 0.",
      },
    ],
    word: [
      {
        scenario:
          "A firm's profit is P(q) = −q² + 80q − 600. At which output q is profit maximised?",
        answer: "40",
        hints: ["Set P'(q) = 0.", "P'(q) = −2q + 80."],
        solution: ["P'(q) = -2q + 80 = 0 \\Rightarrow q = 40", "P''(q) = -2 < 0 \\Rightarrow \\text{maximum} \\;\\checkmark"],
      },
    ],
  }),

  rule({
    id: "cs3",
    topic: "curve-sketching",
    category: "Curvature",
    title: "Inflection Points",
    difficulty: "core",
    formulaTex: "f''(x_0) = 0 \\;\\text{and}\\; f''' (x_0) \\neq 0 \\;\\Rightarrow\\; \\text{inflection point}",
    explanation:
      "An inflection point is where the curvature changes sign — the graph switches from convex to concave or back. The condition f''(x₀) = 0 is necessary, and a non-zero third derivative confirms that the sign genuinely flips rather than merely touching zero. In economics this is the point of diminishing returns: where marginal gains stop accelerating and start decelerating.",
    pitfalls: [
      "f''(x₀) = 0 alone is not enough — x⁴ has f''(0) = 0 but no inflection.",
      "An inflection point is not an extremum. The tangent there is usually not horizontal.",
    ],
    examples: [
      {
        problemTex: "f(x) = x^3 - 3x^2",
        steps: ["f''(x) = 6x - 6 = 0 \\Rightarrow x = 1", "f'''(x) = 6 \\neq 0 \\;\\checkmark", "\\text{inflection at } x = 1"],
      },
    ],
    solve: [
      {
        promptTex: "f(x) = x^3 - 6x^2 + 5. \\text{ Find the inflection point's } x.",
        answer: "2",
        hints: ["Compute f''(x) and set it to zero.", "f'' (x) = 6x − 12."],
        solution: ["f'(x) = 3x^2 - 12x", "f''(x) = 6x - 12 = 0 \\Rightarrow x = 2"],
      },
    ],
    mc: [
      {
        question: "What is true at an inflection point?",
        promptTex: "\\text{inflection point at } x_0",
        options: [
          "\\text{the curvature changes sign}",
          "\\text{the function reaches a maximum}",
          "\\text{the tangent is always horizontal}",
          "f(x_0) = 0",
        ],
        correctIndex: 0,
        hints: ["Think about what the second derivative measures.", "It measures curvature — and it changes sign here."],
        solution: ["f'' \\text{ changes sign} \\Rightarrow \\text{convex} \\leftrightarrow \\text{concave}"],
      },
    ],
  }),

  rule({
    id: "cs4",
    topic: "curve-sketching",
    category: "Asymptotes",
    title: "Asymptotes of Rational Functions",
    difficulty: "core",
    formulaTex: "\\text{vertical: } g(x)=0,\\; f(x)\\neq0 \\qquad \\text{horizontal: } \\lim_{x\\to\\pm\\infty} \\dfrac{f(x)}{g(x)}",
    explanation:
      "A vertical asymptote sits where the denominator vanishes but the numerator does not — if both vanish you have a removable hole instead, not a pole. The horizontal asymptote is the limit at infinity, read off by comparing degrees: lower numerator degree gives y = 0, equal degrees give the ratio of leading coefficients, and a numerator exactly one degree higher gives a slanted asymptote found by polynomial division.",
    pitfalls: [
      "Denominator zero alone is not enough — check the numerator too, or you will call a hole a pole.",
      "A function may cross its horizontal asymptote. 'Asymptote' constrains behaviour at infinity, not everywhere.",
    ],
    examples: [
      {
        problemTex: "f(x) = \\dfrac{2x^2+1}{x^2-4}",
        steps: ["x^2-4=0 \\Rightarrow x = \\pm2 \\text{ (vertical)}", "\\text{degrees equal} \\Rightarrow y = \\tfrac{2}{1} = 2 \\text{ (horizontal)}"],
      },
    ],
    solve: [
      {
        promptTex: "f(x) = \\dfrac{3x^2}{x^2+1}. \\text{ Give the horizontal asymptote } y.",
        answer: "3",
        hints: ["Compare the degrees — both are 2.", "Take the ratio of the leading coefficients: 3/1."],
        solution: ["\\lim_{x\\to\\infty}\\dfrac{3x^2}{x^2+1} = 3", "y = 3"],
      },
    ],
    mc: [
      {
        question: "Where is the vertical asymptote?",
        promptTex: "f(x) = \\dfrac{x+1}{x-5}",
        options: ["x = 5", "x = -1", "y = 1", "\\text{there is none}"],
        correctIndex: 0,
        hints: ["Set the denominator to zero.", "x − 5 = 0, and the numerator at x=5 is 6 ≠ 0."],
        solution: ["x - 5 = 0 \\Rightarrow x = 5", "\\text{numerator } 5+1=6 \\neq 0 \\Rightarrow \\text{genuine pole}"],
      },
    ],
  }),

  rule({
    id: "cs5",
    topic: "curve-sketching",
    category: "Optimization",
    title: "Optimization with Constraints",
    difficulty: "advanced",
    formulaTex: "\\text{minimise } f(x,y) \\;\\text{s.t.}\\; g(x,y)=c \\;\\Rightarrow\\; \\text{substitute, then } \\tfrac{d}{dx}=0",
    explanation:
      "A one-variable optimisation problem in disguise: use the constraint to express one variable through the other, substitute into the objective to get a single-variable function, then apply the usual stationary-point machinery. Always confirm the result with the second derivative, and check whether the domain has boundaries the optimum could sit on instead.",
    pitfalls: [
      "Do not forget to translate back — the question usually asks for the original quantities, not the substituted variable.",
      "Check the domain: a length or quantity cannot be negative, which can rule out an algebraically valid stationary point.",
    ],
    examples: [
      {
        problemTex: "\\text{max } xy \\text{ s.t. } x+y=10",
        steps: ["y = 10-x", "A(x) = x(10-x) = 10x - x^2", "A'(x) = 10-2x = 0 \\Rightarrow x=5", "\\Rightarrow x=y=5, \\; A=25"],
      },
    ],
    word: [
      {
        scenario:
          "A rectangular storage area is to be fenced with 200 m of fencing. What width x (in metres) maximises the enclosed area?",
        promptTex: "2x + 2y = 200",
        answer: "50",
        unit: "m",
        hints: ["From the constraint, y = 100 − x.", "Area A(x) = x(100−x); set A'(x) = 0."],
        solution: [
          "y = 100 - x",
          "A(x) = x(100-x) = 100x - x^2",
          "A'(x) = 100 - 2x = 0 \\Rightarrow x = 50",
          "A''(x) = -2 < 0 \\Rightarrow \\text{maximum; the square } 50\\times50",
        ],
      },
    ],
  }),
];
