import { MATH_RULES_BY_ID } from "../math";
import type { MemoFormulaCloze, MemoMc, MemoRule, MemoSetId } from "./types";

/**
 * Formula sheets, memorised rather than applied.
 *
 * These rules are NOT authored from scratch — they are projected from the Mathematics content, so
 * the formula, title and explanation live in exactly one place. Crucially the memo rule keeps the
 * math rule's id, which means both modes read and write the same `word_progress` row: mastering the
 * chain rule in Mathematics marks it learned here too, and vice versa. That is the shared-progress
 * behaviour, and it falls out of the id rather than needing any syncing code.
 *
 * Only the memorisation-specific parts are authored below: which piece of the formula to blank out,
 * and which wrong formulas make good distractors. Both are chosen to hit the actual confusions —
 * quotient-rule term order, ln(a) multiplying versus dividing, the missing inner derivative.
 */
interface FormulaSpec {
  /** The Mathematics rule id. Shared with that mode's progress. */
  ruleId: string;
  formulaCloze: MemoFormulaCloze[];
  mc: MemoMc[];
}

const DIFFERENTIATION: FormulaSpec[] = [
  {
    ruleId: "mr1",
    formulaCloze: [
      {
        templateTex: "(k)' = \\square",
        options: ["0", "1", "k", "k'"],
        correctIndex: 0,
        explanation: "A constant does not change as x changes, so its rate of change is zero.",
      },
    ],
    mc: [
      {
        question: "Which is the derivative of a constant?",
        options: ["(k)' = 0", "(k)' = k", "(k)' = 1", "(k)' = kx"],
        correctIndex: 0,
        explanation: "Zero — including for π, e and ln(2), however complicated the constant looks.",
      },
    ],
  },
  {
    ruleId: "mr2",
    formulaCloze: [
      {
        templateTex: "(x^k)' = \\square",
        options: ["kx^{k-1}", "kx^{k+1}", "x^{k-1}", "\\frac{x^{k+1}}{k+1}"],
        correctIndex: 0,
        explanation: "Exponent down as a factor, then reduce it by one. The last option is the integral, not the derivative.",
      },
      {
        templateTex: "(x^k)' = k\\,\\square",
        options: ["x^{k-1}", "x^{k}", "x^{k+1}", "kx"],
        correctIndex: 0,
        explanation: "The exponent drops by exactly one.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["(x^5)' = 5x^4", "(x^5)' = 5x^6", "(x^5)' = x^4", "(x^5)' = 4x^5"],
        correctIndex: 0,
        explanation: "Bring the 5 down, reduce the exponent to 4.",
      },
    ],
  },
  {
    ruleId: "mr3",
    formulaCloze: [
      {
        templateTex: "(kf)' = \\square",
        options: ["kf'", "k'f", "k'f'", "kf"],
        correctIndex: 0,
        explanation: "The constant passes through untouched — you do not also differentiate it.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["(5x^2)' = 10x", "(5x^2)' = 5x", "(5x^2)' = 2x", "(5x^2)' = 0"],
        correctIndex: 0,
        explanation: "5 · 2x = 10x. The constant multiplies the derivative; it does not vanish.",
      },
    ],
  },
  {
    ruleId: "mr4",
    formulaCloze: [
      {
        templateTex: "(f \\pm g)' = \\square",
        options: ["f' \\pm g'", "f' \\times g'", "f'g + fg'", "(f \\pm g)"],
        correctIndex: 0,
        explanation: "Sums and differences differentiate term by term — the terms never interact.",
      },
    ],
    mc: [
      {
        question: "Which rule applies to a sum of terms?",
        options: ["(f \\pm g)' = f' \\pm g'", "(f \\pm g)' = f'g'", "(f \\pm g)' = f' \\times g + f \\times g'", "(f \\pm g)' = \\frac{f'}{g'}"],
        correctIndex: 0,
        explanation: "Differentiate each term separately and keep the signs.",
      },
    ],
  },
  {
    ruleId: "mr5",
    formulaCloze: [
      {
        templateTex: "(f \\times g)' = f' \\times g + \\square",
        options: ["f \\times g'", "f' \\times g'", "f \\times g", "g \\times g'"],
        correctIndex: 0,
        explanation: "Keep the first factor, differentiate the second. Both terms are required.",
      },
      {
        templateTex: "(f \\times g)' = \\square + f \\times g'",
        options: ["f' \\times g", "f \\times g'", "f' \\times g'", "f \\times g"],
        correctIndex: 0,
        explanation: "Differentiate the first factor, keep the second.",
      },
    ],
    mc: [
      {
        question: "Which is the product rule?",
        options: [
          "(f \\times g)' = f'g + fg'",
          "(f \\times g)' = f'g'",
          "(f \\times g)' = f'g - fg'",
          "(f \\times g)' = \\frac{f'g - fg'}{g^2}",
        ],
        correctIndex: 0,
        explanation: "Not f'g' — check it on (x·x)' = 2x, where f'·g' would give 1. The last option is the quotient rule.",
      },
    ],
  },
  {
    ruleId: "mr6",
    formulaCloze: [
      {
        templateTex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{\\square}{g^2}",
        options: ["f' \\times g - f \\times g'", "f \\times g' - f' \\times g", "f' \\times g + f \\times g'", "f' \\times g' - f \\times g"],
        correctIndex: 0,
        explanation: "The derivative of the TOP comes first. Swapping the two terms negates the whole answer.",
      },
      {
        templateTex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{f' \\times g - f \\times g'}{\\square}",
        options: ["g^2", "g", "(g')^2", "(fg)^2"],
        correctIndex: 0,
        explanation: "The original denominator squared — not g′² and not (fg)².",
      },
    ],
    mc: [
      {
        question: "Which is the quotient rule?",
        options: [
          "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}",
          "\\left(\\frac{f}{g}\\right)' = \\frac{fg' - f'g}{g^2}",
          "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g}",
          "\\left(\\frac{f}{g}\\right)' = \\frac{f'}{g'}",
        ],
        correctIndex: 0,
        explanation: "Top's derivative first, bottom squared. Option 2 is the same expression with the sign flipped.",
      },
    ],
  },
  {
    ruleId: "mr7",
    formulaCloze: [
      {
        templateTex: "(f^n)' = nf^{n-1}\\,\\square",
        options: ["f'", "f", "n", "1"],
        correctIndex: 0,
        explanation: "The inner derivative is the part everyone forgets — without it you have done half the chain rule.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: [
          "\\left((3x+1)^5\\right)' = 15(3x+1)^4",
          "\\left((3x+1)^5\\right)' = 5(3x+1)^4",
          "\\left((3x+1)^5\\right)' = 5(3x+1)^6",
          "\\left((3x+1)^5\\right)' = 3(3x+1)^4",
        ],
        correctIndex: 0,
        explanation: "5(3x+1)⁴ times the inner derivative 3 gives 15(3x+1)⁴. Option 2 drops the inner derivative.",
      },
    ],
  },
  {
    ruleId: "mr8",
    formulaCloze: [
      {
        templateTex: "[f(g(x))]' = \\square \\times g'(x)",
        options: ["f'(g(x))", "f'(x)", "f(g'(x))", "f'(g'(x))"],
        correctIndex: 0,
        explanation: "Differentiate the outer function while leaving the inner one intact inside it.",
      },
      {
        templateTex: "[f(g(x))]' = f'(g(x)) \\times \\square",
        options: ["g'(x)", "g(x)", "f'(x)", "x"],
        correctIndex: 0,
        explanation: "Multiply by the inner function's own derivative — it multiplies from outside, never substitutes in.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["\\left(e^{x^2}\\right)' = 2xe^{x^2}", "\\left(e^{x^2}\\right)' = e^{2x}", "\\left(e^{x^2}\\right)' = 2xe^{2x}", "\\left(e^{x^2}\\right)' = x^2e^{x^2}"],
        correctIndex: 0,
        explanation: "The inner function x² stays intact in the exponent; the 2x multiplies from outside.",
      },
    ],
  },
  {
    ruleId: "mr9",
    formulaCloze: [
      {
        templateTex: "(e^f)' = \\square\\, e^f",
        options: ["f'", "f", "e", "\\ln f"],
        correctIndex: 0,
        explanation: "The exponential reproduces itself; you only carry along the exponent's derivative.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["(e^{3x})' = 3e^{3x}", "(e^{3x})' = e^{3x}", "(e^{3x})' = 3xe^{3x}", "(e^{3x})' = 3e^{2x}"],
        correctIndex: 0,
        explanation: "The exponent's derivative is 3, and the exponential itself is unchanged.",
      },
    ],
  },
  {
    ruleId: "mr10",
    formulaCloze: [
      {
        templateTex: "(a^f)' = f'\\,a^f\\,\\square",
        options: ["\\ln a", "\\ln f", "\\frac{1}{\\ln a}", "a"],
        correctIndex: 0,
        explanation: "The price of not using base e. Since ln(e) = 1, this factor disappears for e.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["(2^x)' = 2^x \\ln 2", "(2^x)' = x2^{x-1}", "(2^x)' = 2^x", "(2^x)' = \\frac{2^x}{\\ln 2}"],
        correctIndex: 0,
        explanation: "ln(a) MULTIPLIES here. Option 2 wrongly applies the power rule to a constant base; option 4 divides, which is the log rule.",
      },
    ],
  },
  {
    ruleId: "mr11",
    formulaCloze: [
      {
        templateTex: "(\\ln f)' = \\dfrac{\\square}{f}",
        options: ["f'", "1", "f", "\\ln f"],
        correctIndex: 0,
        explanation: "The inner derivative goes on top, the inner function underneath.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["(\\ln(x^2+4))' = \\frac{2x}{x^2+4}", "(\\ln(x^2+4))' = \\frac{x^2+4}{2x}", "(\\ln(x^2+4))' = \\frac{1}{x^2+4}", "(\\ln(x^2+4))' = 2x\\ln(x^2+4)"],
        correctIndex: 0,
        explanation: "f'/f, so the derivative 2x is the numerator and the inside is the denominator.",
      },
    ],
  },
  {
    ruleId: "mr12",
    formulaCloze: [
      {
        templateTex: "(\\log_a f)' = \\dfrac{f'}{\\square}",
        options: ["f \\ln a", "f", "a \\ln f", "\\ln a"],
        correctIndex: 0,
        explanation: "Here ln(a) DIVIDES. In the exponential rule it multiplies — that is the usual mix-up.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: [
          "(\\log_{10} x)' = \\frac{1}{x \\ln 10}",
          "(\\log_{10} x)' = \\frac{\\ln 10}{x}",
          "(\\log_{10} x)' = \\frac{1}{x}",
          "(\\log_{10} x)' = \\frac{1}{10x}",
        ],
        correctIndex: 0,
        explanation: "The base's natural log sits in the denominator alongside the inner function.",
      },
    ],
  },
];

