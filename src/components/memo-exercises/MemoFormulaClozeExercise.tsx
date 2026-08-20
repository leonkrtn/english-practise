"use client";

import { useCallback, useState } from "react";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel, Prompt, useNumberShortcuts } from "@/components/exercises/shared";
import Formula from "@/components/Formula";
import { MemoBadge, RuleSheet } from "./shared";
import type { MemoExerciseProps } from "./types";

/** Where the missing piece goes. Authored as `\square`, which KaTeX renders as an empty box. */
const BLANK = "\\square";

/** The blank, tinted so the eye lands on it before reading the rest of the formula. */
const highlight = (template: string) => template.replace(BLANK, "\\textcolor{#0071e3}{\\square}");

const fill = (template: string, tex: string, colour: string) =>
  template.replace(BLANK, "\\textcolor{" + colour + "}{" + tex + "}");

/**
 * Reproduce a formula with one piece missing, choosing from four candidates.
 *
 * Multiple choice rather than typed on purpose: typing LaTeX tests keyboard skill, not memory. The
 * distractors carry the work instead — each one is a formula the learner might plausibly write, so
 * picking the right one means having the real thing in mind rather than recognising a shape.
 */
export default function MemoFormulaClozeExercise({ item, rule, onAnswered, onNext }: MemoExerciseProps) {
  const problem = rule.formulaCloze[item.problemIndex] ?? rule.formulaCloze[0];

  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  const select = useCallback(
    (index: number) => {
      if (result) return;
      setChosen(index);
      const res: AnswerResultKind = index === problem.correctIndex ? "correct" : "incorrect";
      setResult(res);
      onAnswered({ ruleId: rule.id, format: "memo-formulacloze", result: res, hintsUsed: 0 });
    },
    [result, problem.correctIndex, onAnswered, rule.id]
  );

  useNumberShortcuts(problem.options.length, select, !!result);

  // Once answered the formula completes itself in place — green for the piece they picked if it was
  // right, red if it was wrong, so the corrected formula is what stays on screen.
  const shown =
    result === null
      ? highlight(problem.templateTex)
      : fill(problem.templateTex, problem.options[chosen ?? problem.correctIndex], result === "correct" ? "#1eb676" : "#e8483a");

  return (
    <>
      <MemoBadge rule={rule} />
      <Prompt>Complete the formula</Prompt>

      <div className="rounded-2xl border border-line-soft bg-card px-4 py-6 mb-4 text-center overflow-x-auto">
        <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-3">{rule.title}</div>
        <Formula tex={shown} display className="text-[19px]" />
        {result === "incorrect" && (
          <div className="mt-3 pt-3 border-t border-line-soft">
            <div className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1.5">Correct</div>
            <Formula tex={fill(problem.templateTex, problem.options[problem.correctIndex], "#1eb676")} display className="text-[17px]" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
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
                "flex items-center gap-2 rounded-xl border-[1.5px] px-3 py-3 text-left transition-colors overflow-x-auto " + stateClass
              }
            >
              <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft shrink-0">{i + 1}</span>
              <Formula tex={opt} className="text-[15px]" />
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
