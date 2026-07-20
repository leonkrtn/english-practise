"use client";

import { useMemo, useState } from "react";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel } from "@/components/exercises/shared";
import { CategoryBadge, type GrammarExerciseProps } from "./shared";

function stripPunct(s: string): string {
  return s.replace(/[.,!?;:'"()]/g, "").toLowerCase();
}

export default function GrammarErrorExercise({ rule, onAnswered, onNext }: GrammarExerciseProps) {
  const tokens = useMemo(() => rule.error.sentence.split(/\s+/), [rule.error.sentence]);
  const [chosen, setChosen] = useState<number | null>(null);

  function select(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = stripPunct(tokens[i]) === stripPunct(rule.error.wrongWord);
    onAnswered([
      { ruleId: rule.id, format: "g-error", result: isCorrect ? "correct" : "incorrect", errorType: isCorrect ? null : "wrong", hintsUsed: 0 },
    ]);
  }

  const correctIdx = tokens.findIndex((t) => stripPunct(t) === stripPunct(rule.error.wrongWord));
  const result: AnswerResultKind | null = chosen === null ? null : chosen === correctIdx ? "correct" : "incorrect";

  return (
    <>
      <CategoryBadge category={rule.category} />
      <div className="text-[13.5px] text-ink-faint mb-3">Tap the word that&apos;s wrong in this sentence</div>
      <div className="flex flex-wrap gap-1.5 text-[16px] leading-relaxed">
        {tokens.map((t, i) => {
          let cls = "hover:bg-blue-lighter";
          if (chosen !== null) {
            if (i === correctIdx) cls = "bg-green-light text-[#0d7a4f]";
            else if (i === chosen) cls = "bg-red-light text-[#b8271b]";
          }
          return (
            <button key={i} onClick={() => select(i)} disabled={chosen !== null} className={"rounded-md px-1 py-0.5 transition-colors " + cls}>
              {t}
            </button>
          );
        })}
      </div>
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <div className="mb-1.5">
            <b className="font-semibold text-ink">{rule.error.correctedSentence}</b>
          </div>
          {rule.explanation}
        </FeedbackPanel>
      )}
    </>
  );
}