const INTEGRATION: FormulaSpec[] = [
  {
    ruleId: "int1",
    formulaCloze: [
      {
        templateTex: "\\int x^n\\,dx = \\square + C",
        options: ["\\frac{x^{n+1}}{n+1}", "nx^{n-1}", "\\frac{x^{n-1}}{n-1}", "\\frac{x^n}{n}"],
        correctIndex: 0,
        explanation: "Raise the exponent, divide by the new exponent. Option 2 is the derivative — the opposite direction.",
      },
    ],
    mc: [
      {
        question: "Which value of n does the power rule for integration NOT cover?",
        options: ["n = -1", "n = 0", "n = \\tfrac12", "n = -2"],
        correctIndex: 0,
        explanation: "n = −1 makes the denominator n+1 zero. That single case is what ln|x| covers.",
      },
    ],
  },
  {
    ruleId: "int2",
    formulaCloze: [
      {
        templateTex: "\\int \\dfrac{1}{x}\\,dx = \\square + C",
        options: ["\\ln|x|", "\\ln x", "\\frac{1}{x^2}", "-\\frac{1}{x^2}"],
        correctIndex: 0,
        explanation: "The absolute value is what makes the formula valid on the negative branch too.",
      },
      {
        templateTex: "\\int a^x\\,dx = \\dfrac{a^x}{\\square} + C",
        options: ["\\ln a", "a", "x", "\\ln x"],
        correctIndex: 0,
        explanation: "Where differentiating a^x multiplies by ln(a), integrating divides by it.",
      },
    ],
    mc: [
      {
        question: "Which is correct?",
        options: ["\\int e^x dx = e^x + C", "\\int e^x dx = xe^{x-1} + C", "\\int e^x dx = \\frac{e^x}{x} + C", "\\int e^x dx = e^{x+1} + C"],
        correctIndex: 0,
        explanation: "e^x integrates to itself. But note ∫e^{kx}dx = e^{kx}/k.",
      },
    ],
  },
  {
    ruleId: "int3",
    formulaCloze: [
      {
        templateTex: "\\int_a^b f(x)\\,dx = \\square",
        options: ["F(b) - F(a)", "F(a) - F(b)", "F(b) + F(a)", "F(b) - F(a) + C"],
        correctIndex: 0,
        explanation: "Upper minus lower, in that order. The constant cancels, so a definite integral never carries one.",
      },
    ],
    mc: [
      {
        question: "What does a definite integral give when the curve dips below the x-axis?",
        options: [
          "\\text{signed area — the part below counts negative}",
          "\\text{total geometric area}",
          "\\text{always zero}",
          "\\text{an undefined result}",
        ],
        correctIndex: 0,
        explanation: "Split the integral at each crossing if you need the geometric area rather than the signed one.",
      },
    ],
  },
  {
    ruleId: "int4",
    formulaCloze: [
      {
        templateTex: "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,\\square",
        options: ["du", "dx", "dg", "u\\,du"],
        correctIndex: 0,
        explanation: "You must replace dx as well, via du = g'(x)dx. A stray dx is the usual mistake.",
      },
    ],
    mc: [
      {
        question: "Which substitution solves this integral?",
        options: ["u = x^2+7", "u = 2x", "u = x^2", "u = \\ln(x^2+7)"],
        correctIndex: 0,
        explanation: "For ∫2x/(x²+7)dx: the inner function's derivative is 2x, which is exactly the numerator.",
      },
    ],
  },
  {
    ruleId: "int5",
    formulaCloze: [
      {
        templateTex: "\\int u\\,v'\\,dx = uv - \\square",
        options: ["\\int u'\\,v\\,dx", "\\int u\\,v\\,dx", "\\int u'\\,v'\\,dx", "u'v"],
        correctIndex: 0,
        explanation: "The remaining integral swaps which factor is differentiated. Do not lose the minus sign.",
      },
    ],
    mc: [
      {
        question: "For ∫x·ln(x)dx, which choice of u is right?",
        options: ["u = \\ln x", "u = x", "u = x\\ln x", "u = dx"],
        correctIndex: 0,
        explanation: "Pick the factor that gets simpler when differentiated — ln(x) becomes 1/x and the log disappears.",
      },
    ],
  },
  {
    ruleId: "int6",
    formulaCloze: [
      {
        templateTex: "A = \\int_a^b \\square\\,dx",
        options: ["\\big(f(x) - g(x)\\big)", "\\big(g(x) - f(x)\\big)", "\\big(f(x) + g(x)\\big)", "f(x)g(x)"],
        correctIndex: 0,
        explanation: "Upper curve minus lower curve. Reversing gives a negative 'area'.",
      },
    ],
    mc: [
      {
        question: "Where do the limits of an area-between-curves integral come from?",
        options: [
          "\\text{solving } f(x) = g(x)",
          "\\text{the x-axis intercepts of } f",
          "\\text{always } 0 \\text{ and } 1",
          "\\text{the turning points of } f - g",
        ],
        correctIndex: 0,
        explanation: "The intersection points bound the region. Finding them first is where most of the marks live.",
      },
    ],
  },
];

