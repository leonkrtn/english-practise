"use client";

import { useCallback, useState } from "react";
import { MATH_RULES_BY_ID } from "@/lib/math";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { FeedbackPanel, Prompt, useNumberShortcuts } from "@/components/exercises/shared";
import { FormulaSheet, HintStack, MathBadge, SolutionPath, useMathHints } from "./shared";
import type { MathExerciseProps } from "./types";

export default function MathMcExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const problem = rule.mc[item.problemIndex] ?? rule.mc[0];

  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const { revealed, reveal, hintsUsed } = useMathHints(problem.hints);

  const select = useCallback(
    (index: number) => {
      if (result) return;
      setChosen(index);
      const res: AnswerResultKind = index === problem.correctIndex ? "correct" : "incorrect";
      setResult(res);
      onAnswered({ ruleId: rule.id, format: "math-mc", result: res, hintsUsed });
    },
    [result, problem.correctIndex, onAnswered, rule.id, hintsUsed]
  );

  useNumberShortcuts(problem.options.length, select, !!result);

  return (
    <>
      <MathBadge rule={rule} />
      <Prompt>{problem.question}</Prompt>

      {problem.promptTex && (
        <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center overflow-x-auto">
          <Formula tex={problem.promptTex} display className="text-[18px]" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {problem.options.map((opt, i) => {
          const isCorrect = i === problem.correctIndex;
          const isChosen = i === chosen;
          const stateClass = !result
            ? "border-line bg-card hover:border-blue hover:bg-blue-lighter"
            : isCorrect
            ? "border-green bg-green-light"
            : isChosen
            ? "border-red bg-red-light"
            : "border-line-soft bg-card opacity-60";
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={!!result}
              className={"flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors " + stateClass}
            >
              <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft shrink-0">{i + 1}</span>
              <Formula tex={opt} className="text-[15px]" />
            </button>
          );
        })}
      </div>

      {!result && (
        <>
          <HintStack hints={problem.hints} revealed={revealed} onReveal={reveal} />
          <FormulaSheet rule={rule} />
        </>
      )}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <SolutionPath steps={problem.solution} />
        </FeedbackPanel>
      )}
    </>
  );
}
