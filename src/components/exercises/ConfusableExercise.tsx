"use client";

import { useMemo, useState } from "react";
import { choice, findGap, shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { Prompt, FeedbackPanel, useLetterShortcuts } from "./shared";
import type { ExerciseProps } from "./types";
import { Badge } from "@/components/ui/badge";

export default function ConfusableExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const pair = item.words;
  const target = useMemo(() => choice(pair), [pair]);
  const gap = findGap(target.enSentence, target);
  const options = useMemo(() => shuffle([pair[0].en, pair[1].en]), [pair]);

  const [chosen, setChosen] = useState<number | null>(null);

  function select(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = options[i].toLowerCase() === target.en.toLowerCase();
    onAnswered([{ wordId: target.id, format: "confusable", result: isCorrect ? "correct" : "incorrect", errorType: isCorrect ? null : "confused", hintsUsed: 0 }]);
  }

  useLetterShortcuts(options.length, select, chosen !== null);

  const result: AnswerResultKind | null = chosen === null ? null : options[chosen].toLowerCase() === target.en.toLowerCase() ? "correct" : "incorrect";
  const correctIdx = options.findIndex((o) => o.toLowerCase() === target.en.toLowerCase());

  return (
    <>
      <Badge className="h-auto inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-blue bg-blue-light">
        Similar words
      </Badge>
      {gap ? (
        <>
          <Prompt>Choose the word that fits</Prompt>
          <div className="text-[16px] leading-relaxed">
            {target.enSentence.slice(0, gap.index)}
            <span className="inline-block min-w-[90px] px-1 border-b-2 border-blue text-blue font-semibold text-center">____</span>
            {target.enSentence.slice(gap.index + gap.matched.length)}
          </div>
        </>
      ) : (
        <div className="text-[16px] leading-relaxed">
          Which word means: <b className="text-ink font-semibold">{target.de.join(" / ")}</b>?
        </div>
      )}
      {/* Both question shapes above end flush, so this single margin sets the distance to the
          options in either branch instead of each branch carrying its own. */}
      <div className="flex flex-col gap-2 mt-4">
        {options.map((o, i) => {
          let cls = "border-line bg-card hover:border-[#c7c7cc] hover:bg-blue-lighter";
          let keyCls = "border-line text-ink-faint";
          if (chosen !== null) {
            if (i === correctIdx) {
              cls = "border-green bg-green-light";
              keyCls = "bg-green border-green text-white";
            } else if (i === chosen) {
              cls = "border-red bg-red-light";
              keyCls = "bg-red border-red text-white";
            } else cls = "border-line bg-card opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={chosen !== null}
              className={"text-left border-[1.5px] rounded-xl px-4 py-3 text-[15px] font-medium text-ink flex items-center gap-3 transition-colors " + cls}
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
          <div className="mb-2">
            <b className="font-semibold text-ink">{pair[0].en}</b> — {pair[0].de.join(" / ")}
            <br />
            <span className="text-ink-faint">{pair[0].enSentence}</span>
          </div>
          <div>
            <b className="font-semibold text-ink">{pair[1].en}</b> — {pair[1].de.join(" / ")}
            <br />
            <span className="text-ink-faint">{pair[1].enSentence}</span>
          </div>
        </FeedbackPanel>
      )}
    </>
  );
}
