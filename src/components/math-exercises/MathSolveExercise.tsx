"use client";

import { useState } from "react";
import { MATH_RULES_BY_ID, type MathProblem, type MathRule, type MathWordProblem } from "@/lib/math";
import { checkMathAnswer } from "@/lib/mathAnswerCheck";
import { renderKindFor, type MathQueueItem } from "@/lib/mathLearning";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { AnswerInput, ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { FormulaSheet, HintStack, MathBadge, MathSyntaxHint, SolutionPath, useMathHints } from "./shared";
import type { MathExerciseProps } from "./types";

const LABEL: Record<string, string> = {
  solve: "Solve",
  simplify: "Simplify",
  word: "Application",
};

/** Handles the three typed-answer kinds — solve, simplify and word problems — which differ only in
 * their label and in whether a prose scenario sits above the formula. */
export default function MathSolveExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const kind = renderKindFor(item) as "solve" | "simplify" | "word";
  const problem = pickProblem(rule, item, kind);

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const { revealed, reveal, hintsUsed } = useMathHints(problem.hints);

  function check() {
    if (result) return;
    const ok = checkMathAnswer(value, [problem.answer, ...(problem.accepted ?? [])]);
    const res: AnswerResultKind = ok ? "correct" : "incorrect";
    setResult(res);
    onAnswered({ ruleId: rule.id, format: `math-${kind}`, result: res, hintsUsed });
  }

  const scenario = "scenario" in problem ? problem.scenario : undefined;
  const unit = "unit" in problem ? problem.unit : undefined;

  return (
    <>
      <MathBadge rule={rule} />
      <Prompt>{LABEL[kind] ?? "Solve"}</Prompt>

      {scenario && <div className="text-[15px] text-ink leading-relaxed mb-3">{scenario}</div>}

      {problem.promptTex && (
        <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center overflow-x-auto">
          <Formula tex={problem.promptTex} display className="text-[18px]" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="e.g. 3*x^2" onEnter={check} />
        </div>
        {unit && <span className="text-[15px] font-semibold text-ink-faint shrink-0">{unit}</span>}
      </div>
      <MathSyntaxHint />

      {!result && (
        <>
          <HintStack hints={problem.hints} revealed={revealed} onReveal={reveal} />
          <FormulaSheet rule={rule} />
          <ExerciseFooter>
            <div />
            <PrimaryButton onClick={check} disabled={!value.trim()}>
              Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
            </PrimaryButton>
          </ExerciseFooter>
        </>
      )}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-2">
            Correct answer: <code className="font-mono font-semibold text-ink">{problem.answer}</code>
          </div>
          <SolutionPath steps={problem.solution} />
        </FeedbackPanel>
      )}
    </>
  );
}

/** Narrows the rule's arrays down to the one this item points at, with a safe fallback if a content
 * edit ever leaves the chosen index out of range. */
function pickProblem(rule: MathRule, item: MathQueueItem, kind: "solve" | "simplify" | "word"): MathProblem | MathWordProblem {
  const pool: (MathProblem | MathWordProblem)[] = kind === "solve" ? rule.solve : kind === "simplify" ? rule.simplify : rule.word;
  const fallback = rule.solve[0] ?? rule.simplify[0] ?? rule.word[0];
  return pool[item.problemIndex] ?? pool[0] ?? fallback;
}
