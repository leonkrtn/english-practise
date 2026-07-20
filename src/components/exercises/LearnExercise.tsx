"use client";

import { ArrowRight } from "lucide-react";
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
      <span className="inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-3 text-white shadow-sm bg-gradient-to-r from-green to-green-dark">
        {word.type === "verb" ? "Neues Verb" : "Neues Adjektiv"}
      </span>
      <div className="text-[24px] font-bold tracking-tight mb-1 leading-tight">{word.en}</div>
      <div className="text-[16px] text-ink-soft mb-3">{word.de.join(" / ")}</div>
      <div className="bg-gradient-to-br from-blue-lighter to-purple-light/40 rounded-xl p-3.5 text-sm leading-relaxed text-ink-soft">
        <ContextNote word={word} />
      </div>
      <div className="mt-4">
        <PrimaryButton onClick={acknowledge}>
          Verstanden, weiter
          <ArrowRight size={16} />
        </PrimaryButton>
      </div>
    </>
  );
}
