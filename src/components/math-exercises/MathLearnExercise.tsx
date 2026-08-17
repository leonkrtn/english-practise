"use client";

import { MATH_RULES_BY_ID } from "@/lib/mathRules";
import Formula from "@/components/Formula";
import { PrimaryButton } from "@/components/exercises/shared";
import type { MathExerciseProps } from "./types";

export default function MathLearnExercise({ item, onAnswered, onNext }: MathExerciseProps) {
  const rule = MATH_RULES_BY_ID[item.ruleId];

  function acknowledge() {
    onAnswered({ ruleId: rule.id, format: "math-learn", result: "correct" });
    onNext();
  }

  return (
    <>
      <div className="text-[11px] font-bold uppercase tracking-wide text-amber mb-3">{rule.category}</div>
      <div className="text-[20px] font-bold tracking-tight mb-4">{rule.title}</div>
      <div className="bg-gradient-to-br from-amber-light to-amber-light/40 rounded-xl p-5 mb-4 text-center">
        <Formula tex={rule.formulaTex} display className="text-[22px]" />
      </div>
      <div className="text-[15px] text-ink-soft leading-relaxed mb-4">{rule.explanation}</div>
      <div className="flex flex-col gap-2.5 mb-5">
        {rule.examples.map((ex, i) => (
          <div key={i} className="bg-bg rounded-xl px-4 py-3 flex items-center gap-2 text-[15px]">
            <Formula tex={ex.problemTex} />
            <span className="text-ink-faint">=</span>
            <Formula tex={ex.solutionTex} />
          </div>
        ))}
      </div>
      <PrimaryButton onClick={acknowledge} autoFocus>
        Weiter
      </PrimaryButton>
    </>
  );
}
