"use client";

import { ContextNote, PrimaryButton } from "./shared";
import type { ExerciseProps } from "./types";

export default function LearnExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const word = item.words[0];

  function acknowledge() {
    onAnswered([{ wordId: word.id, format: "learn", result: "correct", errorType: null, hintsUsed: 0 }]);
    onNext();
  }

  return (
    <>
      <span className="inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-green bg-green-light">
        {word.type === "verb" ? "Neues Verb" : "Neues Adjektiv"}
      </span>
      <div className="text-[28px] font-bold tracking-tight mb-1 leading-tight">{word.en}</div>
      <div className="text-[17px] text-ink-soft mb-5">{word.de.join(" / ")}</div>
      <div className="bg-bg rounded-xl p-4 text-sm leading-relaxed text-ink-soft">
        <ContextNote word={word} />
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={acknowledge}>Verstanden, weiter →</PrimaryButton>
      </div>
    </>
  );
}
