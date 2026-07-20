"use client";

import { useState } from "react";
import { FeedbackPanel } from "@/components/exercises/shared";
import { CategoryBadge, type GrammarExerciseProps } from "./shared";

export default function GrammarMcExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const [chosen, setChosen] = useState<number | null>(null);

  function select(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = i === rule.mc.correctIndex;
    onAnswered([{ ruleId: rule.id, format: "g-mc", result: isCorrect ? "correct" : "incorrect", errorType: isCorrect ? null : "wrong", hintsUsed: 0 }]);
  }

  const result = chosen === null ? null : chosen === rule.mc.correctIndex ? "correct" : "incorrect";

  return (
    <>
      <CategoryBadge category={rule.category} />
      <div className="text-[15px] text-ink mb-3 font-medium">{rule.mc.prompt}</div>
      <div className="flex flex-col gap-2 mt-1">
        {rule.mc.options.map((o, i) => {
          let cls = "border-line bg-card hover:border-[#c7c7cc] hover:bg-blue-lighter";
          let keyCls = "border-line text-ink-faint";
          if (chosen !== null) {
            if (i === rule.mc.correctIndex) {
              cls = "border-green bg-green-light";
              keyCls = "bg-green border-green text-white";
            } else if (i === chosen) {
              cls = "border-red bg-red-light";
              keyCls = "bg-red border-red text-white";
            } else {
              cls = "border-line bg-card opacity-50";
            }
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={chosen !== null}
              className={"text-left border-[1.5px] rounded-xl px-3.5 py-3 text-[14.5px] font-medium text-ink flex items-center gap-3 transition-colors " + cls}
            >
              <span className={"w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold shrink-0 " + keyCls}>
                {String.fromCharCode(65 + i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
