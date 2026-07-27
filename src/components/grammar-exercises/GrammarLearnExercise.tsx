"use client";

import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/exercises/shared";
import { CategoryBadge, type GrammarExerciseProps } from "./shared";

export default function GrammarLearnExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  function acknowledge() {
    onAnswered([{ ruleId: rule.id, format: "g-learn", result: "correct", errorType: null, hintsUsed: 0 }]);
    onNext();
  }

  return (
    <>
      <CategoryBadge category={rule.category} />
      <div className="text-[20px] font-bold tracking-tight mb-2 leading-tight">{rule.title}</div>
      <div className="text-[15px] text-ink-soft leading-relaxed mb-3">{rule.explanation}</div>
      <div className="bg-gradient-to-br from-purple-light/60 to-blue-lighter rounded-xl p-4 text-sm leading-relaxed text-ink-soft flex flex-col gap-2">
        {rule.examples.map((ex, i) => (
          <div key={i}>
            {ex.en}
            <br />
            <span className="text-ink-faint">{ex.de}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={acknowledge} autoFocus>
          Verstanden, weiter
          <ArrowRight size={16} />
        </PrimaryButton>
      </div>
    </>
  );
}