const FINANCE: FormulaSpec[] = [
  {
    ruleId: "fm1",
    formulaCloze: [
      {
        templateTex: "FV = PV\\,\\square",
        options: ["(1+i)^n", "(1+i)n", "(1+in)", "(1+i)^{-n}"],
        correctIndex: 0,
        explanation: "Growth is exponential because each period's interest itself earns interest. Option 4 is discounting.",
      },
    ],
    mc: [
      {
        question: "A 12% annual rate compounded monthly. What goes into the formula?",
        options: ["i = 0.01,\\; n = 12 \\text{ per year}", "i = 0.12,\\; n = 1", "i = 0.12,\\; n = 12", "i = 0.01,\\; n = 1"],
        correctIndex: 0,
        explanation: "The rate must be per compounding period: 12%/12 = 1% per month, over 12 periods a year.",
      },
    ],
  },
  {
    ruleId: "fm2",
    formulaCloze: [
      {
        templateTex: "PV = \\dfrac{FV}{\\square}",
        options: ["(1+i)^n", "(1+i)n", "(1-i)^n", "i^n"],
        correctIndex: 0,
        explanation: "Discounting divides by the same factor compounding multiplies by.",
      },
    ],
    mc: [
      {
        question: "What happens to present value when the discount rate rises?",
        options: ["\\text{it falls}", "\\text{it rises}", "\\text{it is unchanged}", "\\text{it depends on } n"],
        correctIndex: 0,
        explanation: "The relationship is inverse — a bigger denominator gives a smaller present value.",
      },
    ],
  },
  {
    ruleId: "fm3",
    formulaCloze: [
      {
        templateTex: "NPV = -C_0 + \\sum_{t=1}^{n} \\dfrac{C_t}{\\square}",
        options: ["(1+i)^t", "(1+i)^n", "(1+i)", "(1+t)^i"],
        correctIndex: 0,
        explanation: "Each cash flow carries its own exponent t. One division by (1+i)ⁿ for the whole stream is wrong.",
      },
    ],
    mc: [
      {
        question: "Is the initial outlay C₀ discounted?",
        options: [
          "\\text{No — it occurs at } t=0",
          "\\text{Yes, by } (1+i)",
          "\\text{Yes, by } (1+i)^n",
          "\\text{Only if the project lasts over a year}",
        ],
        correctIndex: 0,
        explanation: "It is paid today, so it is already in present-value terms.",
      },
    ],
  },
  {
    ruleId: "fm4",
    formulaCloze: [
      {
        templateTex: "PV = C \\cdot \\dfrac{1 - \\square}{i}",
        options: ["(1+i)^{-n}", "(1+i)^{n}", "(1-i)^{-n}", "i^{-n}"],
        correctIndex: 0,
        explanation: "Note the NEGATIVE exponent — this is the closed form of a discounted geometric series.",
      },
    ],
    mc: [
      {
        question: "The standard annuity formula assumes payments occur when?",
        options: [
          "\\text{at the end of each period}",
          "\\text{at the start of each period}",
          "\\text{all at } t=0",
          "\\text{continuously}",
        ],
        correctIndex: 0,
        explanation: "That is the ordinary annuity. An annuity due (payments at the start) multiplies the result by (1+i).",
      },
    ],
  },
  {
    ruleId: "fm5",
    formulaCloze: [
      {
        templateTex: "PV_{\\text{growing}} = \\dfrac{C_1}{\\square}",
        options: ["i - g", "i + g", "g - i", "i \\cdot g"],
        correctIndex: 0,
        explanation: "Requires g < i, or the series diverges and the formula returns a meaningless negative number.",
      },
      {
        templateTex: "PV_{\\text{perpetuity}} = \\dfrac{C}{\\square}",
        options: ["i", "i^n", "1+i", "n"],
        correctIndex: 0,
        explanation: "Pays forever, yet the value is finite — the discount factor shrinks fast enough to converge.",
      },
    ],
    mc: [
      {
        question: "In the Gordon growth model, which cash flow is C₁?",
        options: [
          "\\text{next period's, not this period's}",
          "\\text{this period's}",
          "\\text{the average of all periods}",
          "\\text{the final period's}",
        ],
        correctIndex: 0,
        explanation: "If you are given C₀, use C₀(1+g).",
      },
    ],
  },
  {
    ruleId: "fm6",
    formulaCloze: [
      {
        templateTex: "EAR = \\left(1 + \\dfrac{i_{nom}}{m}\\right)^m \\square",
        options: ["- 1", "+ 1", "\\times m", "\\div m"],
        correctIndex: 0,
        explanation: "Subtracting one turns the growth factor back into a rate. Forgetting it is a common slip.",
      },
    ],
    mc: [
      {
        question: "How does the effective annual rate compare to the nominal rate?",
        options: [
          "EAR \\geq i_{nom},\\ \\text{equal only for annual compounding}",
          "EAR \\leq i_{nom}",
          "\\text{always equal}",
          "\\text{depends on the sign of } i_{nom}",
        ],
        correctIndex: 0,
        explanation: "More frequent compounding always raises the effective rate above the quoted one.",
      },
    ],
  },
  {
    ruleId: "fm7",
    formulaCloze: [
      {
        templateTex: "\\square = -C_0 + \\sum_{t=1}^{n}\\dfrac{C_t}{(1+IRR)^t}",
        options: ["0", "NPV", "IRR", "C_0"],
        correctIndex: 0,
        explanation: "The IRR is defined as the rate that makes NPV exactly zero.",
      },
    ],
    mc: [
      {
        question: "IRR = 14% and the cost of capital is 9%. What follows?",
        options: [
          "NPV > 0 \\text{ at } 9\\% \\Rightarrow \\text{accept}",
          "NPV < 0 \\Rightarrow \\text{reject}",
          "NPV = 0",
          "\\text{cannot be determined}",
        ],
        correctIndex: 0,
        explanation: "NPV is zero at the IRR, so discounting at a lower rate leaves a positive NPV.",
      },
    ],
  },
];

