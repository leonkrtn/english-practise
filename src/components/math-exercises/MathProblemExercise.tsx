"use client";

import { useState } from "react";
import { MATH_RULES_BY_ID } from "@/lib/mathRules";
import { checkMathAnswer } from "@/lib/mathAnswerCheck";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { AnswerInput, ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import type { MathExerciseProps } from "./types";

const LABEL: Record<"solve" | "simplify", string> = {
  solve: "Differentiate",
  simplify: "Simplify",
};

export default function MathProblemExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const kind = item.kind as "solve" | "simplify";
  const problem = rule[kind][item.problemIndex];

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function check() {
    if (result) return;
    const ok = checkMathAnswer(value, [problem.answer, ...(problem.accepted ?? [])]);
    const res: AnswerResultKind = ok ? "correct" : "incorrect";
    setResult(res);
    onAnswered({ ruleId: rule.id, format: `math-${kind}`, result: res });
  }

  return (
    <>
      <Prompt>{LABEL[kind]}</Prompt>
      <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center">
        <Formula tex={problem.promptTex} display className="text-[19px]" />
      </div>
      <AnswerInput value={value} onChange={setValue} status={result} disabled={!!result} placeholder="e.g. 3*x^2" onEnter={check} />
      <div className="text-[12px] text-ink-faint mt-1.5">
        Use <code className="font-mono">*</code> for multiplication, <code className="font-mono">^</code> for powers — e.g.{" "}
        <code className="font-mono">3*x^2</code>, <code className="font-mono">e^(2x)</code>.
      </div>
      {!result && (
        <ExerciseFooter>
          <div />
          <PrimaryButton onClick={check} disabled={!value.trim()}>
            Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
          </PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div>
            Correct answer: <code className="font-mono font-semibold text-ink">{problem.answer}</code>
          </div>
        </FeedbackPanel>
      )}
    </>
  );
}
