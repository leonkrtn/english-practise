import { rule, type MathRule } from "./types";

export const MULTIVARIABLE_RULES: MathRule[] = [
  rule({
    id: "mv1",
    topic: "multivariable",
    category: "Partial derivatives",
    title: "Partial Derivative",
    difficulty: "core",
    formulaTex: "\\dfrac{\\partial f}{\\partial x} = f_x \\quad \\text{differentiate w.r.t. } x, \\text{ treating } y \\text{ as constant}",
    explanation:
      "With several variables you differentiate one at a time and freeze the others. To find ∂f/∂x, treat y exactly as you would treat the number 5: it does not differentiate, it just rides along. Economically, a partial derivative is the effect of changing one input while holding everything else fixed — the ceteris paribus assumption made precise.",
    pitfalls: [
      "y is a constant when differentiating by x, so (3y²)ₓ = 0, not 6y.",
      "But a product like xy differentiates by x to y — the constant y stays as a factor.",
      "∂ is not d. The curly symbol signals that other variables are being held fixed.",
    ],
    examples: [
      { problemTex: "f(x,y) = x^2 y + 3y^2", steps: ["f_x = 2xy", "f_y = x^2 + 6y"] },
      { problemTex: "f(x,y) = x^3 + 5y", steps: ["f_x = 3x^2", "f_y = 5"] },
    ],
    solve: [
      {
        promptTex: "f(x,y) = x^2 y^3, \\quad \\text{find } f_x",
        answer: "2*x*y^3",
        hints: ["Treat y³ as a constant multiplying x².", "(x²)' = 2x, so the answer is 2x·y³."],
        solution: ["f_x = 2x \\cdot y^3"],
      },
      {
        promptTex: "f(x,y) = x^2 y^3, \\quad \\text{find } f_y",
        answer: "3*x^2*y^2",
        hints: ["Now x² is the constant.", "(y³)' = 3y²."],
        solution: ["f_y = x^2 \\cdot 3y^2 = 3x^2y^2"],
      },
      {
        promptTex: "f(x,y) = 4x + 7y^2, \\quad \\text{find } f_x",
        answer: "4",
        hints: ["The 7y² term is entirely constant with respect to x.", "So it differentiates to 0."],
        solution: ["f_x = 4 + 0 = 4"],
      },
    ],
    mc: [
      {
        question: "What is ∂f/∂x?",
        promptTex: "f(x,y) = 5y^2 + 2x",
        options: ["2", "10y", "10y + 2", "2x"],
        correctIndex: 0,
        hints: ["Is there an x in 5y²?", "No — so it is a constant and vanishes."],
        solution: ["f_x = 0 + 2 = 2"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Find } f_x \\text{ for } f(x,y)=x^2+y^2",
        lines: ["f(x,y) = x^2 + y^2", "f_x = 2x + 2y"],
        wrongLineIndex: 1,
        correctedLineTex: "f_x = 2x",
        explanation:
          "When differentiating with respect to x, the term y² is a constant and differentiates to 0. The 2y belongs to f_y, not f_x.",
      },
    ],
  }),

  rule({
    id: "mv2",
    topic: "multivariable",
    category: "Partial derivatives",
    title: "Second-Order Partials",
    difficulty: "advanced",
    formulaTex: "f_{xx} = \\dfrac{\\partial^2 f}{\\partial x^2} \\qquad f_{xy} = \\dfrac{\\partial^2 f}{\\partial y \\partial x} = f_{yx}",
    explanation:
      "Differentiating twice gives four second-order partials, but Schwarz's theorem says the two mixed ones are equal for any reasonably smooth function — so there are really only three distinct values. These assemble into the Hessian matrix, which plays the role the second derivative plays in one dimension: it decides whether a stationary point is a maximum, a minimum, or a saddle.",
    pitfalls: [
      "f_{xy} means differentiate by x first, then by y — but since the order does not matter, either reading gets you there.",
      "f_{xx} is not (f_x)². It is the derivative of f_x.",
    ],
    examples: [
      {
        problemTex: "f(x,y) = x^2y^3",
        steps: ["f_x = 2xy^3", "f_{xx} = 2y^3", "f_{xy} = 6xy^2"],
      },
    ],
    solve: [
      {
        promptTex: "f(x,y) = x^3 y, \\quad \\text{find } f_{xx}",
        answer: "6*x*y",
        hints: ["First f_x = 3x²y.", "Differentiate that by x again."],
        solution: ["f_x = 3x^2 y", "f_{xx} = 6xy"],
      },
      {
        promptTex: "f(x,y) = x^2 y^2, \\quad \\text{find } f_{xy}",
        answer: "4*x*y",
        hints: ["f_x = 2xy².", "Now differentiate by y: 2x·2y."],
        solution: ["f_x = 2xy^2", "f_{xy} = 4xy"],
      },
    ],
  }),

  rule({
    id: "mv3",
    topic: "multivariable",
    category: "Optimization",
    title: "Unconstrained Optimization",
    difficulty: "advanced",
    formulaTex: "f_x = f_y = 0 \\quad \\text{and} \\quad D = f_{xx}f_{yy} - f_{xy}^2",
    explanation:
      "Stationary points need every partial derivative to vanish simultaneously — solve the system f_x = 0, f_y = 0. Classification then uses the Hessian determinant D: if D > 0 and f_xx < 0 it is a maximum; D > 0 with f_xx > 0 is a minimum; D < 0 is a saddle point, a shape with no one-dimensional analogue, rising in one direction and falling in another. D = 0 is inconclusive.",
    pitfalls: [
      "D < 0 always means a saddle, regardless of the sign of f_xx.",
      "The mixed partial is SQUARED and subtracted in D — a sign slip there flips the whole classification.",
    ],
    examples: [
      {
        problemTex: "f(x,y) = x^2 + y^2",
        steps: ["f_x = 2x = 0, \\; f_y = 2y = 0 \\Rightarrow (0,0)", "f_{xx}=2,\\, f_{yy}=2,\\, f_{xy}=0", "D = 4 > 0, f_{xx}>0 \\Rightarrow \\text{minimum}"],
      },
    ],
    mc: [
      {
        question: "At a stationary point, D = −8. What kind of point is it?",
        promptTex: "D = f_{xx}f_{yy} - f_{xy}^2 = -8",
        options: ["\\text{a saddle point}", "\\text{a maximum}", "\\text{a minimum}", "\\text{inconclusive}"],
        correctIndex: 0,
        hints: ["A negative Hessian determinant has only one meaning.", "It rises in one direction and falls in another."],
        solution: ["D < 0 \\Rightarrow \\text{saddle point}"],
      },
    ],
    steps: [
      {
        promptTex: "f(x,y) = x^2 + y^2 - 4x",
        steps: [
          { instruction: "Solve f_x = 0 for x.", answer: "2", hint: "f_x = 2x − 4." },
          { instruction: "Solve f_y = 0 for y.", answer: "0", hint: "f_y = 2y." },
          { instruction: "With f_xx = 2, f_yy = 2, f_xy = 0, compute D.", answer: "4", hint: "D = 2·2 − 0²." },
        ],
        solution: [
          "f_x = 2x-4 = 0 \\Rightarrow x=2",
          "f_y = 2y = 0 \\Rightarrow y=0",
          "D = (2)(2) - 0^2 = 4 > 0, \\; f_{xx}=2>0",
          "\\Rightarrow \\text{minimum at } (2,0)",
        ],
      },
    ],
  }),

  rule({
    id: "mv4",
    topic: "multivariable",
    category: "Optimization",
    title: "Lagrange Multipliers",
    difficulty: "advanced",
    formulaTex: "\\mathcal{L}(x,y,\\lambda) = f(x,y) - \\lambda\\big(g(x,y) - c\\big)",
    explanation:
      "For optimisation under a constraint that cannot easily be substituted away, build the Lagrangian and set all three partial derivatives to zero. The multiplier λ is not just bookkeeping: it is the shadow price, telling you how much the optimal value of f would improve if the constraint c were relaxed by one unit — which is why it appears everywhere in constrained portfolio and production problems.",
    pitfalls: [
      "∂L/∂λ = 0 simply reproduces the constraint. Do not forget that third equation.",
      "Watch the sign convention: with the minus written as above, λ is positive for a binding resource constraint.",
    ],
    examples: [
      {
        problemTex: "\\max xy \\;\\text{s.t.}\\; x + y = 10",
        steps: [
          "\\mathcal{L} = xy - \\lambda(x+y-10)",
          "\\mathcal{L}_x = y - \\lambda = 0, \\; \\mathcal{L}_y = x - \\lambda = 0",
          "\\Rightarrow x = y, \\; \\text{with } x+y=10 \\Rightarrow x=y=5",
        ],
      },
    ],
    mc: [
      {
        question: "What does the multiplier λ represent at the optimum?",
        promptTex: "\\mathcal{L} = f - \\lambda(g - c)",
        options: [
          "\\text{the shadow price of the constraint}",
          "\\text{the optimal value of } f",
          "\\text{the slope of } f",
          "\\text{nothing — it is only a helper}",
        ],
        correctIndex: 0,
        hints: ["Think about what happens if c increases by one unit.", "λ = df*/dc — the marginal value of relaxing the constraint."],
        solution: ["\\lambda = \\dfrac{df^*}{dc}", "\\text{the marginal gain from one more unit of the constrained resource}"],
      },
    ],
    word: [
      {
        scenario:
          "Maximise utility U(x,y) = xy subject to the budget 2x + 4y = 40. How many units of x should be bought?",
        promptTex: "\\mathcal{L} = xy - \\lambda(2x + 4y - 40)",
        answer: "10",
        hints: ["From L_x = 0 and L_y = 0: y = 2λ and x = 4λ, so x = 2y.", "Substitute x = 2y into 2x + 4y = 40."],
        solution: [
          "\\mathcal{L}_x = y - 2\\lambda = 0, \\quad \\mathcal{L}_y = x - 4\\lambda = 0",
          "\\Rightarrow x = 2y",
          "2(2y) + 4y = 40 \\Rightarrow 8y = 40 \\Rightarrow y = 5",
          "x = 10",
        ],
      },
    ],
  }),
];