const STATISTICS: FormulaSpec[] = [
  {
    ruleId: "st1",
    formulaCloze: [
      {
        templateTex: "\\bar{x} = \\dfrac{1}{\\square}\\sum_{i=1}^{n} x_i",
        options: ["n", "n-1", "n+1", "\\sum x_i"],
        correctIndex: 0,
        explanation: "The mean divides by the full count. n−1 belongs to the sample variance, not the mean.",
      },
    ],
    mc: [
      {
        question: "A dataset has mean 50 and median 30. What does that indicate?",
        options: [
          "\\text{right-skewed — a few large outliers}",
          "\\text{left-skewed}",
          "\\text{perfectly symmetric}",
          "\\text{an arithmetic error}",
        ],
        correctIndex: 0,
        explanation: "The mean is dragged up by extreme values; the median is not.",
      },
    ],
  },
  {
    ruleId: "st2",
    formulaCloze: [
      {
        templateTex: "s^2 = \\dfrac{1}{\\square}\\sum (x_i - \\bar{x})^2",
        options: ["n-1", "n", "n+1", "2n"],
        correctIndex: 0,
        explanation: "The SAMPLE variance divides by n−1, because the mean was itself estimated from the same data.",
      },
      {
        templateTex: "\\sigma^2 = \\dfrac{1}{n}\\sum \\square",
        options: ["(x_i - \\bar{x})^2", "(x_i - \\bar{x})", "|x_i - \\bar{x}|", "x_i^2"],
        correctIndex: 0,
        explanation: "Deviations are squared, which is why variance is never negative.",
      },
    ],
    mc: [
      {
        question: "Which is the standard deviation?",
        options: ["\\sigma = \\sqrt{\\sigma^2}", "\\sigma = \\sigma^2", "\\sigma = \\frac{\\sigma^2}{n}", "\\sigma = (\\sigma^2)^2"],
        correctIndex: 0,
        explanation: "The root of the variance, which restores the original units — hence why it is what gets reported.",
      },
    ],
  },
  {
    ruleId: "st3",
    formulaCloze: [
      {
        templateTex: "E[X] = \\sum_i \\square",
        options: ["x_i\\,p_i", "x_i", "p_i", "\\frac{x_i}{p_i}"],
        correctIndex: 0,
        explanation: "Each outcome weighted by its probability. The probabilities must sum to 1.",
      },
    ],
    mc: [
      {
        question: "Which identity holds even when X and Y are dependent?",
        options: [
          "E[X+Y] = E[X]+E[Y]",
          "E[XY] = E[X]E[Y]",
          "\\mathrm{Var}[X+Y] = \\mathrm{Var}[X]+\\mathrm{Var}[Y]",
          "\\text{none of them}",
        ],
        correctIndex: 0,
        explanation: "Expectation is linear unconditionally. The other two need independence or zero covariance.",
      },
    ],
  },
  {
    ruleId: "st4",
    formulaCloze: [
      {
        templateTex: "\\rho = \\dfrac{\\mathrm{Cov}(X,Y)}{\\square}",
        options: ["\\sigma_X \\sigma_Y", "\\sigma_X^2", "\\sigma_X + \\sigma_Y", "\\mathrm{Var}(X)"],
        correctIndex: 0,
        explanation: "Dividing by both standard deviations normalises covariance into [−1, 1].",
      },
      {
        templateTex: "\\mathrm{Cov}(X,Y) = E[XY] - \\square",
        options: ["E[X]E[Y]", "E[X]+E[Y]", "E[X+Y]", "E[X]-E[Y]"],
        correctIndex: 0,
        explanation: "The product of the individual expectations, subtracted from the expectation of the product.",
      },
    ],
    mc: [
      {
        question: "ρ(X,Y) = 0. What follows?",
        options: [
          "\\text{no LINEAR relationship — possibly a non-linear one}",
          "X \\text{ and } Y \\text{ are independent}",
          "\\text{they are unrelated in every sense}",
          "\\mathrm{Var}(X) = 0",
        ],
        correctIndex: 0,
        explanation: "Correlation only detects straight-line association. Y = X² over a symmetric range has ρ = 0.",
      },
    ],
  },
  {
    ruleId: "st5",
    formulaCloze: [
      {
        templateTex: "z = \\dfrac{x - \\mu}{\\square}",
        options: ["\\sigma", "\\sigma^2", "n", "\\mu"],
        correctIndex: 0,
        explanation: "Divide by the standard deviation, NOT the variance.",
      },
    ],
    mc: [
      {
        question: "Roughly what share of a normal distribution lies within ±2σ?",
        options: ["\\approx 95\\%", "\\approx 68\\%", "\\approx 99.7\\%", "\\approx 50\\%"],
        correctIndex: 0,
        explanation: "The 68–95–99.7 rule: one σ ≈ 68%, two ≈ 95%, three ≈ 99.7%.",
      },
    ],
  },
  {
    ruleId: "st6",
    formulaCloze: [
      {
        templateTex: "\\beta = \\dfrac{\\mathrm{Cov}(x,y)}{\\square}",
        options: ["\\mathrm{Var}(x)", "\\mathrm{Var}(y)", "\\sigma_x \\sigma_y", "\\bar{x}"],
        correctIndex: 0,
        explanation: "Divides by the REGRESSOR's variance. Dividing by σxσy would give the correlation instead.",
      },
      {
        templateTex: "\\alpha = \\bar{y} - \\square",
        options: ["\\beta\\bar{x}", "\\beta", "\\bar{x}", "\\beta + \\bar{x}"],
        correctIndex: 0,
        explanation: "This encodes the fact that the regression line always passes through the point of means.",
      },
    ],
    mc: [
      {
        question: "Regressing a stock's returns on the market's gives which quantity as the slope?",
        options: ["\\text{the CAPM beta}", "\\text{the Sharpe ratio}", "\\text{the correlation}", "\\text{the alpha}"],
        correctIndex: 0,
        explanation: "Cov(rᵢ, rₘ) / Var(rₘ) is exactly the definition of beta.",
      },
    ],
  },
];

