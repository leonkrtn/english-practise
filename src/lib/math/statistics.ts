import { rule, type MathRule } from "./types";

export const STATISTICS_RULES: MathRule[] = [
  rule({
    id: "st1",
    topic: "statistics",
    category: "Descriptive statistics",
    title: "Mean, Median and Mode",
    difficulty: "foundation",
    formulaTex: "\\bar{x} = \\dfrac{1}{n}\\sum_{i=1}^{n} x_i",
    explanation:
      "The mean is the arithmetic average, the median the middle value once sorted, the mode the most frequent value. They differ in robustness: a single extreme observation drags the mean a long way but barely moves the median, which is why income and asset-return data are usually reported by median. A mean well above the median signals a right-skewed distribution.",
    pitfalls: [
      "Sort the data before reading off the median. Reading the middle of an unsorted list is meaningless.",
      "With an even count, the median is the average of the two middle values.",
      "Averaging growth rates needs the geometric mean, not the arithmetic one.",
    ],
    examples: [
      { problemTex: "\\{2, 4, 4, 6, 9\\}", steps: ["\\bar{x} = \\dfrac{25}{5} = 5", "\\text{median} = 4", "\\text{mode} = 4"] },
    ],
    solve: [
      {
        promptTex: "\\text{Mean of } \\{4, 8, 10, 14\\}",
        answer: "9",
        hints: ["Add them all up first.", "36 divided by 4."],
        solution: ["\\dfrac{4+8+10+14}{4} = \\dfrac{36}{4} = 9"],
      },
      {
        promptTex: "\\text{Median of } \\{7, 2, 9, 4, 5\\}",
        answer: "5",
        hints: ["Sort first: 2, 4, 5, 7, 9.", "Five values — the third one is the middle."],
        solution: ["\\text{sorted: } 2,4,5,7,9", "\\text{median} = 5"],
      },
    ],
    mc: [
      {
        question: "A dataset has mean 50 and median 30. What does this suggest?",
        promptTex: "\\bar{x} = 50, \\; \\text{median} = 30",
        options: [
          "\\text{right-skewed — a few large outliers}",
          "\\text{left-skewed}",
          "\\text{perfectly symmetric}",
          "\\text{the data must be wrong}",
        ],
        correctIndex: 0,
        hints: ["Which measure is dragged by extreme values?", "The mean sits above the median, so large values pull it up."],
        solution: ["\\bar{x} > \\text{median} \\Rightarrow \\text{right (positive) skew}"],
      },
    ],
  }),

  rule({
    id: "st2",
    topic: "statistics",
    category: "Descriptive statistics",
    title: "Variance and Standard Deviation",
    difficulty: "core",
    formulaTex: "\\sigma^2 = \\dfrac{1}{n}\\sum (x_i - \\bar{x})^2 \\qquad s^2 = \\dfrac{1}{n-1}\\sum (x_i - \\bar{x})^2",
    explanation:
      "Variance is the mean squared deviation from the mean; the standard deviation is its square root, which restores the original units and is therefore what gets reported. The n−1 version is the sample variance: dividing by n−1 rather than n corrects a downward bias that arises because the sample mean is itself estimated from the same data. In finance, standard deviation of returns is the standard measure of volatility.",
    pitfalls: [
      "Population divides by n, sample by n−1. Using the wrong one is the most common exam slip.",
      "Standard deviation is the ROOT of the variance — do not report one for the other.",
      "Deviations are squared, so variance is never negative.",
    ],
    derivation: [
      "\\sigma^2 = E[(X-\\mu)^2] = E[X^2] - \\mu^2",
      "\\text{the second form is usually faster to compute by hand}",
    ],
    examples: [
      {
        problemTex: "\\{2, 4, 6\\} \\text{ (population)}",
        steps: ["\\bar{x} = 4", "\\sigma^2 = \\dfrac{(2-4)^2+(4-4)^2+(6-4)^2}{3} = \\dfrac{8}{3}", "\\sigma \\approx 1.63"],
      },
    ],
    solve: [
      {
        promptTex: "\\text{Population variance of } \\{1, 3, 5\\}",
        answer: "8/3",
        accepted: ["2.667", "2.6667"],
        hints: ["The mean is 3.", "Deviations are −2, 0, 2; squares 4, 0, 4; divide 8 by 3."],
        solution: ["\\bar{x} = 3", "\\sigma^2 = \\dfrac{4+0+4}{3} = \\dfrac{8}{3}"],
      },
      {
        promptTex: "\\text{Sample variance of } \\{1, 3, 5\\}",
        answer: "4",
        hints: ["Same numerator as before: 8.", "But divide by n−1 = 2."],
        solution: ["s^2 = \\dfrac{8}{3-1} = \\dfrac{8}{2} = 4"],
      },
    ],
    mc: [
      {
        question: "Why does the sample variance divide by n − 1?",
        promptTex: "s^2 = \\dfrac{\\sum(x_i-\\bar{x})^2}{n-1}",
        options: [
          "\\text{to correct the downward bias from estimating } \\bar{x}",
          "\\text{to make the number larger for safety}",
          "\\text{because } n \\text{ could be zero}",
          "\\text{it is an arbitrary convention}",
        ],
        correctIndex: 0,
        hints: ["The sample mean is itself estimated from the same data.", "That uses up one degree of freedom."],
        solution: [
          "\\bar{x} \\text{ minimises } \\sum(x_i-c)^2",
          "\\Rightarrow \\text{deviations around it are too small on average}",
          "\\Rightarrow \\text{divide by } n-1 \\text{ to correct}",
        ],
      },
    ],
    word: [
      {
        scenario:
          "A portfolio returned 4%, 8% and 12% over three years. What is the population standard deviation of these returns, in percentage points?",
        answer: "sqrt(32/3)",
        accepted: ["3.266", "3.27", "3.2660"],
        hints: ["Mean = 8%. Deviations: −4, 0, +4.", "Variance = (16 + 0 + 16)/3 = 32/3; take the root."],
        solution: [
          "\\bar{x} = 8\\%",
          "\\sigma^2 = \\dfrac{16+0+16}{3} = \\dfrac{32}{3} \\approx 10.67",
          "\\sigma = \\sqrt{10.67} \\approx 3.27 \\text{ pp}",
        ],
      },
    ],
  }),

  rule({
    id: "st3",
    topic: "statistics",
    category: "Probability",
    title: "Expected Value",
    difficulty: "core",
    formulaTex: "E[X] = \\sum_i x_i \\, p_i \\qquad E[aX+b] = aE[X]+b",
    explanation:
      "The probability-weighted average of the outcomes — what you would get per trial on average over many repetitions. Expectation is linear, which is its most useful property: E[aX + bY] = aE[X] + bE[Y] holds whether or not X and Y are independent. Variance has no such convenience, which is exactly why diversification is interesting.",
    pitfalls: [
      "The probabilities must sum to 1. Check before computing.",
      "E[X] need not be an attainable outcome — the expected value of a die roll is 3.5.",
      "E[XY] = E[X]E[Y] requires independence; the linearity rule does not.",
    ],
    examples: [
      {
        problemTex: "X: 0 \\text{ w.p. } 0.5,\\; 10 \\text{ w.p. } 0.5",
        steps: ["E[X] = 0(0.5) + 10(0.5)", "= 5"],
      },
    ],
    solve: [
      {
        promptTex: "X = 2 \\text{ w.p. } 0.3, \\; 8 \\text{ w.p. } 0.7. \\text{ Find } E[X].",
        answer: "6.2",
        hints: ["Multiply each outcome by its probability.", "0.6 + 5.6."],
        solution: ["E[X] = 2(0.3) + 8(0.7)", "= 0.6 + 5.6 = 6.2"],
      },
    ],
    word: [
      {
        scenario:
          "An investment pays €1,000 with probability 0.6 and loses €500 with probability 0.4. What is the expected payoff in euros?",
        promptTex: "E[X] = \\sum x_i p_i",
        answer: "400",
        unit: "€",
        hints: ["A loss enters as a negative outcome.", "1000(0.6) + (−500)(0.4) = 600 − 200."],
        solution: ["E[X] = 1000(0.6) + (-500)(0.4)", "= 600 - 200 = 400"],
      },
    ],
    mc: [
      {
        question: "Which identity holds even when X and Y are dependent?",
        promptTex: "X, Y \\text{ random variables}",
        options: [
          "E[X+Y] = E[X]+E[Y]",
          "E[XY] = E[X]E[Y]",
          "\\mathrm{Var}[X+Y] = \\mathrm{Var}[X]+\\mathrm{Var}[Y]",
          "\\text{none of them}",
        ],
        correctIndex: 0,
        hints: ["Expectation is linear without conditions.", "The other two need independence (or zero covariance)."],
        solution: [
          "E[X+Y] = E[X]+E[Y] \\quad \\text{always}",
          "\\mathrm{Var}[X+Y] = \\mathrm{Var}X + \\mathrm{Var}Y + 2\\mathrm{Cov}(X,Y)",
        ],
      },
    ],
  }),

  rule({
    id: "st4",
    topic: "statistics",
    category: "Probability",
    title: "Covariance and Correlation",
    difficulty: "advanced",
    formulaTex: "\\mathrm{Cov}(X,Y) = E[XY]-E[X]E[Y] \\qquad \\rho = \\dfrac{\\mathrm{Cov}(X,Y)}{\\sigma_X \\sigma_Y}",
    explanation:
      "Covariance measures whether two variables move together, but its magnitude depends on the units and is therefore hard to interpret. Correlation normalises it into [−1, 1], making it comparable across any pair of assets. ρ = 0 means no LINEAR relationship — it does not mean independence, since a perfect non-linear relationship can still have zero correlation.",
    pitfalls: [
      "Correlation zero does not imply independence. It only rules out a linear relationship.",
      "Correlation is not causation, and it is not the slope of a regression line either.",
      "ρ is always between −1 and 1; a value outside that range means an arithmetic error.",
    ],
    examples: [
      {
        problemTex: "\\sigma_X = 4, \\sigma_Y = 5, \\mathrm{Cov} = 10",
        steps: ["\\rho = \\dfrac{10}{4 \\cdot 5}", "= 0.5"],
      },
    ],
    solve: [
      {
        promptTex: "\\mathrm{Cov}(X,Y) = 12, \\; \\sigma_X = 3, \\; \\sigma_Y = 8. \\text{ Find } \\rho.",
        answer: "0.5",
        accepted: ["1/2"],
        hints: ["Divide the covariance by the product of the standard deviations.", "12 / 24."],
        solution: ["\\rho = \\dfrac{12}{3 \\cdot 8} = \\dfrac{12}{24} = 0.5"],
      },
    ],
    word: [
      {
        scenario:
          "A two-asset portfolio holds 50% in A and 50% in B. Both have a standard deviation of 20%, and their correlation is 0. What is the portfolio's standard deviation, in percent?",
        promptTex: "\\sigma_P^2 = w_A^2\\sigma_A^2 + w_B^2\\sigma_B^2 + 2w_Aw_B\\rho\\sigma_A\\sigma_B",
        answer: "sqrt(200)",
        accepted: ["14.142", "14.14", "10*sqrt(2)"],
        hints: ["With ρ = 0 the last term vanishes.", "σ² = 0.25(400) + 0.25(400) = 200."],
        solution: [
          "\\sigma_P^2 = 0.25(400) + 0.25(400) + 0",
          "= 200",
          "\\sigma_P = \\sqrt{200} \\approx 14.14\\%",
          "\\text{below 20\\% — that is the diversification benefit}",
        ],
      },
    ],
    mc: [
      {
        question: "ρ(X,Y) = 0. What follows?",
        promptTex: "\\rho(X,Y) = 0",
        options: [
          "\\text{no linear relationship, but possibly a non-linear one}",
          "X \\text{ and } Y \\text{ are independent}",
          "X \\text{ and } Y \\text{ are unrelated in every sense}",
          "\\mathrm{Var}(X) = 0",
        ],
        correctIndex: 0,
        hints: ["Correlation only detects straight-line association.", "Y = X² over a symmetric range has ρ = 0 but is perfectly determined."],
        solution: ["\\rho = 0 \\Rightarrow \\text{no LINEAR relationship}", "\\text{Independence is strictly stronger.}"],
      },
    ],
  }),

  rule({
    id: "st5",
    topic: "statistics",
    category: "Distributions",
    title: "Normal Distribution and z-Scores",
    difficulty: "core",
    formulaTex: "z = \\dfrac{x - \\mu}{\\sigma} \\qquad X \\sim N(\\mu, \\sigma^2)",
    explanation:
      "The z-score expresses a value as a number of standard deviations from the mean, converting any normal distribution into the standard N(0,1) so a single table serves them all. The rule of thumb worth memorising: roughly 68% of the mass lies within one standard deviation, 95% within two, and 99.7% within three.",
    pitfalls: [
      "Divide by σ, the standard deviation — not by σ², the variance.",
      "A negative z simply means below the mean; it is not an error.",
      "The 68–95–99.7 rule applies to the normal distribution only.",
    ],
    examples: [
      { problemTex: "x = 130, \\mu = 100, \\sigma = 15", steps: ["z = \\dfrac{130-100}{15}", "= 2"] },
    ],
    solve: [
      {
        promptTex: "x = 85, \\; \\mu = 70, \\; \\sigma = 5. \\text{ Find } z.",
        answer: "3",
        hints: ["Subtract the mean first: 85 − 70 = 15.", "Then divide by σ = 5."],
        solution: ["z = \\dfrac{85-70}{5} = 3"],
      },
      {
        promptTex: "x = 60, \\; \\mu = 80, \\; \\sigma = 10. \\text{ Find } z.",
        answer: "-2",
        hints: ["The value is below the mean, so z will be negative.", "(60 − 80)/10."],
        solution: ["z = \\dfrac{60-80}{10} = -2"],
      },
    ],
    mc: [
      {
        question: "Approximately what share of a normal distribution lies within ±2σ of the mean?",
        promptTex: "P(\\mu - 2\\sigma < X < \\mu + 2\\sigma)",
        options: ["\\approx 95\\%", "\\approx 68\\%", "\\approx 99.7\\%", "\\approx 50\\%"],
        correctIndex: 0,
        hints: ["Recall the 68–95–99.7 rule.", "One σ ≈ 68%, two σ ≈ 95%, three σ ≈ 99.7%."],
        solution: ["\\pm1\\sigma \\approx 68\\%", "\\pm2\\sigma \\approx 95\\%", "\\pm3\\sigma \\approx 99.7\\%"],
      },
    ],
  }),

  rule({
    id: "st6",
    topic: "statistics",
    category: "Regression",
    title: "Simple Linear Regression",
    difficulty: "advanced",
    formulaTex: "\\hat{y} = \\alpha + \\beta x \\qquad \\beta = \\dfrac{\\mathrm{Cov}(x,y)}{\\mathrm{Var}(x)} \\qquad \\alpha = \\bar{y} - \\beta\\bar{x}",
    explanation:
      "Ordinary least squares fits the line minimising the sum of squared vertical distances to the data. The slope β is the covariance divided by the variance of the regressor — in finance, regressing a stock's returns on the market's gives exactly the CAPM beta. R² then reports the share of variance the line explains, and equals ρ² in the simple one-regressor case.",
    pitfalls: [
      "β divides by Var(x), the regressor's variance — not by Var(y) and not by σ_xσ_y (that would be correlation).",
      "The regression line always passes through (x̄, ȳ), which is what the α formula encodes.",
      "High R² does not validate the model; it only says the line fits these points.",
    ],
    examples: [
      {
        problemTex: "\\mathrm{Cov}=6, \\mathrm{Var}(x)=3, \\bar{x}=2, \\bar{y}=10",
        steps: ["\\beta = \\dfrac{6}{3} = 2", "\\alpha = 10 - 2(2) = 6", "\\hat{y} = 6 + 2x"],
      },
    ],
    solve: [
      {
        promptTex: "\\mathrm{Cov}(x,y) = 15, \\; \\mathrm{Var}(x) = 5. \\text{ Find } \\beta.",
        answer: "3",
        hints: ["β = Cov(x,y)/Var(x).", "15 divided by 5."],
        solution: ["\\beta = \\dfrac{15}{5} = 3"],
      },
    ],
    word: [
      {
        scenario:
          "A stock's returns are regressed on market returns. Cov(stock, market) = 0.024 and the market's variance is 0.016. What is the stock's beta?",
        promptTex: "\\beta = \\dfrac{\\mathrm{Cov}(r_i, r_m)}{\\mathrm{Var}(r_m)}",
        answer: "1.5",
        hints: ["Apply the regression-slope formula directly.", "0.024 / 0.016."],
        solution: [
          "\\beta = \\dfrac{0.024}{0.016} = 1.5",
          "\\text{the stock is 50\\% more volatile than the market}",
        ],
      },
    ],
  }),
];
