"use client";

import { useCallback, useState } from "react";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel, Prompt, useNumberShortcuts } from "@/components/exercises/shared";
import Formula from "@/components/Formula";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

export default function MemoMcExercise({ item, rule, onAnswered, onNext }: MemoExerciseProps) {
  const problem = rule.mc[item.problemIndex] ?? rule.mc[0];

  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  const select = useCallback(
    (index: number) => {
      if (result) return;
      setChosen(index);
      const res: AnswerResultKind = index === problem.correctIndex ? "correct" : "incorrect";
      setResult(res);
      onAnswered({ ruleId: rule.id, format: "memo-mc", result: res, hintsUsed: 0 });
    },
    [result, problem.correctIndex, onAnswered, rule.id]
  );

  useNumberShortcuts(problem.options.length, select, !!result);

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>{problem.question}</Prompt>

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
              className={
                "flex items-start gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors " +
                (problem.optionsAreTex ? "overflow-x-auto " : "") +
                stateClass
              }
            >
              <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft shrink-0 mt-0.5">{i + 1}</span>
              {problem.optionsAreTex ? (
                <Formula tex={opt} className="text-[15px]" />
              ) : (
                <span className="text-[14.5px] leading-snug">{opt}</span>
              )}
            </button>
          );
        })}
      </div>

      {!result && <RuleSheet rule={rule} />}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="text-[13.5px] leading-relaxed">{problem.explanation}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
