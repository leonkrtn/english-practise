/**
 * Formula anatomy: every rule's formula broken into named, tappable pieces.
 *
 * This is the difference between seeing (fg)' = f'g + fg' and understanding it. Each part carries a
 * short name and a sentence explaining what that piece *does*, so a learner can interrogate the
 * formula symbol by symbol instead of trying to memorise it as one opaque string.
 *
 * Kept in its own file, keyed by rule id, so the nine topic files stay purely about content and a
 * rule without an entry simply renders its plain formula — nothing breaks if one is missing.
 *
 * Concatenating every `tex` in order must reproduce the rule's own formulaTex closely enough that
 * the split is invisible: parts are rendered as inline KaTeX in a baseline-aligned row.
 */

export interface MathAnatomyPart {
  tex: string;
  /** Short name shown when the part is selected. Omitted for glue (=, ×, spacing), which is inert. */
  label?: string;
  explanation?: string;
}

const g = (tex: string): MathAnatomyPart => ({ tex });

export const MATH_ANATOMY: Record<string, MathAnatomyPart[]> = {
  /* ------------------------------------------------------------- algebra ---- */
  alg1: [
    { tex: "a^m \\cdot a^n = a^{m+n}", label: "Product law", explanation: "Same base, multiplied: add the exponents. The base itself never changes." },
    g("\\quad"),
    { tex: "\\dfrac{a^m}{a^n} = a^{m-n}", label: "Quotient law", explanation: "Same base, divided: subtract the bottom exponent from the top one." },
    g("\\quad"),
    { tex: "(a^m)^n = a^{mn}", label: "Power of a power", explanation: "A power raised to a power multiplies the two exponents." },
  ],
  alg2: [
    { tex: "\\sqrt[n]{a^m}", label: "The root", explanation: "n is the root index — the number of times something must be multiplied by itself to give a." },
    g("="),
    { tex: "a^{m/n}", label: "As a power", explanation: "The root index becomes the denominator of the exponent. Convert every root this way before differentiating." },
  ],
  alg3: [
    { tex: "\\ln(ab) = \\ln a + \\ln b", label: "Product → sum", explanation: "A product inside the log becomes a sum outside it." },
    g("\\quad"),
    { tex: "\\ln\\dfrac{a}{b} = \\ln a - \\ln b", label: "Quotient → difference", explanation: "A quotient inside becomes a subtraction outside." },
    g("\\quad"),
    { tex: "\\ln(a^n) = n\\ln a", label: "Power → factor", explanation: "The workhorse: an exponent comes down as a plain multiplier. This is how you get an unknown out of an exponent." },
  ],
  alg4: [
    { tex: "x =", label: "The two roots", explanation: "The ± produces both solutions at once — one with the plus, one with the minus." },
    { tex: "\\dfrac{-b \\pm \\sqrt{\\;}}{2a}", label: "Structure", explanation: "All of −b sits above the bar, and 2a divides the entire numerator — not just the root." },
    g("\\;\\text{with}\\;"),
    { tex: "D = b^2 - 4ac", label: "Discriminant", explanation: "Tells you the answer's shape before you compute it: D > 0 two roots, D = 0 one, D < 0 none." },
  ],
  alg5: [
    { tex: "\\dfrac{a}{b} \\pm \\dfrac{c}{d} = \\dfrac{ad \\pm cb}{bd}", label: "Adding", explanation: "Needs a common denominator — that is what the cross-multiplication produces." },
    g("\\quad"),
    { tex: "\\dfrac{a}{b} \\cdot \\dfrac{c}{d} = \\dfrac{ac}{bd}", label: "Multiplying", explanation: "Straight across, top by top and bottom by bottom. No common denominator needed." },
    g("\\quad"),
    { tex: "\\dfrac{a/b}{c/d} = \\dfrac{a}{b}\\cdot\\dfrac{d}{c}", label: "Dividing", explanation: "Dividing by a fraction is multiplying by its reciprocal — flip the second one." },
  ],
  alg6: [
    { tex: "(a+b)^2 = a^2 + 2ab + b^2", label: "Square of a sum", explanation: "Three terms, not two. The middle 2ab is the one people drop." },
    g("\\quad"),
    { tex: "(a-b)^2 = a^2 - 2ab + b^2", label: "Square of a difference", explanation: "Same shape, but the middle term is negative. The b² stays positive." },
    g("\\quad"),
    { tex: "(a+b)(a-b) = a^2 - b^2", label: "Difference of squares", explanation: "The most useful one, because it factors backwards: any a² − b² splits instantly." },
  ],

  /* -------------------------------------------------------------- limits ---- */
  lim1: [
    { tex: "\\lim_{x \\to a} f(x)", label: "The limit", explanation: "What f approaches as x gets arbitrarily close to a — never what happens exactly at a." },
    g("="),
    { tex: "f(a)", label: "Just substitute", explanation: "Valid only where f is continuous. If this gives 0/0 or a zero denominator, you need another method." },
  ],
  lim2: [
    { tex: "\\lim_{x \\to a} \\dfrac{f(x)}{g(x)}", label: "The 0/0 case", explanation: "Both numerator and denominator vanish at a — the signal to factor, not a value." },
    g("\\;\\Rightarrow\\;"),
    { tex: "\\text{factor out } (x-a)", label: "The shared factor", explanation: "Because both vanish at a, both contain (x − a). Cancel it and substitute into what remains." },
  ],
  lim3: [
    { tex: "\\lim_{x\\to a}\\dfrac{f(x)}{g(x)}", label: "Check the form first", explanation: "The rule applies only to 0/0 and ∞/∞. Using it elsewhere gives a wrong answer." },
    g("="),
    { tex: "\\lim_{x\\to a}\\dfrac{f'(x)}{g'(x)}", label: "Differentiate separately", explanation: "Top and bottom each on their own. This is NOT the quotient rule — there is no g² anywhere." },
  ],
  lim4: [
    { tex: "\\lim_{x \\to \\infty} \\dfrac{a_n x^n + \\cdots}{b_m x^m + \\cdots}", label: "Only the leading terms matter", explanation: "At infinity every lower-order term is negligible. Compare the two highest powers and ignore the rest." },
    g("="),
    { tex: "\\begin{cases} 0 & n < m \\\\ a_n/b_m & n = m \\\\ \\pm\\infty & n > m\\end{cases}", label: "Read off the degrees", explanation: "Lower on top → 0. Equal → the ratio of leading coefficients. Higher on top → diverges. Same rule gives the horizontal asymptote." },
  ],
  lim5: [
    { tex: "\\lim_{x \\to a^-} f(x)", label: "From the left", explanation: "Approaching a from below. If this differs from the right-hand limit, the graph jumps." },
    g("="),
    { tex: "\\lim_{x \\to a^+} f(x)", label: "From the right", explanation: "Approaching a from above." },
    g("="),
    { tex: "f(a)", label: "The actual value", explanation: "All three must agree. Matching limits that miss f(a) leave a removable hole." },
  ],

  /* ----------------------------------------------------- differentiation ---- */
  mr1: [
    { tex: "(k)'", label: "A constant", explanation: "Any fixed number — including π, e and ln(2), however complicated they look." },
    g("="),
    { tex: "0", label: "No change", explanation: "Its graph is a horizontal line, so its slope is zero everywhere." },
  ],
  mr2: [
    { tex: "(x^k)'", label: "Any real exponent", explanation: "Works for negative, fractional and irrational k — which is why you rewrite roots and reciprocals as powers first." },
    g("="),
    { tex: "k", label: "Bring it down", explanation: "The old exponent becomes a multiplying factor out front." },
    { tex: "x^{k-1}", label: "Reduce by one", explanation: "Exactly one less. For negative exponents that means further from zero: x⁻² → x⁻³." },
  ],
  mr3: [
    { tex: "(kf)'", label: "Constant times a function", explanation: "k is a fixed number, f is what actually depends on x." },
    g("="),
    { tex: "k", label: "Passes straight through", explanation: "The constant is untouched — do not also differentiate it to zero." },
    { tex: "f'", label: "Differentiate the function", explanation: "Only the x-dependent part gets differentiated." },
  ],
  mr4: [
    { tex: "(f \\pm g)'", label: "A sum or difference", explanation: "Terms added or subtracted — not multiplied. Products need their own rule." },
    g("="),
    { tex: "f' \\pm g'", label: "Term by term", explanation: "The terms never interact, so you differentiate each independently and keep the signs." },
  ],
  mr5: [
    { tex: "(f \\times g)'", label: "A product", explanation: "Two factors, each depending on x. The derivative is NOT f'·g' — check it on (x·x)' = 2x." },
    g("="),
    { tex: "f' \\times g", label: "First differentiated", explanation: "Differentiate the first factor, keep the second exactly as it is." },
    g("+"),
    { tex: "f \\times g'", label: "Second differentiated", explanation: "Keep the first factor, differentiate the second. Both terms are needed." },
  ],
  mr6: [
    { tex: "\\left(\\dfrac{f}{g}\\right)'", label: "A quotient", explanation: "f is the top, g is the bottom. Unlike the product rule, order matters here." },
    g("="),
    { tex: "\\dfrac{f' \\times g", label: "Top differentiated first", explanation: "Derivative of the numerator times the denominator. This term comes FIRST — swapping negates the answer." },
    { tex: "- f \\times g'}", label: "Minus bottom differentiated", explanation: "Numerator times the derivative of the denominator, subtracted." },
    { tex: "{g^2}", label: "Bottom squared", explanation: "The original denominator squared — not g′² and not (fg)²." },
  ],
  mr7: [
    { tex: "(f^n)'", label: "A function to a power", explanation: "Not just x — a whole expression raised to n. The most common chain-rule case." },
    g("="),
    { tex: "nf^{n-1}", label: "Power rule on the outside", explanation: "Bring n down, reduce the exponent by one, leaving the inside untouched." },
    { tex: "f'", label: "Times the inner derivative", explanation: "The part everyone forgets. Without it you have only done half the chain rule." },
  ],
  mr8: [
    { tex: "[f(g(x))]'", label: "A composition", explanation: "An outer function wrapped around an inner one. Identify which is applied last — that one is the outer." },
    g("="),
    { tex: "f'(g(x))", label: "Outer differentiated", explanation: "Differentiate the outer function while leaving the inner one intact inside it." },
    g("\\times"),
    { tex: "g'(x)", label: "Inner derivative", explanation: "Multiply by the derivative of what was inside. It multiplies from outside — never substitute it in." },
  ],
  mr9: [
    { tex: "(e^f)'", label: "e to a function", explanation: "The exponential reproduces itself under differentiation — that is what defines e." },
    g("="),
    { tex: "f'", label: "Inner derivative", explanation: "The derivative of the exponent, brought out as a factor." },
    { tex: "e^f", label: "Unchanged", explanation: "The exponential itself survives exactly as it was, exponent and all." },
  ],
  mr10: [
    { tex: "(a^f)'", label: "Any base", explanation: "A constant base other than e, raised to a function." },
    g("="),
    { tex: "f'", label: "Inner derivative", explanation: "Same chain-rule factor as always." },
    { tex: "a^f", label: "Unchanged", explanation: "The power itself is reproduced." },
    { tex: "\\ln a", label: "The extra factor", explanation: "The price of not using base e. Since ln(e) = 1, this disappears for e — which is what makes e special." },
  ],
  mr11: [
    { tex: "(\\ln f)'", label: "Log of a function", explanation: "The simplest case is (ln x)′ = 1/x. Simplifying with the log laws first is often faster." },
    g("="),
    { tex: "\\dfrac{f'", label: "Inner derivative on top", explanation: "The derivative of what is inside the log goes in the numerator." },
    { tex: "}{f}", label: "Inner function below", explanation: "The inside itself goes in the denominator, unchanged." },
  ],
  mr12: [
    { tex: "(\\log_a f)'", label: "Log to base a", explanation: "Same as the natural log, plus one correction for the base." },
    g("="),
    { tex: "\\dfrac{f'", label: "Inner derivative", explanation: "Numerator, exactly as in the natural log rule." },
    { tex: "}{f \\ln a}", label: "Inside × ln(base)", explanation: "Here ln(a) DIVIDES. In the exponential rule it multiplies — that is the usual mix-up." },
  ],
  mr13: [
    { tex: "f''(x)", label: "Second derivative", explanation: "The derivative of the derivative — not f′ squared. It measures curvature." },
    g("="),
    { tex: "\\big(f'(x)\\big)'", label: "Differentiate again", explanation: "Each pass drops a polynomial's degree by one, so the n-th derivative of a degree-n polynomial is constant." },
  ],
  mr14: [
    { tex: "MC(q) = C'(q)", label: "Marginal cost", explanation: "The derivative of TOTAL cost — not average cost. Approximates the cost of one more unit." },
    g("\\quad"),
    { tex: "MR(q) = R'(q)", label: "Marginal revenue", explanation: "The derivative of total revenue: the extra revenue from one more unit." },
    g("\\quad"),
    { tex: "MR = MC", label: "Profit maximum", explanation: "Profit P = R − C is stationary where P′ = 0, i.e. exactly where MR equals MC. Check P″ < 0 to confirm it is a maximum." },
  ],
  mr15: [
    { tex: "\\varepsilon = \\dfrac{dQ}{dP}", label: "The derivative", explanation: "How much quantity changes per unit of price — an absolute rate, still carrying units." },
    g("\\cdot"),
    { tex: "\\dfrac{P}{Q}", label: "The scaling factor", explanation: "This is what turns an absolute rate into a relative one, making elasticity unit-free and comparable across goods." },
  ],

  /* ------------------------------------------------------ curve sketching ---- */
  cs1: [
    { tex: "f'(x) > 0", label: "Increasing", explanation: "Positive slope. Note it is the sign of f′, not of f — a function can be negative and still rising." },
    g("\\qquad"),
    { tex: "f'(x) < 0", label: "Decreasing", explanation: "Negative slope. Direction can only change where f′ is zero or undefined, which is why those points partition the domain." },
  ],
  cs2: [
    { tex: "f'(x_0) = 0", label: "Necessary condition", explanation: "A horizontal tangent. Necessary but NOT sufficient — x³ has f′(0) = 0 and no extremum." },
    g("\\;\\text{and}\\;"),
    { tex: "f''(x_0) < 0", label: "Maximum", explanation: "Negative curvature: the graph opens downward, so the flat point is a peak." },
    g("\\;/\\;"),
    { tex: "f''(x_0) > 0", label: "Minimum", explanation: "Positive curvature: opens upward, so the flat point is a trough." },
  ],
  cs3: [
    { tex: "f''(x_0) = 0", label: "Curvature vanishes", explanation: "Necessary but not sufficient — x⁴ has f″(0) = 0 and no inflection." },
    g("\\;\\text{and}\\;"),
    { tex: "f'''(x_0) \\neq 0", label: "Confirms the flip", explanation: "A non-zero third derivative proves the curvature genuinely changes sign rather than merely touching zero." },
  ],
  cs4: [
    { tex: "g(x)=0,\\; f(x)\\neq0", label: "Vertical asymptote", explanation: "Denominator zero while the numerator is not. If both vanish you have a removable hole, not a pole." },
    g("\\qquad"),
    { tex: "\\lim_{x\\to\\pm\\infty} \\dfrac{f(x)}{g(x)}", label: "Horizontal asymptote", explanation: "Read off by comparing degrees. The graph may cross it — the constraint is only about behaviour at infinity." },
  ],
  cs5: [
    { tex: "\\text{minimise } f(x,y)", label: "Objective", explanation: "The quantity you actually want to make as large or small as possible." },
    g("\\;\\text{s.t.}\\;"),
    { tex: "g(x,y)=c", label: "Constraint", explanation: "The restriction. Use it to express one variable through the other." },
    g("\\;\\Rightarrow\\;"),
    { tex: "\\tfrac{d}{dx}=0", label: "Then one variable", explanation: "After substituting, it is an ordinary stationary-point problem. Confirm with the second derivative and check the domain's edges." },
  ],

  /* --------------------------------------------------------- integration ---- */
  int1: [
    { tex: "\\int x^n \\, dx", label: "The integral", explanation: "Asks: which function differentiates to xⁿ? Integration runs the power rule backwards." },
    g("="),
    { tex: "\\dfrac{x^{n+1}}{n+1}", label: "Raise, then divide", explanation: "Raise the exponent by one and divide by the new exponent — the opposite of differentiating." },
    g("+"),
    { tex: "C", label: "The constant", explanation: "Not decoration: every function differing by a constant has the same derivative, so this is a whole family of answers." },
    g("\\;"),
    { tex: "(n \\neq -1)", label: "The exclusion", explanation: "n = −1 would divide by zero. That single missing case is exactly what ln|x| covers." },
  ],
  int2: [
    { tex: "\\int e^x dx = e^x + C", label: "Exponential", explanation: "e^x integrates to itself, with no extra factor. But ∫e^{kx}dx = e^{kx}/k." },
    g("\\quad"),
    { tex: "\\int \\dfrac{1}{x}dx = \\ln|x| + C", label: "Reciprocal", explanation: "The bars matter: they make the formula valid on the negative side too, where ln(x) is undefined." },
    g("\\quad"),
    { tex: "\\int a^x dx = \\dfrac{a^x}{\\ln a} + C", label: "General base", explanation: "Where differentiating a^x multiplies by ln(a), integrating divides by it." },
  ],
  int3: [
    { tex: "\\int_a^b f(x)\\,dx", label: "Definite integral", explanation: "The signed area between the curve and the x-axis. Signed: area below the axis counts as negative." },
    g("="),
    { tex: "F(b) - F(a)", label: "Evaluate and subtract", explanation: "Upper limit minus lower limit, in that order. The constant C cancels here, which is why definite integrals never carry one." },
  ],
  int4: [
    { tex: "\\int f(g(x))g'(x)\\,dx", label: "The tell-tale shape", explanation: "A composite function multiplied by (something proportional to) its inner derivative. That pairing is the signal to substitute." },
    g("="),
    { tex: "\\int f(u)\\,du", label: "Rewritten in u", explanation: "Replace the inside with u and g′(x)dx with du. You must replace dx too — a stray dx is the usual mistake." },
    g("\\;\\text{with}\\;"),
    { tex: "u = g(x)", label: "The substitution", explanation: "Choose the inner function. Substitute back to x at the end, unless you also converted the limits." },
  ],
  int5: [
    { tex: "\\int u\\,v'\\,dx", label: "Product of two functions", explanation: "Used when the integrand is a product of unrelated functions. The art is choosing which factor is u." },
    g("="),
    { tex: "uv", label: "The easy part", explanation: "Simply multiply u by the antiderivative of v′." },
    g("-"),
    { tex: "\\int u'\\,v\\,dx", label: "The remaining integral", explanation: "Should be EASIER than the original — if it is harder, swap the roles of u and v′ and try again. Do not lose the minus sign." },
  ],
  int6: [
    { tex: "A = \\int_a^b", label: "Between the intersections", explanation: "The limits come from solving f(x) = g(x). Finding them first is where most of the marks live." },
    { tex: "\\big(f(x) - g(x)\\big)", label: "Upper minus lower", explanation: "In that order. Reversing produces a negative 'area'. If the curves swap places, split the integral at each crossing." },
    g("\\,dx"),
  ],

  /* -------------------------------------------------------- multivariable ---- */
  mv1: [
    { tex: "\\dfrac{\\partial f}{\\partial x}", label: "Partial, not total", explanation: "The curly ∂ signals that the other variables are being held fixed — ceteris paribus, made precise." },
    g("="),
    { tex: "f_x", label: "Shorthand", explanation: "Subscript notation for the same thing. f_x means differentiate with respect to x." },
    g("\\quad"),
    { tex: "y \\text{ constant}", label: "Freeze the rest", explanation: "Treat y exactly like the number 5: it does not differentiate, it just rides along as a factor." },
  ],
  mv2: [
    { tex: "f_{xx}", label: "Twice by x", explanation: "The derivative of f_x with respect to x again. Not (f_x)² — nothing is squared." },
    g("\\qquad"),
    { tex: "f_{xy} = f_{yx}", label: "Mixed partials agree", explanation: "Schwarz's theorem: for any reasonably smooth function the order does not matter, so there are only three distinct second-order partials, not four." },
  ],
  mv3: [
    { tex: "f_x = f_y = 0", label: "Stationary point", explanation: "Every partial must vanish at once — solve it as a system, not one equation at a time." },
    g("\\quad\\text{and}\\quad"),
    { tex: "D = f_{xx}f_{yy} - f_{xy}^2", label: "Hessian determinant", explanation: "D > 0 with f_xx < 0 is a maximum, D > 0 with f_xx > 0 a minimum, D < 0 always a saddle. D = 0 is inconclusive." },
  ],
  mv4: [
    { tex: "\\mathcal{L} =", label: "The Lagrangian", explanation: "A single function whose stationary points solve the constrained problem. Set all three partials to zero." },
    { tex: "f(x,y)", label: "Objective", explanation: "What you are maximising or minimising." },
    g("-"),
    { tex: "\\lambda", label: "The multiplier", explanation: "The shadow price: how much the optimum would improve if the constraint were relaxed by one unit." },
    { tex: "\\big(g(x,y) - c\\big)", label: "Constraint, set to zero", explanation: "Written so it equals zero at any feasible point. ∂L/∂λ = 0 simply reproduces this constraint — do not forget that third equation." },
  ],

  /* ------------------------------------------------------- linear algebra ---- */
  la1: [
    { tex: "(AB)_{ij} = \\sum_k a_{ik}b_{kj}", label: "One entry", explanation: "Entry (i,j) is the dot product of row i of A with column j of B." },
    g("\\qquad"),
    { tex: "A_{m\\times n} \\cdot B_{n\\times p}", label: "Inner dimensions must match", explanation: "The n on both sides has to agree, or the product does not exist. Check before multiplying." },
    g("="),
    { tex: "C_{m\\times p}", label: "Outer dimensions survive", explanation: "The result takes the outer pair. Note AB ≠ BA in general — order matters throughout linear algebra." },
  ],
  la2: [
    { tex: "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}", label: "The determinant", explanation: "Measures how the matrix scales area. A negative sign means the orientation flips." },
    g("="),
    { tex: "ad", label: "Main diagonal", explanation: "Top-left times bottom-right." },
    g("-"),
    { tex: "bc", label: "Anti-diagonal", explanation: "Top-right times bottom-left, subtracted. It is the diagonals, not the rows. Zero here means singular — no inverse." },
  ],
  la3: [
    { tex: "A^{-1} = \\dfrac{1}{ad-bc}", label: "Divide by the determinant", explanation: "Which is why the inverse exists only when det A ≠ 0." },
    { tex: "\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}", label: "Swap and negate", explanation: "a and d swap places; b and c stay put but change sign. Mixing that up is the standard error." },
  ],
  la4: [
    { tex: "Ax = b", label: "System as one equation", explanation: "Any linear system written in matrix form: A holds the coefficients, b the right-hand sides." },
    g("\\;\\Rightarrow\\;"),
    { tex: "x_i = \\dfrac{\\det A_i}{\\det A}", label: "Cramer's rule", explanation: "A_i is A with column i replaced by b. Requires det A ≠ 0; beyond 3×3, elimination is far faster." },
  ],
  la5: [
    { tex: "Av = \\lambda v", label: "The defining property", explanation: "The matrix does not rotate v — it only stretches it by λ. The zero vector never counts as an eigenvector." },
    g("\\quad \\Leftrightarrow \\quad"),
    { tex: "\\det(A - \\lambda I) = 0", label: "Characteristic equation", explanation: "λI subtracts λ from the DIAGONAL only. Solving this polynomial gives the eigenvalues." },
  ],

  /* ----------------------------------------------------------- statistics ---- */
  st1: [
    { tex: "\\bar{x} =", label: "The mean", explanation: "The arithmetic average. Sensitive to outliers, which is why skewed data is usually reported by median instead." },
    { tex: "\\dfrac{1}{n}", label: "Divide by the count", explanation: "n is how many observations there are." },
    { tex: "\\sum_{i=1}^{n} x_i", label: "Sum of all values", explanation: "Add every observation. For growth rates you would need the geometric mean instead." },
  ],
  st2: [
    { tex: "\\sigma^2 = \\dfrac{1}{n}\\sum (x_i - \\bar{x})^2", label: "Population variance", explanation: "Mean squared deviation from the mean. Divides by n when you have the whole population." },
    g("\\qquad"),
    { tex: "s^2 = \\dfrac{1}{n-1}\\sum (x_i - \\bar{x})^2", label: "Sample variance", explanation: "Divides by n − 1 because the mean was itself estimated from the same data, which uses up one degree of freedom." },
  ],
  st3: [
    { tex: "E[X] = \\sum_i x_i \\, p_i", label: "Probability-weighted average", explanation: "Each outcome times its probability. The probabilities must sum to 1, and E[X] need not be an attainable outcome." },
    g("\\qquad"),
    { tex: "E[aX+b] = aE[X]+b", label: "Linearity", explanation: "Expectation is linear unconditionally — E[X+Y] = E[X]+E[Y] holds whether or not X and Y are independent. Variance has no such convenience." },
  ],
  st4: [
    { tex: "\\mathrm{Cov}(X,Y) = E[XY]-E[X]E[Y]", label: "Covariance", explanation: "Whether two variables move together. Its size depends on the units, so it is hard to interpret on its own." },
    g("\\qquad"),
    { tex: "\\rho = \\dfrac{\\mathrm{Cov}(X,Y)}{\\sigma_X \\sigma_Y}", label: "Correlation", explanation: "Covariance normalised into [−1, 1], comparable across any pair of assets. ρ = 0 rules out a LINEAR relationship only — not independence." },
  ],
  st5: [
    { tex: "z =", label: "The z-score", explanation: "Expresses a value as a number of standard deviations from the mean, so one table serves every normal distribution." },
    { tex: "\\dfrac{x - \\mu}", label: "Distance from the mean", explanation: "Negative simply means below the mean — not an error." },
    { tex: "{\\sigma}", label: "In units of σ", explanation: "Divide by the standard deviation, NOT the variance. Roughly 68% of the mass lies within ±1, 95% within ±2, 99.7% within ±3." },
  ],
  st6: [
    { tex: "\\hat{y} = \\alpha + \\beta x", label: "The fitted line", explanation: "Ordinary least squares minimises the sum of squared vertical distances to the data." },
    g("\\quad"),
    { tex: "\\beta = \\dfrac{\\mathrm{Cov}(x,y)}{\\mathrm{Var}(x)}", label: "Slope", explanation: "Divides by the REGRESSOR's variance. Regress a stock on the market and this is exactly the CAPM beta." },
    g("\\quad"),
    { tex: "\\alpha = \\bar{y} - \\beta\\bar{x}", label: "Intercept", explanation: "Encodes the fact that the regression line always passes through the point of means." },
  ],

  /* ---------------------------------------------------- financial maths ---- */
  fm1: [
    { tex: "FV =", label: "Future value", explanation: "What the money is worth after n periods of compounding." },
    { tex: "PV", label: "Present value", explanation: "The amount invested today." },
    { tex: "(1 + i)", label: "Growth factor", explanation: "One period's growth. i is a decimal — 6% is 0.06, not 6." },
    { tex: "^n", label: "Compounding periods", explanation: "Growth is exponential, not linear, because each period's interest itself earns interest. Rate and period must match: 6% annual compounded monthly means i/12 and 12n." },
  ],
  fm2: [
    { tex: "PV =", label: "Present value", explanation: "What a future amount is worth today. Everything in valuation — NPV, bond pricing, DCF — is this applied repeatedly." },
    { tex: "\\dfrac{FV}", label: "The future amount", explanation: "The sum you will receive later." },
    { tex: "{(1+i)^n}", label: "Discount factor", explanation: "Discounting DIVIDES; multiplying would compound instead. A higher rate means a lower present value." },
  ],
  fm3: [
    { tex: "NPV =", label: "Net present value", explanation: "Positive means the project earns more than the required return — accept. Negative means it destroys value." },
    { tex: "-C_0", label: "Initial outlay", explanation: "Paid at t = 0, so it is NOT discounted." },
    g("+"),
    { tex: "\\sum_{t=1}^{n} \\dfrac{C_t}{(1+i)^t}", label: "Discounted inflows", explanation: "Each cash flow gets its own exponent t. One division by (1+i)ⁿ for the whole stream is wrong." },
  ],
  fm4: [
    { tex: "PV = C", label: "The payment", explanation: "One of n equal instalments. Rearranging for C gives the constant loan repayment." },
    g("\\cdot"),
    { tex: "\\dfrac{1 - (1+i)^{-n}}{i}", label: "Annuity factor", explanation: "The closed form of the geometric series, saving you from discounting each payment separately. Note the NEGATIVE exponent." },
  ],
  fm5: [
    { tex: "PV = \\dfrac{C}{i}", label: "Perpetuity", explanation: "Pays forever, yet the value is finite — the discount factor shrinks fast enough for the series to converge." },
    g("\\qquad"),
    { tex: "\\dfrac{C_1}{i - g}", label: "Gordon growth", explanation: "C₁ is NEXT period's cash flow. Used for DCF terminal values and dividend-paying stocks." },
    g("\\;"),
    { tex: "(g < i)", label: "Convergence condition", explanation: "Violate it and the series diverges, returning a meaningless negative number. The model is very sensitive when i − g is small." },
  ],
  fm6: [
    { tex: "EAR =", label: "Effective annual rate", explanation: "The single annual rate producing the same growth — the only fair way to compare offers with different compounding frequencies." },
    { tex: "\\left(1 + \\dfrac{i_{nom}}{m}\\right)", label: "Rate per period", explanation: "The quoted nominal rate divided by the number of periods per year." },
    { tex: "^m", label: "Periods per year", explanation: "m is compounding frequency, not years. More frequent compounding always raises the effective rate." },
    { tex: "- 1", label: "Back to a rate", explanation: "Subtracting one turns the growth factor into a rate. Forgetting it is a common slip." },
  ],
  fm7: [
    { tex: "0 =", label: "NPV set to zero", explanation: "The IRR is defined as the discount rate that makes NPV exactly zero — the project's implied annualised return." },
    { tex: "-C_0 + \\sum_{t=1}^{n}\\dfrac{C_t}{(1+IRR)^t}", label: "Solve for IRR", explanation: "Beyond two periods this cannot be solved algebraically — it is found numerically. Accept when IRR exceeds the cost of capital, but prefer NPV when the two criteria disagree." },
  ],
};

/** The anatomy for a rule, or null when none is authored — callers then render the plain formula. */
export function anatomyFor(ruleId: string): MathAnatomyPart[] | null {
  return MATH_ANATOMY[ruleId] ?? null;
}
