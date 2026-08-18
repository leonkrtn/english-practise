"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { MATH_RULES_BY_ID } from "@/lib/math";
import { checkMathAnswer } from "@/lib/mathAnswerCheck";
import type { AnswerResultKind } from "@/lib/types";
import Formula from "@/components/Formula";
import { AnswerInput, ExerciseFooter, FeedbackPanel, PrimaryButton, Prompt } from "@/components/exercises/shared";
import { FormulaSheet, HintStack, MathBadge, MathSyntaxHint, SolutionPath, useMathHints } from "./shared";
import type { MathExerciseProps } from "./types";

/**
 * Guided multi-step solve. Each step is checked on its own and, once answered, stays visible as a
 * completed line so the learner can see the chain they built. The overall result is "correct" only
 * if every step was right first time; a single miss grades the whole item as incorrect, which is
 * what keeps the stage ladder honest.
 */
export default function MathStepsExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];
  const problem = rule.steps[item.problemIndex] ?? rule.steps[0];

  const [stepIndex, setStepIndex] = useState(0);
  const [value, setValue] = useState("");
  const [done, setDone] = useState<{ answer: string; ok: boolean }[]>([]);
  const [result, setResult] = useState<AnswerResultKind | null>(null);

  const step = problem.steps[stepIndex];
  const { revealed, reveal, hintsUsed } = useMathHints(step ? [step.hint] : []);
  const [totalHints, setTotalHints] = useState(0);

  function check() {
    if (result || !step) return;
    const ok = checkMathAnswer(value, [step.answer, ...(step.accepted ?? [])]);
    const nextDone = [...done, { answer: value, ok }];
    setDone(nextDone);
    setValue("");
    setTotalHints((n) => n + hintsUsed);

    const isLast = stepIndex === problem.steps.length - 1;
    if (isLast) {
      const allOk = nextDone.every((d) => d.ok);
      const res: AnswerResultKind = allOk ? "correct" : "incorrect";
      setResult(res);
      onAnswered({ ruleId: rule.id, format: "math-steps", result: res, hintsUsed: totalHints + hintsUsed });
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <>
      <MathBadge rule={rule} />
      <Prompt>
        Step by step · {Math.min(stepIndex + 1, problem.steps.length)} of {problem.steps.length}
      </Prompt>

      <div className="bg-bg rounded-xl px-4 py-4 mb-4 text-center overflow-x-auto">
        <Formula tex={problem.promptTex} display className="text-[18px]" />
      </div>

      {done.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {done.map((d, i) => (
            <div
              key={i}
              className={
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] " +
                (d.ok ? "bg-green-light/60 text-ink-soft" : "bg-red-light/50 text-ink-soft")
              }
            >
              <span
                className={
                  "w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 " + (d.ok ? "bg-green" : "bg-red")
                }
              >
                {d.ok ? <Check size={11} /> : <X size={11} />}
              </span>
              <span className="text-ink-faint truncate">{problem.steps[i].instruction}</span>
              <code className="font-mono font-semibold text-ink ml-auto shrink-0">{d.ok ? d.answer : problem.steps[i].answer}</code>
            </div>
          ))}
        </div>
      )}

      {!result && step && (
        <>
          <div className="text-[15px] text-ink leading-relaxed mb-3">{step.instruction}</div>
          <AnswerInput value={value} onChange={setValue} status={null} disabled={false} placeholder="e.g. 3*x^2" onEnter={check} />
          <MathSyntaxHint />
          <HintStack hints={[step.hint]} revealed={revealed} onReveal={reveal} />
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
          <SolutionPath steps={problem.solution} />
        </FeedbackPanel>
      )}
    </>
  );
}
