"use client";

import { useMemo, useState } from "react";
import { choice } from "@/lib/utils";
import { FeedbackPanel, useNumberShortcuts } from "@/components/exercises/shared";
import { CategoryBadge, type GrammarExerciseProps } from "./shared";

export default function GrammarMcExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const variant = useMemo(() => choice(rule.mc), [rule]);
  const [chosen, setChosen] = useState<number | null>(null);

  function select(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = i === variant.correctIndex;
    onAnswered([{ ruleId: rule.id, format: "g-mc", result: isCorrect ? "correct" : "incorrect", errorType: isCorrect ? null : "wrong", hintsUsed: 0 }]);
  }

  useNumberShortcuts(variant.options.length, select, chosen !== null);

  const result = chosen === null ? null : chosen === variant.correctIndex ? "correct" : "incorrect";

  return (
    <>
      <CategoryBadge category={rule.category} />
      <div className="text-[16px] text-ink font-medium leading-relaxed">{variant.prompt}</div>
      <div className="flex flex-col gap-2 mt-4">
        {variant.options.map((o, i) => {
          let cls = "border-line bg-card hover:border-purple/40 hover:bg-purple-light hover:-translate-y-0.5 hover:shadow-md";
          let keyCls = "border-line text-ink-faint bg-bg";
          if (chosen !== null) {
            if (i === variant.correctIndex) {
              cls = "border-green bg-green-light shadow-[0_4px_14px_-4px_rgba(30,182,118,0.35)]";
              keyCls = "bg-gradient-to-br from-green to-green-dark border-green text-white shadow-sm";
            } else if (i === chosen) {
              cls = "border-red bg-red-light shadow-[0_4px_14px_-4px_rgba(232,72,58,0.3)]";
              keyCls = "bg-gradient-to-br from-red to-red-dark border-red text-white shadow-sm";
            } else {
              cls = "border-line bg-card opacity-40";
            }
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={chosen !== null}
              className={"text-left border-[1.5px] rounded-xl px-4 py-3 text-[15px] font-medium text-ink flex items-center gap-3 transition-all " + cls}
            >
              <span className={"w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors " + keyCls}>
                {i + 1}
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
