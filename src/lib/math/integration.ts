import { rule, type MathRule } from "./types";

export const INTEGRATION_RULES: MathRule[] = [
  rule({
    id: "int1",
    topic: "integration",
    category: "Basic integrals",
    title: "Power Rule for Integration",
    difficulty: "foundation",
    formulaTex: "\\int x^n \\, dx = \\dfrac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)",
    explanation:
      "Integration reverses differentiation: raise the exponent by one and divide by the new exponent. The exclusion n = −1 is essential — it would divide by zero — and that single missing case is exactly what the logarithm covers. The constant C is not decoration: every function differing by a constant has the same derivative, so an indefinite integral is a whole family of functions.",
    derivation: [
      "\\text{Check by differentiating the result:}",
      "\\left(\\dfrac{x^{n+1}}{n+1}\\right)' = \\dfrac{(n+1)x^{n}}{n+1} = x^n \\;\\checkmark",
    ],
    pitfalls: [
      "Forgetting + C. On an indefinite integral it is part of the answer.",
      "n = −1 is NOT covered — ∫x⁻¹dx = ln|x| + C.",
      "You raise the exponent, the opposite of differentiation. Going the wrong way is the classic slip.",
    ],
    examples: [
      { problemTex: "\\int x^3 \\, dx", steps: ["\\dfrac{x^{4}}{4} + C"] },
      { problemTex: "\\int \\sqrt{x} \\, dx", steps: ["\\int x^{1/2}dx", "\\dfrac{x^{3/2}}{3/2} + C", "\\tfrac{2}{3}x^{3/2} + C"] },
    ],
    solve: [
      {
        promptTex: "\\int x^4 \\, dx \\quad \\text{(omit + C)}",
        answer: "x^5/5",
        hints: ["Raise the exponent to 5.", "Then divide by 5."],
        solution: ["\\int x^4 dx = \\dfrac{x^5}{5} + C"],
      },
      {
        promptTex: "\\int 6x^2 \\, dx \\quad \\text{(omit + C)}",
        answer: "2*x^3",
        hints: ["The constant 6 comes along for the ride.", "6·(x³/3) = 2x³."],
        solution: ["6 \\cdot \\dfrac{x^3}{3} + C = 2x^3 + C"],
      },
      {
        promptTex: "\\int \\dfrac{1}{x^2} \\, dx \\quad \\text{(omit + C)}",
        answer: "-1/x",
        accepted: ["-x^(-1)"],
        hints: ["Rewrite as x⁻².", "Raising by one gives x⁻¹, divided by −1."],
        solution: ["\\int x^{-2}dx = \\dfrac{x^{-1}}{-1} + C", "= -\\dfrac{1}{x} + C"],
      },
    ],
    mc: [
      {
        question: "Which integral does the power rule NOT cover?",
        promptTex: "\\int x^n dx",
        options: ["n = -1", "n = 0", "n = \\tfrac12", "n = -2"],
        correctIndex: 0,
        hints: ["Look at the denominator n+1.", "n = −1 would make it zero."],
        solution: ["n = -1 \\Rightarrow n+1 = 0 \\Rightarrow \\text{division by zero}", "\\int x^{-1}dx = \\ln|x| + C"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Evaluate } \\int x^3 dx",
        lines: ["\\int x^3 dx", "= 3x^2 + C"],
        wrongLineIndex: 1,
        correctedLineTex: "= \\dfrac{x^4}{4} + C",
        explanation:
          "That is the DERIVATIVE of x³, not its integral. Integration raises the exponent and divides — it runs in the opposite direction.",
      },
    ],
  }),

  rule({
    id: "int2",
    topic: "integration",
    category: "Basic integrals",
    title: "Standard Integrals",
    difficulty: "foundation",
    formulaTex: "\\int e^x dx = e^x + C \\qquad \\int \\dfrac{1}{x}dx = \\ln|x| + C \\qquad \\int a^x dx = \\dfrac{a^x}{\\ln a} + C",
    explanation:
      "The integrals worth knowing by heart, each one simply the derivative rules read backwards. Note the absolute value in ln|x| — it makes the formula valid on the negative side of the axis too, where ln(x) itself is undefined. And where differentiating a^x multiplies by ln(a), integrating divides by it.",
    pitfalls: [
      "∫(1/x)dx is ln|x|, not ln(x) — the bars matter on the negative branch.",
      "∫e^x dx = e^x, with no extra factor. But ∫e^{kx}dx = e^{kx}/k.",
    ],
    examples: [
      { problemTex: "\\int 3e^x dx", steps: ["3e^x + C"] },
      { problemTex: "\\int \\dfrac{5}{x} dx", steps: ["5\\ln|x| + C"] },
    ],
    solve: [
      { promptTex: "\\int 2e^x \\, dx \\quad \\text{(omit + C)}", answer: "2*e^x", hints: ["e^x integrates to itself.", "The 2 passes through."], solution: ["= 2e^x + C"] },
      { promptTex: "\\int \\dfrac{4}{x} \\, dx \\quad \\text{(omit + C, write ln(x))}", answer: "4*ln(x)", hints: ["1/x integrates to ln|x|.", "Multiply by 4."], solution: ["= 4\\ln|x| + C"] },
    ],
  }),

  rule({
    id: "int3",
    topic: "integration",
    category: "Definite integrals",
    title: "Definite Integral",
    difficulty: "core",
    formulaTex: "\\int_a^b f(x)\\,dx = F(b) - F(a) \\quad \\text{where } F' = f",
    explanation:
      "The fundamental theorem of calculus: find any antiderivative F, evaluate it at the upper limit, subtract its value at the lower limit. The constant C cancels in the subtraction, which is why definite integrals never carry one. Geometrically the result is the signed area between the curve and the x-axis — signed, because area below the axis counts as negative.",
    pitfalls: [
      "F(b) − F(a), in that order. Swapping the limits flips the sign.",
      "Signed area is not total area. If the curve crosses the axis, split the integral at the crossing to get the geometric area.",
      "No + C on a definite integral.",
    ],
    examples: [
      {
        problemTex: "\\int_0^2 x^2 dx",
        steps: ["F(x) = \\dfrac{x^3}{3}", "F(2) - F(0) = \\dfrac{8}{3} - 0", "= \\dfrac{8}{3}"],
      },
    ],
    solve: [
      {
        promptTex: "\\int_0^3 2x \\, dx",
        answer: "9",
        hints: ["The antiderivative of 2x is x².", "Evaluate 3² − 0²."],
        solution: ["F(x) = x^2", "F(3) - F(0) = 9 - 0 = 9"],
      },
      {
        promptTex: "\\int_1^2 x^3 \\, dx",
        answer: "15/4",
        accepted: ["3.75"],
        hints: ["F(x) = x⁴/4.", "16/4 − 1/4 = 15/4."],
        solution: ["F(x) = \\dfrac{x^4}{4}", "\\dfrac{16}{4} - \\dfrac{1}{4} = \\dfrac{15}{4}"],
      },
    ],
    steps: [
      {
        promptTex: "\\int_1^3 (2x + 1)\\, dx",
        steps: [
          { instruction: "Give the antiderivative F(x) (omit + C).", answer: "x^2+x", accepted: ["x+x^2"], hint: "Integrate term by term: 2x → x², 1 → x." },
          { instruction: "Evaluate F(3).", answer: "12", hint: "9 + 3." },
          { instruction: "Evaluate F(1), then give the final value F(3) − F(1).", answer: "10", hint: "F(1) = 2, so 12 − 2." },
        ],
        solution: ["F(x) = x^2 + x", "F(3) = 12, \\quad F(1) = 2", "\\int_1^3 (2x+1)dx = 12 - 2 = 10"],
      },
    ],
    word: [
      {
        scenario:
          "Marginal cost is MC(q) = 4q + 10. What is the total additional cost of increasing production from q = 0 to q = 10 units?",
        promptTex: "\\int_0^{10} (4q + 10)\\, dq",
        answer: "300",
        unit: "€",
        hints: ["Integrating marginal cost gives the change in total cost.", "F(q) = 2q² + 10q; evaluate at 10 and 0."],
        solution: ["F(q) = 2q^2 + 10q", "F(10) = 200 + 100 = 300", "F(0) = 0 \\Rightarrow \\text{additional cost} = 300"],
      },
    ],
  }),

  rule({
    id: "int4",
    topic: "integration",
    category: "Techniques",
    title: "Integration by Substitution",
    difficulty: "core",
    formulaTex: "\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du \\quad \\text{with } u = g(x)",
    explanation:
      "The chain rule in reverse. Spot an inner function whose derivative also appears as a factor, call it u, replace g'(x)dx by du, and integrate in u before substituting back. The tell-tale sign is a composite function multiplied by something proportional to the inner derivative — a constant factor difference is fine, you just rebalance it.",
    pitfalls: [
      "You must replace dx as well, via du = g'(x)dx. Leaving a stray dx is the usual mistake.",
      "Substitute back to x at the end — unless you also converted the limits of a definite integral.",
      "If the inner derivative is nowhere to be found (up to a constant), substitution will not work here.",
    ],
    derivation: [
      "\\text{From the chain rule: } \\big(F(g(x))\\big)' = F'(g(x))g'(x) = f(g(x))g'(x)",
      "\\text{Integrating both sides returns the substitution formula.}",
    ],
    examples: [
      {
        problemTex: "\\int 2x(x^2+1)^3 dx",
        steps: ["u = x^2+1, \\; du = 2x\\,dx", "\\int u^3 du = \\dfrac{u^4}{4}", "= \\dfrac{(x^2+1)^4}{4} + C"],
      },
    ],
    solve: [
      {
        promptTex: "\\int 2x \\, e^{x^2} \\, dx \\quad \\text{(omit + C)}",
        answer: "e^(x^2)",
        hints: ["Let u = x², so du = 2x dx.", "The integral becomes ∫eᵘdu = eᵘ."],
        solution: ["u = x^2, \\; du = 2x\\,dx", "\\int e^u du = e^u + C", "= e^{x^2} + C"],
      },
      {
        promptTex: "\\int 3x^2 (x^3+5)^4 dx \\quad \\text{(omit + C)}",
        answer: "(x^3+5)^5/5",
        hints: ["u = x³+5 gives du = 3x²dx — exactly the other factor.", "∫u⁴du = u⁵/5."],
        solution: ["u = x^3+5, \\; du = 3x^2 dx", "\\int u^4 du = \\dfrac{u^5}{5}", "= \\dfrac{(x^3+5)^5}{5} + C"],
      },
    ],
    mc: [
      {
        question: "Which substitution makes this integral solvable?",
        promptTex: "\\int \\dfrac{2x}{x^2+7}\\,dx",
        options: ["u = x^2+7", "u = 2x", "u = x^2", "u = \\ln(x^2+7)"],
        correctIndex: 0,
        hints: ["Look for the inner function whose derivative appears on top.", "(x²+7)' = 2x — that is exactly the numerator."],
        solution: ["u = x^2+7 \\Rightarrow du = 2x\\,dx", "\\int \\dfrac{du}{u} = \\ln|u| + C", "= \\ln(x^2+7) + C"],
      },
    ],
  }),

  rule({
    id: "int5",
    topic: "integration",
    category: "Techniques",
    title: "Integration by Parts",
    difficulty: "advanced",
    formulaTex: "\\int u\\,v'\\,dx = uv - \\int u'\\,v\\,dx",
    explanation:
      "The product rule in reverse, used when the integrand is a product of two unrelated functions. The art is choosing which factor is u: pick the one that gets simpler when differentiated. A polynomial times an exponential, or anything times a logarithm, are the standard cases — with ln(x) always taken as u, since differentiating it removes the log entirely.",
    derivation: [
      "(uv)' = u'v + uv'",
      "\\text{integrate both sides: } uv = \\int u'v\\,dx + \\int uv'\\,dx",
      "\\Rightarrow \\int uv'\\,dx = uv - \\int u'v\\,dx",
    ],
    pitfalls: [
      "Choosing u badly makes the new integral harder, not easier. If that happens, swap the roles and try again.",
      "The minus sign in front of the remaining integral is easy to lose.",
      "For ∫ln(x)dx, take u = ln(x) and v' = 1 — the trick is seeing the invisible factor of 1.",
    ],
    examples: [
      {
        problemTex: "\\int x e^x dx",
        steps: ["u = x, \\; v' = e^x", "u' = 1, \\; v = e^x", "xe^x - \\int e^x dx", "= xe^x - e^x + C"],
      },
    ],
    solve: [
      {
        promptTex: "\\int \\ln(x)\\,dx \\quad \\text{(omit + C)}",
        answer: "x*ln(x)-x",
        hints: ["Take u = ln(x) and v' = 1.", "Then uv = x·ln(x), and ∫u'v dx = ∫(1/x)·x dx = ∫1dx = x."],
        solution: ["u = \\ln x, \\; v' = 1 \\Rightarrow u' = \\tfrac1x, \\; v = x", "x\\ln x - \\int \\tfrac1x \\cdot x \\, dx", "= x\\ln x - x + C"],
      },
    ],
    mc: [
      {
        question: "Which choice of u is best here?",
        promptTex: "\\int x \\ln(x)\\, dx",
        options: ["u = \\ln x", "u = x", "u = x\\ln x", "\\text{either works equally}"],
        correctIndex: 0,
        hints: ["Pick the factor that gets simpler when differentiated.", "ln(x) differentiates to 1/x and the log disappears; x only becomes 1."],
        solution: ["u = \\ln x \\Rightarrow u' = \\tfrac1x", "v' = x \\Rightarrow v = \\tfrac{x^2}{2}", "\\tfrac{x^2}{2}\\ln x - \\int \\tfrac{x}{2}dx = \\tfrac{x^2}{2}\\ln x - \\tfrac{x^2}{4} + C"],
      },
    ],
  }),

  rule({
    id: "int6",
    topic: "integration",
    category: "Applications",
    title: "Area Between Curves",
    difficulty: "core",
    formulaTex: "A = \\int_a^b \\big(f(x) - g(x)\\big)\\,dx \\quad \\text{with } f \\ge g \\text{ on } [a,b]",
    explanation:
      "Integrate the upper curve minus the lower curve. The intersection points, found by solving f(x) = g(x), give the limits. If the curves swap over which is on top inside the interval, split the integral at each crossing and take the correct order in each piece — otherwise the parts cancel and you get a smaller number than the true area.",
    pitfalls: [
      "Upper minus lower. Reversing gives a negative 'area'.",
      "Find the intersections first — guessing the limits is where most of the marks go missing.",
    ],
    examples: [
      {
        problemTex: "\\text{between } y=x \\text{ and } y=x^2",
        steps: ["x = x^2 \\Rightarrow x=0, x=1", "\\int_0^1 (x - x^2)dx", "= \\left[\\tfrac{x^2}{2} - \\tfrac{x^3}{3}\\right]_0^1 = \\tfrac16"],
      },
    ],
    solve: [
      {
        promptTex: "\\int_0^1 \\big(2x - x^2\\big)\\, dx",
        answer: "2/3",
        hints: ["Antiderivative: x² − x³/3.", "At x=1: 1 − 1/3."],
        solution: ["F(x) = x^2 - \\dfrac{x^3}{3}", "F(1) - F(0) = 1 - \\tfrac13 = \\tfrac23"],
      },
    ],
    word: [
      {
        scenario:
          "Demand is P(q) = 100 − 2q and the market price is 60, so equilibrium quantity is q = 20. Compute the consumer surplus, the area between the demand curve and the price line from q = 0 to q = 20.",
        promptTex: "CS = \\int_0^{20}\\big(100 - 2q - 60\\big)\\,dq",
        answer: "400",
        unit: "€",
        hints: ["The integrand simplifies to 40 − 2q.", "F(q) = 40q − q²; evaluate at 20."],
        solution: [
          "\\int_0^{20}(40 - 2q)dq",
          "F(q) = 40q - q^2",
          "F(20) = 800 - 400 = 400",
        ],
      },
    ],
  }),
];
