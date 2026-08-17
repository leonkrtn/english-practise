/**
 * Grading for typed math answers. Two passes, in order:
 *
 *  1. **Syntactic** — normalize both sides (whitespace, `**` vs `^`, implicit multiplication) and
 *     compare as strings. This is what catches `4x^3` for `4*x^3`.
 *  2. **Numeric** — if both sides parse as pure numbers (no free variables), compare their values
 *     with a relative tolerance. This is what makes `3/4`, `0.75` and `sqrt(9)/4` all count as the
 *     same answer, which matters constantly in the financial-math and statistics problems.
 *
 * It is deliberately not a computer algebra system: `x*(x+1)` and `x^2+x` are algebraically equal
 * but are NOT recognised as such. Genuinely different-looking correct forms are listed per problem
 * in the `accepted` array instead.
 */

export function normalizeMathExpr(input: string): string {
  let s = input.trim().toLowerCase();
  if (!s) return "";
  s = s.replace(/\s+/g, "");
  s = s.replace(/\*\*/g, "^");
  s = s.replace(/[·×]/g, "*");
  s = s.replace(/[−–—]/g, "-");
  s = s.replace(/,/g, "."); // German decimal comma
  // Implicit multiplication: a digit directly followed by a letter or "(" (2x, 2e^x, 3(x+1)).
  s = s.replace(/(\d)([a-z(])/g, "$1*$2");
  // …and after a closing paren: ")(" or ")2" or ")x".
  s = s.replace(/(\))(\d|[a-z(])/g, "$1*$2");
  // A variable directly followed by "(" — x(x+1) means multiplication, but sqrt(9) and ln(x) do
  // not, so the letter run is only split when it isn't a function name.
  s = s.replace(/([a-z]+)\(/g, (match, word: string) => (KNOWN_NAMES.has(word) ? match : `${word}*(`));
  return s;
}

/** Function and constant names that legitimately precede a "(" without an implied multiplication. */
const KNOWN_NAMES = new Set(["sqrt", "ln", "log", "exp", "abs", "sin", "cos", "tan"]);

/* ------------------------------------------------------------ numeric eval ---- */

/**
 * A tiny recursive-descent parser for arithmetic, so numeric answers can be compared by VALUE
 * rather than by spelling. Deliberately hand-written rather than routed through `eval`/`Function`:
 * this parses learner-typed strings, and an expression grammar with a fixed function table cannot
 * reach anything outside itself.
 *
 * Grammar:  expr := term (('+'|'-') term)*
 *           term := power (('*'|'/') power)*
 *           power := unary ('^' power)?          — right-associative
 *           unary := ('-')? atom
 *           atom := number | 'pi' | 'e' | func '(' expr ')' | '(' expr ')'
 *
 * Returns null for anything containing a free variable, which is exactly the signal that the
 * answer is algebraic and must be graded syntactically instead.
 */
const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
};

function evaluateNumeric(src: string): number | null {
  let i = 0;

  const eat = (ch: string) => {
    if (src[i] === ch) {
      i++;
      return true;
    }
    return false;
  };

  function parseExpr(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    for (;;) {
      if (eat("+")) {
        const r = parseTerm();
        if (r === null) return null;
        left += r;
      } else if (eat("-")) {
        const r = parseTerm();
        if (r === null) return null;
        left -= r;
      } else return left;
    }
  }

  function parseTerm(): number | null {
    let left = parsePower();
    if (left === null) return null;
    for (;;) {
      if (eat("*")) {
        const r = parsePower();
        if (r === null) return null;
        left *= r;
      } else if (eat("/")) {
        const r = parsePower();
        if (r === null) return null;
        left /= r;
      } else return left;
    }
  }

  function parsePower(): number | null {
    const base = parseUnary();
    if (base === null) return null;
    if (eat("^")) {
      const exp = parsePower(); // right-associative
      if (exp === null) return null;
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number | null {
    if (eat("-")) {
      const v = parseUnary();
      return v === null ? null : -v;
    }
    eat("+");
    return parseAtom();
  }

  function parseAtom(): number | null {
    if (eat("(")) {
      const v = parseExpr();
      if (v === null || !eat(")")) return null;
      return v;
    }

    const numMatch = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (numMatch) {
      i += numMatch[0].length;
      return parseFloat(numMatch[0]);
    }

    const nameMatch = /^[a-z]+/.exec(src.slice(i));
    if (nameMatch) {
      const name = nameMatch[0];
      i += name.length;
      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;
      const fn = FUNCS[name];
      if (fn && eat("(")) {
        const arg = parseExpr();
        if (arg === null || !eat(")")) return null;
        return fn(arg);
      }
      return null; // a free variable — not a numeric expression
    }

    return null;
  }

  const value = parseExpr();
  // Trailing junk means we did not understand the whole string, so don't trust a partial parse.
  if (value === null || i !== src.length || !Number.isFinite(value)) return null;
  return value;
}

/** Relative tolerance, with an absolute floor so values near zero still compare sensibly.
 * 0.5% is loose enough for a hand-rounded 26.82 against an exact 26.8242. */
function numericallyEqual(a: number, b: number): boolean {
  const diff = Math.abs(a - b);
  if (diff < 1e-9) return true;
  const scale = Math.max(Math.abs(a), Math.abs(b));
  return diff / scale < 0.005;
}

/* ---------------------------------------------------------------- grading ---- */

export function checkMathAnswer(userInput: string, accepted: string[]): boolean {
  const norm = normalizeMathExpr(userInput);
  if (!norm) return false;

  const normalizedAccepted = accepted.map(normalizeMathExpr);
  if (normalizedAccepted.some((a) => a === norm)) return true;

  const userValue = evaluateNumeric(norm);
  if (userValue === null) return false;
  return normalizedAccepted.some((a) => {
    const v = evaluateNumeric(a);
    return v !== null && numericallyEqual(userValue, v);
  });
}

/** Exposed for the test screen, which grades the same way but needs the parsed value for partial credit. */
export { evaluateNumeric };
