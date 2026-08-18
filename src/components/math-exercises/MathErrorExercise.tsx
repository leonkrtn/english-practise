"use client";

import { useState } from "react";
import { MATH_RULES_BY_ID } from "@/lib/math";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { FeedbackPanel, Prompt } from "@/components/exercises/shared";
import { FormulaSheet, MathBadge } from "./shared";
import type { MathExerciseProps } from "./types";

/** Find-the-error: a worked solution with exactly one wrong line. Tap the line you believe is wrong. */
export default function MathErrorExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const problem = rule.error[item.problemIndex] ?? rule.error[0];

  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  function select(index: number) {
    if (result) return;
    setPicked(index);
    const res: AnswerResultKind = index === problem.wrongLineIndex ? "correct" : "incorrect";
    setResult(res);
    onAnswered({ ruleId: rule.id, format: "math-error", result: res, hintsUsed: 0 });
  }

  return (
    <>
      <MathBadge rule={rule} />
      <Prompt>In welcher Zeile steckt der Fehler?</Prompt>

      <div className="mb-2 overflow-x-auto">
        <Formula tex={problem.promptTex} className="text-[15px] text-ink-soft" />
      </div>

      <div className="flex flex-col gap-2">
        {problem.lines.map((line, i) => {
          const isWrong = i === problem.wrongLineIndex;
          const isPicked = i === picked;
          const stateClass = !result
            ? "border-line bg-card hover:border-blue hover:bg-blue-lighter"
            : isWrong
            ? "border-green bg-green-light"
            : isPicked
            ? "border-red bg-red-light"
            : "border-line-soft bg-card opacity-60";
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={!!result}
              className={"flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-colors overflow-x-auto " + stateClass}
            >
              <span className="text-[10px] font-bold text-ink-faint tabular-nums shrink-0 w-4">{i + 1}</span>
              <Formula tex={line} className="text-[15px]" />
            </button>
          );
        })}
      </div>

      {!result && <FormulaSheet rule={rule} />}

      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-2">
            <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1">Richtig wäre</div>
            <Formula tex={problem.correctedLineTex} className="text-[15px]" />
          </div>
          <div className="text-[13.5px] leading-relaxed">{problem.explanation}</div>
        </FeedbackPanel>
      )}
    </>
  );
}
