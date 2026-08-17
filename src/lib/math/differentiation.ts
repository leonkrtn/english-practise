import { rule, type MathRule } from "./types";

export const DIFFERENTIATION_RULES: MathRule[] = [
  rule({
    id: "mr1",
    topic: "differentiation",
    category: "Basic rules",
    title: "Constant Rule",
    difficulty: "foundation",
    formulaTex: "(k)' = 0",
    explanation:
      "The derivative of a constant is zero. A derivative measures a rate of change, and a constant does not change as x moves — its graph is a horizontal line, whose slope is zero everywhere. This is also why any additive constant vanishes when you differentiate, and correspondingly why integration has to put an arbitrary constant back.",
    pitfalls: [
      "A constant multiplying a function does NOT vanish — (5x)' = 5, not 0. Only a standalone constant does.",
      "π, e and ln(2) are constants, however complicated they look. Their derivative is 0.",
    ],
    examples: [
      { problemTex: "(5)'", steps: ["0"] },
      { problemTex: "(\\pi^2)'", steps: ["\\text{a constant, however it is written}", "0"] },
    ],
    solve: [
      { promptTex: "f(x) = 7", answer: "0", hints: ["Does 7 change as x changes?"], solution: ["f'(x) = 0"] },
      { promptTex: "f(x) = -12", answer: "0", hints: ["Sign is irrelevant — it is still a constant."], solution: ["f'(x) = 0"] },
    ],
    mc: [
      {
        question: "What is the derivative?",
        promptTex: "f(x) = \\ln(5)",
        options: ["0", "\\dfrac{1}{5}", "\\dfrac{1}{x}", "5"],
        correctIndex: 0,
        hints: ["Is there an x anywhere in this expression?", "ln(5) is just a number ≈ 1.609."],
        solution: ["\\ln 5 \\text{ is a constant}", "f'(x) = 0"],
      },
    ],
  }),

  rule({
    id: "mr2",
    topic: "differentiation",
    category: "Basic rules",
    title: "Power Rule",
    difficulty: "foundation",
    formulaTex: "(x^k)' = kx^{k-1}",
    explanation:
      "Bring the exponent down as a factor, then reduce the exponent by one. This holds for every real exponent — negative, fractional, irrational — which is why you should rewrite roots and reciprocals as powers before differentiating: 1/x becomes x⁻¹ and differentiates to −x⁻², √x becomes x^(1/2) and differentiates to ½x^(−1/2).",
    derivation: [
      "\\text{From the difference quotient with the binomial theorem:}",
      "\\dfrac{(x+h)^k - x^k}{h} = \\dfrac{x^k + kx^{k-1}h + O(h^2) - x^k}{h}",
      "= kx^{k-1} + O(h) \\;\\xrightarrow{h \\to 0}\\; kx^{k-1}",
    ],
    pitfalls: [
      "The exponent drops by one — it is not halved, and it does not become zero.",
      "For a negative exponent, k−1 is more negative: (x⁻²)' = −2x⁻³, not −2x⁻¹.",
      "This is not the rule for a^x (a constant base). That is the exponential rule.",
    ],
    examples: [
      { problemTex: "(x^3)'", steps: ["3x^{3-1}", "3x^2"] },
      { problemTex: "\\left(\\dfrac{1}{x}\\right)'", steps: ["(x^{-1})'", "-1 \\cdot x^{-2}", "-\\dfrac{1}{x^2}"] },
      { problemTex: "(\\sqrt{x})'", steps: ["(x^{1/2})'", "\\tfrac{1}{2}x^{-1/2}", "\\dfrac{1}{2\\sqrt{x}}"] },
    ],
    solve: [
      { promptTex: "f(x) = x^4", answer: "4*x^3", hints: ["Bring the 4 down.", "Then reduce the exponent to 3."], solution: ["f'(x) = 4x^{3}"] },
      { promptTex: "f(x) = x^7", answer: "7*x^6", hints: ["Same pattern: coefficient 7."], solution: ["f'(x) = 7x^{6}"] },
      {
        promptTex: "f(x) = \\dfrac{1}{x^2}",
        answer: "-2/x^3",
        accepted: ["-2*x^(-3)"],
        hints: ["Rewrite it as a power with a negative exponent first.", "1/x² = x⁻², and the rule gives −2x⁻³."],
        solution: ["f(x) = x^{-2}", "f'(x) = -2x^{-3} = -\\dfrac{2}{x^3}"],
      },
    ],
    simplify: [{ promptTex: "2x^3 + 3x^3", answer: "5*x^3", hints: ["Same power — just add the coefficients."], solution: ["= 5x^3"] }],
    mc: [
      {
        question: "Which is the derivative?",
        promptTex: "f(x) = \\sqrt{x}",
        options: ["\\dfrac{1}{2\\sqrt{x}}", "\\dfrac{1}{2}\\sqrt{x}", "2\\sqrt{x}", "\\dfrac{1}{\\sqrt{x}}"],
        correctIndex: 0,
        hints: ["Rewrite √x as x^(1/2).", "The rule gives ½·x^(−1/2), which is 1/(2√x)."],
        solution: ["f(x) = x^{1/2}", "f'(x) = \\tfrac12 x^{-1/2} = \\dfrac{1}{2\\sqrt{x}}"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Differentiate } f(x) = x^{-3}",
        lines: ["f(x) = x^{-3}", "f'(x) = -3x^{-2}"],
        wrongLineIndex: 1,
        correctedLineTex: "f'(x) = -3x^{-4}",
        explanation:
          "The exponent must be reduced by one: −3 − 1 = −4, not −2. With negative exponents, 'one less' moves further from zero, not toward it.",
      },
    ],
  }),

  rule({
    id: "mr3",
    topic: "differentiation",
    category: "Basic rules",
    title: "Constant Multiple Rule",
    difficulty: "foundation",
    formulaTex: "(kf)' = kf'",
    explanation:
      "A constant factor passes straight through the derivative: differentiate the function, then multiply by the constant again. Geometrically, scaling a function vertically by k scales every slope by k as well.",
    pitfalls: ["Do not also differentiate the constant. (5x²)' is 5·2x = 10x, not 0·2x or 5·2x·0."],
    examples: [{ problemTex: "(5x^2)'", steps: ["5 \\cdot (x^2)'", "5 \\cdot 2x", "10x"] }],
    solve: [
      { promptTex: "f(x) = 6x^3", answer: "18*x^2", hints: ["Differentiate x³ first, then multiply by 6."], solution: ["f'(x) = 6 \\cdot 3x^2 = 18x^2"] },
      { promptTex: "f(x) = -2x^5", answer: "-10*x^4", hints: ["The −2 carries through unchanged."], solution: ["f'(x) = -2 \\cdot 5x^4 = -10x^4"] },
    ],
    simplify: [{ promptTex: "4 \\cdot 3x^2", answer: "12*x^2", hints: ["Just multiply the coefficients."], solution: ["= 12x^2"] }],
  }),

  rule({
    id: "mr4",
    topic: "differentiation",
    category: "Basic rules",
    title: "Sum / Difference Rule",
    difficulty: "foundation",
    formulaTex: "(f \\pm g)' = f' \\pm g'",
    explanation:
      "Differentiation distributes over addition and subtraction, so you can work term by term and the terms never interact. Combined with the power and constant rules, this handles every polynomial: differentiate each term separately and add the results.",
    pitfalls: [
      "This does NOT extend to products or quotients — those need their own rules.",
      "Watch the sign when subtracting: (f − g)' = f' − g', so a minus in front of a term keeps its minus.",
    ],
    examples: [{ problemTex: "(x^2 + x^3)'", steps: ["(x^2)' + (x^3)'", "2x + 3x^2"] }],
    solve: [
      {
        promptTex: "f(x) = x^3 + x^2",
        answer: "3*x^2+2*x",
        accepted: ["2*x+3*x^2"],
        hints: ["Differentiate each term on its own.", "(x³)' = 3x², (x²)' = 2x."],
        solution: ["f'(x) = 3x^2 + 2x"],
      },
      {
        promptTex: "f(x) = x^4 - x^2",
        answer: "4*x^3-2*x",
        accepted: ["-2*x+4*x^3"],
        hints: ["The minus stays with the second term."],
        solution: ["f'(x) = 4x^3 - 2x"],
      },
      {
        promptTex: "f(x) = 3x^2 - 5x + 7",
        answer: "6*x-5",
        accepted: ["-5+6*x"],
        hints: ["Three terms, three derivatives.", "The constant 7 differentiates to 0."],
        solution: ["f'(x) = 6x - 5 + 0", "= 6x - 5"],
      },
    ],
    simplify: [{ promptTex: "(3x^2+2x) - (x^2+2x)", answer: "2*x^2", hints: ["Distribute the minus, then collect like terms."], solution: ["= 3x^2 + 2x - x^2 - 2x", "= 2x^2"] }],
  }),

  rule({
    id: "mr5",
    topic: "differentiation",
    category: "Product & quotient",
    title: "Product Rule",
    difficulty: "core",
    formulaTex: "(f \\times g)' = f' \\times g + f \\times g'",
    explanation:
      "Differentiate the first factor and keep the second, then add: keep the first and differentiate the second. The derivative of a product is emphatically NOT the product of the derivatives — a fact worth checking once on a simple case: (x·x)' = 2x, whereas (x)'·(x)' would give 1.",
    derivation: [
      "\\dfrac{f(x+h)g(x+h) - f(x)g(x)}{h}",
      "\\text{add and subtract } f(x+h)g(x):",
      "= f(x+h)\\dfrac{g(x+h)-g(x)}{h} + g(x)\\dfrac{f(x+h)-f(x)}{h}",
      "\\xrightarrow{h\\to0} f g' + g f'",
    ],
    pitfalls: [
      "(fg)' ≠ f'g'. This is the classic error.",
      "Both terms are needed — dropping one is the second most common slip.",
      "For three factors: (fgh)' = f'gh + fg'h + fgh' — one term per factor.",
    ],
    examples: [
      { problemTex: "(x \\cdot x^2)'", steps: ["1 \\cdot x^2 + x \\cdot 2x", "x^2 + 2x^2", "3x^2"] },
      { problemTex: "(x^2 e^x)'", steps: ["2x \\cdot e^x + x^2 \\cdot e^x", "e^x(2x + x^2)"] },
    ],
    solve: [
      {
        promptTex: "f(x) = x^2(x+1)",
        answer: "3*x^2+2*x",
        accepted: ["2*x+3*x^2"],
        hints: ["f = x², g = x+1. Find f' and g' first.", "f'g + fg' = 2x(x+1) + x²·1."],
        solution: ["f' = 2x, \\quad g' = 1", "2x(x+1) + x^2(1)", "= 2x^2 + 2x + x^2 = 3x^2 + 2x"],
      },
      {
        promptTex: "f(x) = x(x^2+3)",
        answer: "3*x^2+3",
        accepted: ["3+3*x^2"],
        hints: ["f = x, g = x²+3.", "1·(x²+3) + x·2x."],
        solution: ["1(x^2+3) + x(2x)", "= x^2 + 3 + 2x^2 = 3x^2 + 3"],
      },
    ],
    simplify: [{ promptTex: "2x(x+1) + x^2 \\cdot 1", answer: "3*x^2+2*x", hints: ["Expand, then collect like terms."], solution: ["= 2x^2 + 2x + x^2", "= 3x^2 + 2x"] }],
    steps: [
      {
        promptTex: "f(x) = x^3 \\cdot e^x",
        steps: [
          { instruction: "What is the derivative of the first factor, x³?", answer: "3*x^2", hint: "Power rule." },
          { instruction: "What is the derivative of the second factor, e^x?", answer: "e^x", hint: "e^x is its own derivative." },
          { instruction: "Now assemble f'g + fg'. Enter the full derivative.", answer: "3*x^2*e^x+x^3*e^x", accepted: ["e^x*(3*x^2+x^3)", "x^3*e^x+3*x^2*e^x"], hint: "3x²·e^x + x³·e^x." },
        ],
        solution: ["f' = 3x^2, \\quad g' = e^x", "3x^2 e^x + x^3 e^x", "= e^x(3x^2 + x^3)"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Differentiate } f(x) = x^2 \\sin x",
        lines: ["f(x) = x^2 \\sin x", "f'(x) = 2x \\cdot \\cos x"],
        wrongLineIndex: 1,
        correctedLineTex: "f'(x) = 2x\\sin x + x^2\\cos x",
        explanation:
          "The derivative of a product is not the product of the derivatives. The product rule needs both terms: f'g + fg'.",
      },
    ],
  }),

  rule({
    id: "mr6",
    topic: "differentiation",
    category: "Product & quotient",
    title: "Quotient Rule",
    difficulty: "core",
    formulaTex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{f' \\times g - f \\times g'}{g^2}",
    explanation:
      "Bottom times the derivative of the top, minus top times the derivative of the bottom, all divided by the bottom squared. The order matters here in a way it does not for the product rule: the minus sign makes the expression non-symmetric, so swapping the two terms flips the sign of your answer.",
    derivation: [
      "\\text{Write } \\dfrac{f}{g} = f \\cdot g^{-1} \\text{ and use the product + chain rules:}",
      "f' g^{-1} + f \\cdot (-1)g^{-2}g' = \\dfrac{f'}{g} - \\dfrac{fg'}{g^2}",
      "= \\dfrac{f'g - fg'}{g^2}",
    ],
    pitfalls: [
      "The numerator order is f'g − fg', not fg' − f'g. Getting it backwards negates the whole answer.",
      "The denominator is g², not g'² and not (fg)².",
      "If the numerator is a constant, the power rule on g⁻¹ is usually faster than the full quotient rule.",
    ],
    examples: [
      { problemTex: "\\left(\\dfrac{x^2}{x}\\right)'", steps: ["\\dfrac{2x \\cdot x - x^2 \\cdot 1}{x^2}", "\\dfrac{x^2}{x^2} = 1"] },
    ],
    solve: [
      {
        promptTex: "f(x) = \\dfrac{2x}{x+1}",
        answer: "2/(x+1)^2",
        hints: ["f = 2x, g = x+1, so f' = 2 and g' = 1.", "Numerator: 2(x+1) − 2x(1) = 2."],
        solution: ["\\dfrac{2(x+1) - 2x(1)}{(x+1)^2}", "= \\dfrac{2x + 2 - 2x}{(x+1)^2} = \\dfrac{2}{(x+1)^2}"],
      },
      {
        promptTex: "f(x) = \\dfrac{x+3}{x}",
        answer: "-3/x^2",
        hints: ["f = x+3, g = x.", "Numerator: 1·x − (x+3)·1 = −3."],
        solution: ["\\dfrac{1 \\cdot x - (x+3) \\cdot 1}{x^2}", "= \\dfrac{-3}{x^2}"],
      },
    ],
    mc: [
      {
        question: "Which numerator is correct for the quotient rule here?",
        promptTex: "f(x) = \\dfrac{x^2}{x+1}",
        options: [
          "2x(x+1) - x^2(1)",
          "x^2(1) - 2x(x+1)",
          "2x(x+1) + x^2(1)",
          "2x \\cdot 1",
        ],
        correctIndex: 0,
        hints: ["The pattern is f'g − fg'.", "f' = 2x, g = x+1, f = x², g' = 1."],
        solution: ["f'g - fg' = 2x(x+1) - x^2(1)", "= x^2 + 2x"],
      },
    ],
    error: [
      {
        promptTex: "\\text{Differentiate } f(x) = \\dfrac{x}{x+2}",
        lines: ["f(x) = \\dfrac{x}{x+2}", "f'(x) = \\dfrac{x(1) - 1(x+2)}{(x+2)^2}", "= \\dfrac{-2}{(x+2)^2}"],
        wrongLineIndex: 1,
        correctedLineTex: "f'(x) = \\dfrac{1(x+2) - x(1)}{(x+2)^2} = \\dfrac{2}{(x+2)^2}",
        explanation:
          "The numerator terms are swapped. It is f'g − fg', so the derivative of the TOP comes first: 1·(x+2) − x·1 = 2. The sign of the final answer is wrong as a result.",
      },
    ],
  }),

  rule({
    id: "mr7",
    topic: "differentiation",
    category: "Chain rule",
    title: "Generalized Power Rule",
    difficulty: "core",
    formulaTex: "(f^n)' = nf^{n-1}f'",
    explanation:
      "The power rule extended to a whole function raised to a power: bring the exponent down, reduce it by one, then multiply by the derivative of the inside. It is the chain rule specialised to an outer power function, and it is the case you will meet most often — anything of the form (something)ⁿ.",
    pitfalls: [
      "The inner derivative f' is the part everyone forgets. Without it you have only done half the chain rule.",
      "Do NOT expand the bracket first unless n is small — that is far more work for the same answer.",
    ],
    examples: [
      { problemTex: "\\left((x^2+1)^3\\right)'", steps: ["3(x^2+1)^2 \\cdot (x^2+1)'", "3(x^2+1)^2 \\cdot 2x", "6x(x^2+1)^2"] },
    ],
    solve: [
      {
        promptTex: "f(x) = (x+2)^4",
        answer: "4*(x+2)^3",
        hints: ["Outer: something to the 4th. Inner: x+2.", "The inner derivative is 1, so it changes nothing here."],
        solution: ["4(x+2)^3 \\cdot 1", "= 4(x+2)^3"],
      },
      {
        promptTex: "f(x) = (x^2-1)^3",
        answer: "6*x*(x^2-1)^2",
        accepted: ["3*(x^2-1)^2*2*x"],
        hints: ["Bring the 3 down and reduce the power to 2.", "Then multiply by the inner derivative 2x."],
        solution: ["3(x^2-1)^2 \\cdot 2x", "= 6x(x^2-1)^2"],
      },
    ],
    simplify: [{ promptTex: "2(x+2)^3 + 2(x+2)^3", answer: "4*(x+2)^3", hints: ["Identical terms — add the coefficients."], solution: ["= 4(x+2)^3"] }],
    error: [
      {
        promptTex: "\\text{Differentiate } f(x) = (3x+1)^5",
        lines: ["f(x) = (3x+1)^5", "f'(x) = 5(3x+1)^4"],
        wrongLineIndex: 1,
        correctedLineTex: "f'(x) = 5(3x+1)^4 \\cdot 3 = 15(3x+1)^4",
        explanation: "The inner derivative is missing. The inside is 3x+1, whose derivative is 3, so the whole result picks up a factor of 3.",
      },
    ],
  }),

  rule({
    id: "mr8",
    topic: "differentiation",
    category: "Chain rule",
    title: "Chain Rule",
    difficulty: "core",
    formulaTex: "[f(g(x))]' = f'(g(x)) \\times g'(x)",
    explanation:
      "For a composition — an outer function wrapped around an inner one — differentiate the outer function leaving the inner one untouched inside it, then multiply by the derivative of the inner function. The mental routine is: identify outer and inner, differentiate outer (inner unchanged), multiply by inner'. For deeper nestings you simply repeat, peeling one layer at a time.",
    derivation: [
      "\\dfrac{\\Delta f}{\\Delta x} = \\dfrac{\\Delta f}{\\Delta g} \\cdot \\dfrac{\\Delta g}{\\Delta x}",
      "\\xrightarrow{\\Delta x \\to 0} \\dfrac{df}{dg}\\cdot\\dfrac{dg}{dx} = f'(g(x))\\,g'(x)",
    ],
    pitfalls: [
      "Do not substitute the inner derivative INTO the outer function. It multiplies from outside.",
      "The inner function stays intact inside f'. For (e^{x²})' it is e^{x²}·2x, never e^{2x}.",
      "Identify which function is applied last — that one is the outer function.",
    ],
    examples: [
      { problemTex: "\\left((2x+3)^5\\right)'", steps: ["5(2x+3)^4 \\cdot 2", "10(2x+3)^4"] },
      { problemTex: "\\left(\\sqrt{x^2+1}\\right)'", steps: ["\\tfrac12(x^2+1)^{-1/2} \\cdot 2x", "\\dfrac{x}{\\sqrt{x^2+1}}"] },
    ],
    solve: [
      {
        promptTex: "f(x) = (5x-2)^3",
        answer: "15*(5x-2)^2",
        hints: ["Outer: cube. Inner: 5x−2.", "3(5x−2)²·5 = 15(5x−2)²."],
        solution: ["3(5x-2)^2 \\cdot 5", "= 15(5x-2)^2"],
      },
      {
        promptTex: "f(x) = e^{4x}",
        answer: "4*e^(4x)",
        hints: ["e^u differentiates to e^u times u'.", "Here u = 4x, so u' = 4."],
        solution: ["e^{4x} \\cdot 4", "= 4e^{4x}"],
      },
    ],
    mc: [
      {
        question: "Which is the correct derivative?",
        promptTex: "f(x) = e^{x^2}",
        options: ["2xe^{x^2}", "e^{2x}", "2xe^{2x}", "x^2 e^{x^2}"],
        correctIndex: 0,
        hints: ["The inner function x² must stay intact in the exponent.", "Multiply by the inner derivative 2x."],
        solution: ["f'(x) = e^{x^2} \\cdot (x^2)'", "= 2x e^{x^2}"],
      },
    ],
    steps: [
      {
        promptTex: "f(x) = \\sqrt{3x + 1}",
        steps: [
          { instruction: "Rewrite as a power. What exponent does the bracket carry?", answer: "1/2", hint: "A square root is the power ½." },
          { instruction: "What is the derivative of the inner function 3x+1?", answer: "3", hint: "Differentiate term by term." },
          { instruction: "Enter the full derivative.", answer: "3/(2*sqrt(3x+1))", accepted: ["(1/2)*(3x+1)^(-1/2)*3", "3/(2*(3x+1)^(1/2))"], hint: "½(3x+1)^(−1/2)·3." },
        ],
        solution: ["f(x) = (3x+1)^{1/2}", "f'(x) = \\tfrac12(3x+1)^{-1/2} \\cdot 3", "= \\dfrac{3}{2\\sqrt{3x+1}}"],
      },
    ],
  }),

  rule({
    id: "mr9",
    topic: "differentiation",
    category: "Exponential & logarithmic",
    title: "Exponential Rule (base e)",
    difficulty: "core",
    formulaTex: "(e^f)' = f'e^f",
    explanation:
      "The exponential function reproduces itself under differentiation — that is the defining property of e. For a composite exponent you keep e^f exactly as it is and multiply by the derivative of the exponent. In the simplest case, (e^x)' = e^x, the only non-zero function that is its own derivative.",
    pitfalls: [
      "The exponent does NOT come down as a factor the way it does for x^k. e^x is not xe^{x−1}.",
      "(e^{3x})' = 3e^{3x}, not e^{3x} alone and not 3xe^{3x}.",
    ],
    examples: [{ problemTex: "\\left(e^{x^2}\\right)'", steps: ["e^{x^2} \\cdot (x^2)'", "2x e^{x^2}"] }],
    solve: [
      { promptTex: "f(x) = e^{x^3}", answer: "3*x^2*e^(x^3)", hints: ["Keep e^{x³} intact.", "Multiply by the exponent's derivative, 3x²."], solution: ["f'(x) = 3x^2 e^{x^3}"] },
      { promptTex: "f(x) = e^{3x}", answer: "3*e^(3x)", hints: ["The exponent's derivative is 3."], solution: ["f'(x) = 3e^{3x}"] },
    ],
    simplify: [{ promptTex: "2e^{3x} + e^{3x}", answer: "3*e^(3x)", hints: ["Same term — add the coefficients."], solution: ["= 3e^{3x}"] }],
  }),

  rule({
    id: "mr10",
    topic: "differentiation",
    category: "Exponential & logarithmic",
    title: "Exponential Rule (general base)",
    difficulty: "advanced",
    formulaTex: "(a^f)' = f' \\, a^f \\ln a",
    explanation:
      "For a base other than e, the same structure picks up one extra factor: the natural log of the base. This is where the special status of e becomes visible — ln(e) = 1, so the extra factor disappears and only base e differentiates cleanly into itself.",
    derivation: [
      "a^f = e^{f \\ln a} \\quad \\text{(rewrite in base } e)",
      "(e^{f\\ln a})' = e^{f\\ln a} \\cdot (f\\ln a)' = a^f \\cdot f' \\ln a",
    ],
    pitfalls: ["ln(a) multiplies, it does not divide — that is the log rule, not the exponential rule."],
    examples: [{ problemTex: "(2^x)'", steps: ["2^x \\ln 2"] }],
    solve: [
      { promptTex: "f(x) = 3^x", answer: "3^x*ln(3)", hints: ["Base 3, exponent x with derivative 1.", "Result: 3^x·ln(3)."], solution: ["f'(x) = 3^x \\ln 3"] },
      { promptTex: "f(x) = 5^{2x}", answer: "2*5^(2x)*ln(5)", hints: ["The exponent 2x has derivative 2."], solution: ["f'(x) = 2 \\cdot 5^{2x}\\ln 5"] },
    ],
    simplify: [{ promptTex: "1 \\cdot 2^x \\ln 2", answer: "2^x*ln(2)", hints: ["The factor 1 changes nothing."], solution: ["= 2^x \\ln 2"] }],
  }),

  rule({
    id: "mr11",
    topic: "differentiation",
    category: "Exponential & logarithmic",
    title: "Natural Log Rule",
    difficulty: "core",
    formulaTex: "(\\ln f)' = \\dfrac{f'}{f}",
    explanation:
      "The derivative of a natural log is the inner function's derivative divided by the inner function itself. The simplest case is (ln x)' = 1/x. Because logs turn products into sums, it is often far quicker to simplify with the log laws BEFORE differentiating — ln(x³) becomes 3ln(x), which differentiates to 3/x in one step.",
    pitfalls: [
      "The inner function goes in the DENOMINATOR, and its derivative in the numerator — not the other way round.",
      "(ln x)² is not the same as ln(x²). The first needs the chain rule with an outer square.",
    ],
    examples: [{ problemTex: "\\left(\\ln(x^2+1)\\right)'", steps: ["\\dfrac{(x^2+1)'}{x^2+1}", "\\dfrac{2x}{x^2+1}"] }],
    solve: [
      {
        promptTex: "f(x) = \\ln(x^3)",
        answer: "3/x",
        accepted: ["3*x^2/x^3"],
        hints: ["Either apply the rule directly, or simplify with ln(x³) = 3ln(x) first.", "Both give 3/x."],
        solution: ["\\dfrac{3x^2}{x^3} = \\dfrac{3}{x}", "\\text{(or: } \\ln(x^3)=3\\ln x \\Rightarrow 3 \\cdot \\tfrac1x)"],
      },
      {
        promptTex: "f(x) = \\ln(5x + 2)",
        answer: "5/(5x+2)",
        hints: ["Inner function: 5x+2, derivative 5."],
        solution: ["f'(x) = \\dfrac{5}{5x+2}"],
      },
    ],
    simplify: [{ promptTex: "\\dfrac{5x^4}{x^5}", answer: "5/x", hints: ["Subtract the exponents: x⁴/x⁵ = x⁻¹."], solution: ["= 5x^{-1} = \\dfrac{5}{x}"] }],
    mc: [
      {
        question: "Which is the derivative?",
        promptTex: "f(x) = \\ln(x^2 + 4)",
        options: ["\\dfrac{2x}{x^2+4}", "\\dfrac{x^2+4}{2x}", "\\dfrac{1}{x^2+4}", "2x\\ln(x^2+4)"],
        correctIndex: 0,
        hints: ["f'/f: what is the derivative of x²+4?", "It is 2x, and it goes on top."],
        solution: ["f'(x) = \\dfrac{2x}{x^2+4}"],
      },
    ],
  }),

  rule({
    id: "mr12",
    topic: "differentiation",
    category: "Exponential & logarithmic",
    title: "General Log Rule",
    difficulty: "advanced",
    formulaTex: "(\\log_a f)' = \\dfrac{f'}{f \\ln a}",
    explanation:
      "Same as the natural log rule with one extra factor of ln(a) in the denominator. It follows from the change-of-base identity log_a(x) = ln(x)/ln(a): since 1/ln(a) is just a constant, it rides along untouched.",
    derivation: ["\\log_a f = \\dfrac{\\ln f}{\\ln a}", "\\left(\\dfrac{\\ln f}{\\ln a}\\right)' = \\dfrac{1}{\\ln a}\\cdot\\dfrac{f'}{f}"],
    pitfalls: ["ln(a) divides here, whereas in the exponential rule it multiplies. Mixing the two is the usual slip."],
    examples: [{ problemTex: "\\left(\\log_2(x^2+1)\\right)'", steps: ["\\dfrac{2x}{(x^2+1)\\ln 2}"] }],
    solve: [
      { promptTex: "f(x) = \\log_{10}(x)", answer: "1/(x*ln(10))", hints: ["Inner derivative is 1.", "Denominator carries x·ln(10)."], solution: ["f'(x) = \\dfrac{1}{x\\ln 10}"] },
      {
        promptTex: "f(x) = \\log_2(x^3)",
        answer: "3/(x*ln(2))",
        accepted: ["3*x^2/(x^3*ln(2))"],
        hints: ["Inner derivative 3x², over x³·ln(2).", "That simplifies to 3/(x·ln 2)."],
        solution: ["\\dfrac{3x^2}{x^3\\ln 2} = \\dfrac{3}{x\\ln 2}"],
      },
    ],
    simplify: [{ promptTex: "\\dfrac{4x^3}{x^4 \\ln 3}", answer: "4/(x*ln(3))", hints: ["x³/x⁴ = 1/x."], solution: ["= \\dfrac{4}{x\\ln 3}"] }],
  }),

  rule({
    id: "mr13",
    topic: "differentiation",
    category: "Higher order",
    title: "Higher-Order Derivatives",
    difficulty: "core",
    formulaTex: "f''(x) = \\big(f'(x)\\big)' \\qquad f^{(n)}(x) = \\underbrace{\\big(\\cdots\\big)'}_{n \\text{ times}}",
    explanation:
      "Differentiating repeatedly. The first derivative gives the slope, the second gives the curvature — whether the slope is itself rising or falling. In applications the second derivative is what distinguishes a maximum from a minimum, and in economics it is what separates diminishing from increasing marginal returns.",
    pitfalls: [
      "f''(x) is not (f'(x))², it is the derivative of f'. Squaring nothing here.",
      "Each differentiation of a polynomial drops the degree by one, so the n-th derivative of a degree-n polynomial is a constant and the (n+1)-th is 0.",
    ],
    examples: [
      { problemTex: "f(x) = x^4", steps: ["f'(x) = 4x^3", "f''(x) = 12x^2", "f'''(x) = 24x"] },
    ],
    solve: [
      { promptTex: "f(x) = x^3, \\quad \\text{find } f''(x)", answer: "6*x", hints: ["First f' = 3x².", "Then differentiate again."], solution: ["f'(x) = 3x^2", "f''(x) = 6x"] },
      { promptTex: "f(x) = e^{2x}, \\quad \\text{find } f''(x)", answer: "4*e^(2x)", hints: ["f' = 2e^{2x}.", "Each differentiation brings down another factor of 2."], solution: ["f'(x) = 2e^{2x}", "f''(x) = 4e^{2x}"] },
    ],
    mc: [
      {
        question: "What does f''(x) > 0 on an interval tell you?",
        promptTex: "f''(x) > 0",
        options: [
          "\\text{the graph is convex (curved upward) there}",
          "\\text{the function is increasing there}",
          "\\text{the function is positive there}",
          "\\text{there is a maximum there}",
        ],
        correctIndex: 0,
        hints: ["The second derivative describes curvature, not level or direction.", "Positive curvature = convex = opens upward."],
        solution: ["f'' > 0 \\Rightarrow f' \\text{ is increasing}", "\\Rightarrow \\text{the graph curves upward (convex)}"],
      },
    ],
  }),

  rule({
    id: "mr14",
    topic: "differentiation",
    category: "Applications",
    title: "Marginal Analysis",
    difficulty: "core",
    formulaTex: "MC(q) = C'(q) \\qquad MR(q) = R'(q) \\qquad \\text{profit max: } MR = MC",
    explanation:
      "In economics the derivative of a total quantity with respect to output is called the marginal quantity: marginal cost is the derivative of total cost, marginal revenue the derivative of total revenue. It approximates the effect of producing one more unit. Profit P = R − C is maximised where P' = 0, i.e. exactly where marginal revenue equals marginal cost.",
    pitfalls: [
      "Marginal cost is the derivative of TOTAL cost, not average cost. They are different functions.",
      "MR = MC identifies a stationary point — check the second derivative to confirm it is a maximum, not a minimum.",
    ],
    examples: [
      {
        problemTex: "C(q) = 0.5q^2 + 20q + 500",
        steps: ["MC(q) = C'(q)", "= q + 20"],
      },
    ],
    solve: [
      {
        promptTex: "C(q) = 2q^2 + 15q + 300, \\quad \\text{find } MC(q)",
        answer: "4*q+15",
        accepted: ["15+4*q"],
        hints: ["Marginal cost is just C'(q).", "Differentiate term by term."],
        solution: ["MC(q) = 4q + 15"],
      },
    ],
    word: [
      {
        scenario:
          "A firm has total cost C(q) = q² + 10q + 200 and sells at a fixed price of 50 per unit, so revenue is R(q) = 50q. At which output q is profit maximised?",
        promptTex: "P(q) = R(q) - C(q)",
        answer: "20",
        hints: ["Set marginal revenue equal to marginal cost.", "MR = 50, MC = 2q + 10. Solve 50 = 2q + 10."],
        solution: [
          "MR(q) = 50, \\quad MC(q) = 2q + 10",
          "50 = 2q + 10 \\Rightarrow 2q = 40",
          "q = 20",
          "P''(q) = -2 < 0 \\Rightarrow \\text{maximum} \\;\\checkmark",
        ],
      },
      {
        scenario:
          "Total cost is C(q) = 3q² + 40q + 1000. What is the marginal cost of producing the 11th unit, approximated by MC(10)?",
        answer: "100",
        hints: ["First find MC(q) = C'(q).", "MC(q) = 6q + 40; substitute q = 10."],
        solution: ["MC(q) = 6q + 40", "MC(10) = 60 + 40 = 100"],
      },
    ],
  }),

  rule({
    id: "mr15",
    topic: "differentiation",
    category: "Applications",
    title: "Elasticity",
    difficulty: "advanced",
    formulaTex: "\\varepsilon_{x} = \\dfrac{f'(x) \\cdot x}{f(x)} \\qquad \\varepsilon_{d} = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}",
    explanation:
      "Elasticity measures relative responsiveness: the percentage change in one quantity per one percent change in another. Unlike a plain derivative it is unit-free, which is what makes it comparable across goods and currencies. Price elasticity of demand below −1 is called elastic (revenue falls when price rises); between −1 and 0 it is inelastic (revenue rises when price rises).",
    pitfalls: [
      "Elasticity is not the derivative. The factor x/f(x) is what turns absolute change into relative change.",
      "Demand elasticity is normally negative; 'more elastic' means larger in absolute value.",
    ],
    derivation: [
      "\\varepsilon = \\dfrac{\\% \\Delta Q}{\\% \\Delta P} = \\dfrac{\\Delta Q / Q}{\\Delta P / P}",
      "= \\dfrac{\\Delta Q}{\\Delta P}\\cdot\\dfrac{P}{Q} \\;\\xrightarrow{\\Delta \\to 0}\\; \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}",
    ],
    examples: [
      {
        problemTex: "Q(P) = 100 - 2P \\text{ at } P = 20",
        steps: ["Q'(P) = -2, \\quad Q(20) = 60", "\\varepsilon = -2 \\cdot \\dfrac{20}{60}", "= -\\dfrac{2}{3} \\text{ (inelastic)}"],
      },
    ],
    word: [
      {
        scenario:
          "Demand is Q(P) = 200 − 4P. Compute the price elasticity of demand at P = 25. Give the answer as a decimal (include the sign).",
        promptTex: "\\varepsilon_d = \\dfrac{dQ}{dP}\\cdot\\dfrac{P}{Q}",
        answer: "-1",
        hints: ["dQ/dP = −4. Now find Q(25).", "Q(25) = 200 − 100 = 100, so ε = −4·(25/100)."],
        solution: [
          "\\dfrac{dQ}{dP} = -4, \\quad Q(25) = 100",
          "\\varepsilon = -4 \\cdot \\dfrac{25}{100} = -1",
          "\\text{unit elastic — revenue is at its maximum here}",
        ],
      },
    ],
    mc: [
      {
        question: "Demand has elasticity ε = −2.5 at the current price. What happens to revenue if the price rises slightly?",
        promptTex: "\\varepsilon_d = -2.5",
        options: [
          "\\text{revenue falls}",
          "\\text{revenue rises}",
          "\\text{revenue is unchanged}",
          "\\text{cannot be determined}",
        ],
        correctIndex: 0,
        hints: ["|ε| > 1 means demand is elastic.", "Quantity falls proportionally more than price rises."],
        solution: [
          "|\\varepsilon| = 2.5 > 1 \\Rightarrow \\text{elastic}",
          "\\text{quantity falls by 2.5\\% per 1\\% price rise}",
          "\\Rightarrow \\text{revenue falls}",
        ],
      },
    ],
  }),
];
