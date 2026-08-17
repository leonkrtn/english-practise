import { rule, type MathRule } from "./types";

export const FINANCIAL_MATH_RULES: MathRule[] = [
  rule({
    id: "fm1",
    topic: "financial-math",
    category: "Compounding",
    title: "Compound Interest",
    difficulty: "foundation",
    formulaTex: "FV = PV(1 + i)^n",
    explanation:
      "Future value grows geometrically, not linearly, because each period's interest itself earns interest thereafter. The exponent is the number of compounding periods and the rate must match that period — an annual rate with monthly compounding means i/12 and 12n, not i and n. This single formula underlies essentially all of discounting.",
    derivation: [
      "\\text{after 1 period: } PV(1+i)",
      "\\text{after 2: } PV(1+i)(1+i) = PV(1+i)^2",
      "\\text{after } n: PV(1+i)^n",
    ],
    pitfalls: [
      "Rate and period must match. 6% annual compounded monthly is i = 0.005 over 12n periods.",
      "i is a decimal in the formula: 6% is 0.06, not 6.",
      "Growth is exponential — doubling the years far more than doubles the interest earned.",
    ],
    examples: [
      { problemTex: "PV = 1000, i = 5\\%, n = 2", steps: ["1000(1.05)^2", "= 1000 \\cdot 1.1025", "= 1102.50"] },
    ],
    solve: [
      {
        promptTex: "PV = 2000, \\; i = 10\\%, \\; n = 2. \\text{ Find } FV.",
        answer: "2420",
        hints: ["FV = 2000·(1.10)².", "1.1² = 1.21."],
        solution: ["FV = 2000(1.1)^2 = 2000 \\cdot 1.21", "= 2420"],
      },
    ],
    word: [
      {
        scenario:
          "€5,000 is invested at 8% per year with annual compounding for 3 years. What is the future value in euros (to the nearest euro)?",
        promptTex: "FV = 5000(1.08)^3",
        answer: "6298.56",
        accepted: ["6299", "6298.6", "6298"],
        hints: ["1.08³ ≈ 1.259712.", "Multiply that by 5,000."],
        solution: ["1.08^3 = 1.259712", "FV = 5000 \\cdot 1.259712 = 6298.56"],
      },
    ],
    mc: [
      {
        question: "An annual rate of 12% is compounded monthly. What goes into the formula?",
        promptTex: "FV = PV(1+i)^n",
        options: [
          "i = 0.01, \\; n = 12 \\text{ per year}",
          "i = 0.12, \\; n = 1 \\text{ per year}",
          "i = 0.12, \\; n = 12 \\text{ per year}",
          "i = 0.01, \\; n = 1 \\text{ per year}",
        ],
        correctIndex: 0,
        hints: ["The rate must be per compounding period.", "12% / 12 months = 1% per month, and 12 periods per year."],
        solution: ["i = \\dfrac{0.12}{12} = 0.01", "n = 12 \\text{ periods per year}"],
      },
    ],
  }),

  rule({
    id: "fm2",
    topic: "financial-math",
    category: "Discounting",
    title: "Present Value",
    difficulty: "foundation",
    formulaTex: "PV = \\dfrac{FV}{(1+i)^n}",
    explanation:
      "Discounting is compounding run backwards: what would you need today to reach a given amount later? A euro tomorrow is worth less than a euro today because today's euro can be invested, and the discount rate i quantifies exactly how much less. Everything in valuation — NPV, bond pricing, DCF — is this formula applied repeatedly.",
    pitfalls: [
      "Discounting DIVIDES by (1+i)ⁿ. Multiplying gives compounding, the opposite direction.",
      "A higher discount rate means a lower present value — the relationship is inverse.",
    ],
    examples: [
      { problemTex: "FV = 1100, i = 10\\%, n = 1", steps: ["PV = \\dfrac{1100}{1.1}", "= 1000"] },
    ],
    solve: [
      {
        promptTex: "FV = 1210, \\; i = 10\\%, \\; n = 2. \\text{ Find } PV.",
        answer: "1000",
        hints: ["Divide by 1.1² = 1.21.", "1210 / 1.21."],
        solution: ["PV = \\dfrac{1210}{1.21} = 1000"],
      },
    ],
    word: [
      {
        scenario:
          "You will receive €10,000 in 5 years. At a discount rate of 6%, what is that worth today, to the nearest euro?",
        promptTex: "PV = \\dfrac{10000}{1.06^5}",
        answer: "7472.58",
        accepted: ["7473", "7472.6", "7472"],
        hints: ["1.06⁵ ≈ 1.338226.", "10,000 divided by that."],
        solution: ["1.06^5 = 1.338226", "PV = \\dfrac{10000}{1.338226} \\approx 7472.58"],
      },
    ],
  }),

  rule({
    id: "fm3",
    topic: "financial-math",
    category: "Valuation",
    title: "Net Present Value",
    difficulty: "core",
    formulaTex: "NPV = -C_0 + \\sum_{t=1}^{n} \\dfrac{C_t}{(1+i)^t}",
    explanation:
      "Discount every future cash flow to today and subtract the initial outlay. NPV > 0 means the project earns more than the required return and should be accepted; NPV < 0 means it destroys value. It is the theoretically correct investment criterion precisely because it is additive and measured in currency rather than as a rate.",
    pitfalls: [
      "The initial investment C₀ is at t = 0 and is NOT discounted.",
      "Each cash flow gets its own exponent t — a single division by (1+i)ⁿ for the whole stream is wrong.",
      "Compare NPVs at the same discount rate; the rate is the hurdle, not an output.",
    ],
    examples: [
      {
        problemTex: "C_0 = 1000, \\; C_1 = 600, \\; C_2 = 600, \\; i = 10\\%",
        steps: ["-1000 + \\dfrac{600}{1.1} + \\dfrac{600}{1.21}", "= -1000 + 545.45 + 495.87", "= 41.32 > 0 \\Rightarrow \\text{accept}"],
      },
    ],
    word: [
      {
        scenario:
          "A project costs €1,000 today and returns €1,100 in one year. At a discount rate of 10%, what is its NPV in euros?",
        promptTex: "NPV = -1000 + \\dfrac{1100}{1.1}",
        answer: "0",
        unit: "€",
        hints: ["Discount the 1,100 back one year first.", "1100/1.1 = 1000, then subtract the 1,000 outlay."],
        solution: [
          "\\dfrac{1100}{1.1} = 1000",
          "NPV = -1000 + 1000 = 0",
          "\\text{exactly breaks even — the IRR equals the 10\\% hurdle}",
        ],
      },
    ],
    mc: [
      {
        question: "A project has NPV = −250 at the firm's cost of capital. What should the firm do?",
        promptTex: "NPV = -250",
        options: [
          "\\text{reject — it destroys value}",
          "\\text{accept — the loss is small}",
          "\\text{accept if the IRR is positive}",
          "\\text{cannot decide without the payback period}",
        ],
        correctIndex: 0,
        hints: ["NPV already accounts for the required return.", "Negative NPV means it returns less than the hurdle rate."],
        solution: ["NPV < 0 \\Rightarrow \\text{return below the cost of capital}", "\\Rightarrow \\text{reject}"],
      },
    ],
  }),

  rule({
    id: "fm4",
    topic: "financial-math",
    category: "Annuities",
    title: "Present Value of an Annuity",
    difficulty: "core",
    formulaTex: "PV = C \\cdot \\dfrac{1 - (1+i)^{-n}}{i}",
    explanation:
      "A closed form for the present value of n equal payments C, saving you from discounting each one separately. The fraction is called the annuity factor. It is the basis of loan and mortgage pricing: given a loan principal and a rate, rearranging for C gives the constant instalment that repays the loan exactly over n periods.",
    derivation: [
      "PV = \\sum_{t=1}^{n} \\dfrac{C}{(1+i)^t}",
      "\\text{a geometric series with ratio } \\dfrac{1}{1+i}",
      "\\Rightarrow PV = C\\cdot\\dfrac{1-(1+i)^{-n}}{i}",
    ],
    pitfalls: [
      "This is the ORDINARY annuity, with payments at period end. Payments at the start (annuity due) multiply the result by (1+i).",
      "The exponent is negative — the formula uses (1+i)^(−n), not (1+i)ⁿ.",
    ],
    examples: [
      {
        problemTex: "C = 100, i = 5\\%, n = 3",
        steps: ["100 \\cdot \\dfrac{1 - 1.05^{-3}}{0.05}", "= 100 \\cdot 2.7232", "= 272.32"],
      },
    ],
    word: [
      {
        scenario:
          "A loan is repaid with 4 annual end-of-year payments of €1,000 at an interest rate of 10%. What is the loan's present value, to the nearest euro?",
        promptTex: "PV = 1000 \\cdot \\dfrac{1-1.1^{-4}}{0.1}",
        answer: "3169.87",
        accepted: ["3170", "3169.9", "3169"],
        hints: ["1.1⁻⁴ ≈ 0.683013.", "(1 − 0.683013)/0.1 = 3.169865, times 1,000."],
        solution: [
          "1.1^{-4} = 0.683013",
          "\\dfrac{1-0.683013}{0.1} = 3.16987",
          "PV = 1000 \\cdot 3.16987 \\approx 3169.87",
        ],
      },
    ],
  }),

  rule({
    id: "fm5",
    topic: "financial-math",
    category: "Annuities",
    title: "Perpetuity and Growing Perpetuity",
    difficulty: "core",
    formulaTex: "PV = \\dfrac{C}{i} \\qquad PV_{\\text{growing}} = \\dfrac{C_1}{i - g} \\quad (g < i)",
    explanation:
      "A perpetuity pays forever, and remarkably its present value is finite — the discount factor shrinks fast enough for the infinite series to converge. Adding constant growth g gives the Gordon growth model, used for terminal values in DCF and for valuing dividend-paying stocks. It requires g < i; otherwise the series diverges and the formula returns a meaningless negative number.",
    pitfalls: [
      "C₁ is next period's cash flow, not this period's. With C₀ given, use C₀(1+g).",
      "g must be strictly less than i. A result that is negative or absurdly large usually means this was violated.",
      "The model is extremely sensitive to i − g when that gap is small.",
    ],
    derivation: [
      "PV = \\sum_{t=1}^{\\infty}\\dfrac{C}{(1+i)^t}",
      "\\text{geometric series with ratio } \\tfrac{1}{1+i} < 1",
      "= \\dfrac{C/(1+i)}{1 - 1/(1+i)} = \\dfrac{C}{i}",
    ],
    examples: [
      { problemTex: "C = 50, i = 8\\%", steps: ["PV = \\dfrac{50}{0.08}", "= 625"] },
      { problemTex: "C_1 = 5, i = 10\\%, g = 4\\%", steps: ["PV = \\dfrac{5}{0.10-0.04}", "= \\dfrac{5}{0.06} = 83.33"] },
    ],
    solve: [
      {
        promptTex: "C = 200, \\; i = 5\\%. \\text{ Find the perpetuity's } PV.",
        answer: "4000",
        hints: ["PV = C/i.", "200 / 0.05."],
        solution: ["PV = \\dfrac{200}{0.05} = 4000"],
      },
    ],
    word: [
      {
        scenario:
          "A stock will pay a dividend of €3 next year, growing at 3% per year forever. The required return is 9%. What is the fair value per share in euros?",
        promptTex: "P_0 = \\dfrac{D_1}{r - g}",
        answer: "50",
        unit: "€",
        hints: ["D₁ = 3 is already next year's dividend.", "3 / (0.09 − 0.03) = 3/0.06."],
        solution: ["P_0 = \\dfrac{3}{0.09 - 0.03}", "= \\dfrac{3}{0.06} = 50"],
      },
    ],
  }),

  rule({
    id: "fm6",
    topic: "financial-math",
    category: "Rates",
    title: "Effective Annual Rate",
    difficulty: "advanced",
    formulaTex: "EAR = \\left(1 + \\dfrac{i_{nom}}{m}\\right)^m - 1",
    explanation:
      "The nominal rate understates the true cost whenever interest compounds more than once a year, because the intra-year interest itself earns interest. The effective annual rate converts any quoted rate into the single annual rate producing the same growth, which is the only fair way to compare offers with different compounding frequencies. As m → ∞ this converges to continuous compounding, e^i − 1.",
    pitfalls: [
      "EAR is always ≥ the nominal rate, with equality only for annual compounding.",
      "Subtract the 1 at the end — forgetting it turns a rate into a growth factor.",
      "m is the number of compounding periods per year, not the number of years.",
    ],
    examples: [
      {
        problemTex: "i_{nom}=12\\%, \\text{ monthly } (m=12)",
        steps: ["(1 + 0.01)^{12} - 1", "= 1.12683 - 1", "= 12.68\\%"],
      },
    ],
    word: [
      {
        scenario:
          "A credit card quotes a nominal annual rate of 24%, compounded monthly. What is the effective annual rate, in percent to two decimals?",
        promptTex: "EAR = (1 + 0.02)^{12} - 1",
        answer: "26.82",
        accepted: ["0.2682", "26.8", "26.824"],
        hints: ["Monthly rate = 24%/12 = 2%.", "1.02¹² ≈ 1.268242, so EAR ≈ 26.82%."],
        solution: [
          "i_m = \\dfrac{0.24}{12} = 0.02",
          "(1.02)^{12} = 1.268242",
          "EAR = 26.82\\%",
        ],
      },
    ],
    mc: [
      {
        question: "Which offer is cheapest for a borrower?",
        promptTex: "\\text{A: } 10\\% \\text{ annual} \\quad \\text{B: } 9.8\\% \\text{ monthly} \\quad \\text{C: } 9.9\\% \\text{ quarterly}",
        options: [
          "\\text{A, at } EAR = 10.00\\%",
          "\\text{B, at } EAR \\approx 10.25\\%",
          "\\text{C, at } EAR \\approx 10.27\\%",
          "\\text{they are identical}",
        ],
        correctIndex: 0,
        hints: ["Convert each to an EAR before comparing.", "More frequent compounding raises the effective rate above the nominal one."],
        solution: [
          "A: 10.00\\%",
          "B: (1+0.098/12)^{12}-1 \\approx 10.25\\%",
          "C: (1+0.099/4)^{4}-1 \\approx 10.27\\%",
          "\\Rightarrow \\text{A is cheapest}",
        ],
      },
    ],
  }),

  rule({
    id: "fm7",
    topic: "financial-math",
    category: "Rates",
    title: "Internal Rate of Return",
    difficulty: "advanced",
    formulaTex: "0 = -C_0 + \\sum_{t=1}^{n}\\dfrac{C_t}{(1+IRR)^t}",
    explanation:
      "The IRR is the discount rate at which a project's NPV is exactly zero — its implied annualised return. Accept when IRR exceeds the cost of capital. It is intuitive and unit-free, but it has real defects: cash-flow streams that change sign more than once can have multiple IRRs, and it can rank mutually exclusive projects wrongly because it ignores scale. NPV is the safer criterion when they disagree.",
    pitfalls: [
      "IRR generally cannot be solved algebraically beyond two periods — it is found numerically.",
      "A higher IRR does not mean a better project. A small project can out-IRR a much more valuable large one.",
      "Non-conventional cash flows (multiple sign changes) can produce several valid IRRs.",
    ],
    examples: [
      {
        problemTex: "C_0 = 100, \\; C_1 = 110",
        steps: ["0 = -100 + \\dfrac{110}{1+r}", "1+r = 1.1", "r = 10\\%"],
      },
    ],
    word: [
      {
        scenario:
          "An investment costs €800 today and pays €920 in one year. What is its IRR, in percent?",
        promptTex: "0 = -800 + \\dfrac{920}{1+r}",
        answer: "15",
        unit: "%",
        hints: ["Set the present value of 920 equal to 800.", "920/800 = 1.15, so r = 0.15."],
        solution: ["\\dfrac{920}{1+r} = 800", "1+r = \\dfrac{920}{800} = 1.15", "r = 15\\%"],
      },
    ],
    mc: [
      {
        question: "IRR = 14% and the cost of capital is 9%. What does that imply?",
        promptTex: "IRR = 14\\%, \\quad i = 9\\%",
        options: [
          "NPV > 0 \\text{ at } 9\\% \\Rightarrow \\text{accept}",
          "NPV < 0 \\Rightarrow \\text{reject}",
          "NPV = 0",
          "\\text{cannot be determined}",
        ],
        correctIndex: 0,
        hints: ["NPV is zero exactly at the IRR.", "Discounting at a rate below the IRR leaves a positive NPV."],
        solution: ["NPV(14\\%) = 0", "\\text{discounting at the lower } 9\\% \\Rightarrow NPV > 0", "\\Rightarrow \\text{accept}"],
      },
    ],
  }),
];