/** Projects a spec plus its Mathematics rule into a memo rule that shares that rule's id. */
function buildFormulaRules(setId: MemoSetId, specs: FormulaSpec[]): MemoRule[] {
  return specs.flatMap((spec) => {
    const source = MATH_RULES_BY_ID[spec.ruleId];
    // A content edit that removes a math rule should drop its formula card, not crash the app.
    if (!source) return [];
    return [
      {
        id: source.id,
        setId,
        category: source.category,
        title: source.title,
        // For a formula rule the statement is a gloss, not the thing memorised — the formula is.
        statement: source.explanation.split(". ")[0] + ".",
        explanation: source.explanation,
        formulaTex: source.formulaTex,
        display: "formula" as const,
        facts: [],
        cloze: [],
        formulaCloze: spec.formulaCloze,
        mc: spec.mc.map((m) => ({ ...m, optionsAreTex: true })),
        trueFalse: [],
        order: [],
        ...(source.pitfalls.length > 0 ? { mnemonic: source.pitfalls[0] } : {}),
      },
    ];
  });
}

export const DIFFERENTIATION_FORMULA_RULES = buildFormulaRules("differentiation-formulas", DIFFERENTIATION);
export const INTEGRATION_FORMULA_RULES = buildFormulaRules("integration-formulas", INTEGRATION);
export const FINANCE_FORMULA_RULES = buildFormulaRules("finance-formulas", FINANCE);
export const STATISTICS_FORMULA_RULES = buildFormulaRules("statistics-formulas", STATISTICS);
