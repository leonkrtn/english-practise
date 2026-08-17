import { rule, type MathRule } from "./types";

export const LINEAR_ALGEBRA_RULES: MathRule[] = [
  rule({
    id: "la1",
    topic: "linear-algebra",
    category: "Matrix operations",
    title: "Matrix Multiplication",
    difficulty: "core",
    formulaTex: "(AB)_{ij} = \\sum_k a_{ik}b_{kj} \\qquad A_{m\\times n} \\cdot B_{n\\times p} = C_{m\\times p}",
    explanation:
      "Entry (i,j) of the product is the dot product of row i of A with column j of B. The inner dimensions must match — an m×n matrix can only multiply an n×p matrix — and the result inherits the outer dimensions. Matrix multiplication is associative and distributive but NOT commutative: AB and BA are generally different, and one may not even be defined.",
    pitfalls: [
      "AB ≠ BA in general. Order matters throughout linear algebra.",
      "Check the dimensions before multiplying; mismatched inner dimensions mean the product does not exist.",
      "AB = 0 does not imply A = 0 or B = 0 — there are genuine zero divisors among matrices.",
    ],
    examples: [
      {
        problemTex: "\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\begin{pmatrix}5\\\\6\\end{pmatrix}",
        steps: ["\\begin{pmatrix}1\\cdot5 + 2\\cdot6\\\\3\\cdot5+4\\cdot6\\end{pmatrix}", "\\begin{pmatrix}17\\\\39\\end{pmatrix}"],
      },
    ],
    mc: [
      {
        question: "What are the dimensions of the product AB?",
        promptTex: "A_{3\\times 2}, \\quad B_{2\\times 4}",
        options: ["3\\times 4", "2\\times 2", "4\\times 3", "\\text{undefined}"],
        correctIndex: 0,
        hints: ["The inner dimensions (2 and 2) must match — they do.", "The result takes the outer dimensions."],
        solution: ["(3\\times \\underline{2})(\\underline{2}\\times 4) \\Rightarrow 3\\times 4"],
      },
      {
        question: "Which statement is true for general square matrices?",
        promptTex: "A, B \\in \\mathbb{R}^{n \\times n}",
        options: ["AB \\neq BA \\text{ in general}", "AB = BA \\text{ always}", "A B = 0 \\Rightarrow A = 0", "(AB)^T = A^T B^T"],
        correctIndex: 0,
        hints: ["Try a small 2×2 example to test commutativity.", "Matrix multiplication is famously non-commutative."],
        solution: ["\\text{Matrix multiplication is not commutative.}", "\\text{Also note } (AB)^T = B^T A^T \\text{ — the order reverses.}"],
      },
    ],
    solve: [
      {
        promptTex: "\\begin{pmatrix}2&0\\\\1&3\\end{pmatrix}\\begin{pmatrix}1\\\\4\\end{pmatrix} = \\begin{pmatrix}a\\\\b\\end{pmatrix}. \\text{ Give } a.",
        answer: "2",
        hints: ["Row 1 of A is (2, 0); the column is (1, 4).", "2·1 + 0·4."],
        solution: ["a = 2\\cdot1 + 0\\cdot4 = 2", "b = 1\\cdot1 + 3\\cdot4 = 13"],
      },
    ],
  }),

  rule({
    id: "la2",
    topic: "linear-algebra",
    category: "Determinants",
    title: "Determinant of a 2×2 Matrix",
    difficulty: "foundation",
    formulaTex: "\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc",
    explanation:
      "Main diagonal product minus anti-diagonal product. The determinant measures how the matrix scales area: |det A| is the factor by which the unit square's area changes, and a negative sign means the orientation flips. A determinant of zero means the matrix collapses space onto a lower dimension, which is exactly the condition for it being non-invertible.",
    pitfalls: [
      "ad − bc, not ab − cd. It is the diagonals, not the rows.",
      "det = 0 means singular: no inverse, and the associated system has either no solution or infinitely many.",
    ],
    examples: [
      { problemTex: "\\det\\begin{pmatrix}3&1\\\\2&4\\end{pmatrix}", steps: ["3\\cdot4 - 1\\cdot2", "12 - 2 = 10"] },
    ],
    solve: [
      {
        promptTex: "\\det\\begin{pmatrix}5&2\\\\3&4\\end{pmatrix}",
        answer: "14",
        hints: ["ad − bc with a=5, b=2, c=3, d=4.", "20 − 6."],
        solution: ["5 \\cdot 4 - 2 \\cdot 3 = 20 - 6 = 14"],
      },
      {
        promptTex: "\\det\\begin{pmatrix}2&4\\\\1&2\\end{pmatrix}",
        answer: "0",
        hints: ["2·2 − 4·1.", "The rows are proportional — that always gives 0."],
        solution: ["4 - 4 = 0", "\\text{singular: the second row is } \\tfrac12 \\text{ of the first}"],
      },
    ],
    mc: [
      {
        question: "What does det(A) = 0 tell you?",
        promptTex: "\\det(A) = 0",
        options: [
          "A \\text{ has no inverse}",
          "A \\text{ is the zero matrix}",
          "A \\text{ is the identity}",
          "A \\text{ is symmetric}",
        ],
        correctIndex: 0,
        hints: ["The inverse formula divides by the determinant.", "Dividing by zero is impossible — hence singular."],
        solution: ["A^{-1} = \\dfrac{1}{\\det A}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}", "\\det A = 0 \\Rightarrow \\text{no inverse exists}"],
      },
    ],
  }),

  rule({
    id: "la3",
    topic: "linear-algebra",
    category: "Determinants",
    title: "Inverse of a 2×2 Matrix",
    difficulty: "core",
    formulaTex: "A^{-1} = \\dfrac{1}{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}",
    explanation:
      "Swap the two main-diagonal entries, negate the other two, and divide everything by the determinant. The inverse exists precisely when det A ≠ 0. Its defining property is AA⁻¹ = A⁻¹A = I, which is what makes it the tool for solving matrix equations: Ax = b becomes x = A⁻¹b.",
    pitfalls: [
      "a and d SWAP places; b and c stay put but change sign. Mixing that up is the standard error.",
      "There is no such thing as dividing by a matrix — you multiply by the inverse, and on the correct side.",
    ],
    examples: [
      {
        problemTex: "A = \\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}",
        steps: ["\\det A = 2 - 1 = 1", "A^{-1} = \\dfrac{1}{1}\\begin{pmatrix}1&-1\\\\-1&2\\end{pmatrix}"],
      },
    ],
    steps: [
      {
        promptTex: "A = \\begin{pmatrix}4&2\\\\1&1\\end{pmatrix}",
        steps: [
          { instruction: "Compute det(A).", answer: "2", hint: "4·1 − 2·1." },
          { instruction: "In the adjugate matrix, what is the top-left entry (before dividing)?", answer: "1", hint: "a and d swap, so d = 1 goes top-left." },
          { instruction: "After dividing by det, what is the top-left entry of A⁻¹?", answer: "1/2", accepted: ["0.5"], hint: "1 divided by the determinant 2." },
        ],
        solution: [
          "\\det A = 4 - 2 = 2",
          "A^{-1} = \\dfrac{1}{2}\\begin{pmatrix}1&-2\\\\-1&4\\end{pmatrix}",
          "= \\begin{pmatrix}0.5&-1\\\\-0.5&2\\end{pmatrix}",
        ],
      },
    ],
  }),

  rule({
    id: "la4",
    topic: "linear-algebra",
    category: "Systems",
    title: "Linear Systems and Cramer's Rule",
    difficulty: "core",
    formulaTex: "Ax = b \\;\\Rightarrow\\; x_i = \\dfrac{\\det A_i}{\\det A}",
    explanation:
      "Every linear system can be written as a matrix equation Ax = b. Cramer's rule solves it component by component: replace column i of A with the vector b, take that determinant, and divide by det A. It is the quickest hand method for 2×2 and 3×3 systems; beyond that, elimination is far more efficient. It requires det A ≠ 0, i.e. a unique solution.",
    pitfalls: [
      "det A = 0 means Cramer's rule does not apply — the system has zero or infinitely many solutions.",
      "You replace the column corresponding to the variable you are solving for, not the row.",
    ],
    examples: [
      {
        problemTex: "\\begin{cases}2x + y = 5\\\\x - y = 1\\end{cases}",
        steps: [
          "\\det A = \\det\\begin{pmatrix}2&1\\\\1&-1\\end{pmatrix} = -3",
          "\\det A_1 = \\det\\begin{pmatrix}5&1\\\\1&-1\\end{pmatrix} = -6",
          "x = \\dfrac{-6}{-3} = 2, \\quad y = 1",
        ],
      },
    ],
    solve: [
      {
        promptTex: "\\begin{cases}x + y = 7\\\\x - y = 1\\end{cases} \\quad \\text{Give } x.",
        answer: "4",
        hints: ["Add the two equations to eliminate y.", "2x = 8."],
        solution: ["\\text{adding: } 2x = 8 \\Rightarrow x = 4", "y = 3"],
      },
      {
        promptTex: "\\begin{cases}3x + 2y = 12\\\\x = 2\\end{cases} \\quad \\text{Give } y.",
        answer: "3",
        hints: ["Substitute x = 2 into the first equation.", "6 + 2y = 12."],
        solution: ["3(2) + 2y = 12", "2y = 6 \\Rightarrow y = 3"],
      },
    ],
    mc: [
      {
        question: "The system Ax = b has det A = 0 and b ≠ 0. What can you conclude?",
        promptTex: "\\det A = 0",
        options: [
          "\\text{no unique solution (none or infinitely many)}",
          "\\text{exactly one solution}",
          "x = 0 \\text{ is the only solution}",
          "\\text{the system is always inconsistent}",
        ],
        correctIndex: 0,
        hints: ["A zero determinant means A is not invertible.", "Without an inverse you cannot isolate a single x."],
        solution: ["\\det A = 0 \\Rightarrow A \\text{ singular}", "\\Rightarrow \\text{no solution or infinitely many}"],
      },
    ],
  }),

  rule({
    id: "la5",
    topic: "linear-algebra",
    category: "Eigenvalues",
    title: "Eigenvalues and Eigenvectors",
    difficulty: "advanced",
    formulaTex: "Av = \\lambda v \\quad \\Leftrightarrow \\quad \\det(A - \\lambda I) = 0",
    explanation:
      "An eigenvector is a direction the matrix does not rotate — it only stretches it, by the factor λ. Finding eigenvalues means solving the characteristic equation det(A − λI) = 0, a polynomial in λ. In finance these appear in principal component analysis and in covariance-matrix decomposition, where the eigenvalues are the variances along the principal directions.",
    pitfalls: [
      "You subtract λ from the DIAGONAL only — that is what λI means.",
      "The zero vector is never an eigenvector, though 0 can be an eigenvalue.",
      "A 2×2 matrix has two eigenvalues counted with multiplicity, but they may be complex.",
    ],
    examples: [
      {
        problemTex: "A = \\begin{pmatrix}3&0\\\\0&5\\end{pmatrix}",
        steps: ["\\det\\begin{pmatrix}3-\\lambda&0\\\\0&5-\\lambda\\end{pmatrix} = 0", "(3-\\lambda)(5-\\lambda)=0", "\\lambda_1 = 3, \\; \\lambda_2 = 5"],
      },
    ],
    solve: [
      {
        promptTex: "A = \\begin{pmatrix}2&0\\\\0&7\\end{pmatrix}. \\text{ Give the larger eigenvalue.}",
        answer: "7",
        hints: ["For a diagonal matrix the eigenvalues are just the diagonal entries.", "They are 2 and 7."],
        solution: ["\\lambda_1 = 2, \\; \\lambda_2 = 7", "\\text{larger: } 7"],
      },
    ],
    mc: [
      {
        question: "What does Av = λv mean geometrically?",
        promptTex: "Av = \\lambda v",
        options: [
          "v \\text{ keeps its direction and is only scaled}",
          "v \\text{ is rotated by } \\lambda \\text{ degrees}",
          "v \\text{ becomes the zero vector}",
          "A \\text{ is the identity matrix}",
        ],
        correctIndex: 0,
        hints: ["The output is a multiple of the input.", "A multiple of a vector points the same way (or exactly opposite)."],
        solution: ["Av \\parallel v", "\\text{the matrix stretches } v \\text{ by } \\lambda \\text{ without turning it}"],
      },
    ],
  }),
];
