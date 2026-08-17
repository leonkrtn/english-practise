/**
 * Lightweight grading for typed math answers — not a computer algebra system. Both the learner's
 * input and every accepted string are pushed through the same normalization, so syntax variants
 * (spaces, `**` vs `^`, `2x` vs `2*x`) collapse to the same key. Genuinely different-looking correct
 * forms (reordered terms, `e^x` vs a decimal) aren't inferred — they're listed explicitly per problem.
 */
export function normalizeMathExpr(input: string): string {
  let s = input.trim().toLowerCase();
  if (!s) return "";
  s = s.replace(/\s+/g, "");
  s = s.replace(/\*\*/g, "^");
  s = s.replace(/[·×]/g, "*");
  // Implicit multiplication: a digit directly followed by a letter or "(" (2x, 2e^x, 3(x+1)).
  s = s.replace(/(\d)([a-z(])/g, "$1*$2");
  // Implicit multiplication after a closing paren: ")(" or ")2" or ")x".
  s = s.replace(/(\))(\d|[a-z(])/g, "$1*$2");
  return s;
}

export function checkMathAnswer(userInput: string, accepted: string[]): boolean {
  const norm = normalizeMathExpr(userInput);
  if (!norm) return false;
  return accepted.some((a) => normalizeMathExpr(a) === norm);
}
