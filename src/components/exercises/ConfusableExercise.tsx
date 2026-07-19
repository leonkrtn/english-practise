"use client";

import { useMemo, useState } from "react";
import { choice, findGap, shuffle } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { FeedbackPanel } from "./shared";
import type { ExerciseProps } from "./types";

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

  const result: AnswerResultKind | null = chosen === null ? null : options[chosen].toLowerCase() === target.en.toLowerCase() ? "correct" : "incorrect";
  const correctIdx = options.findIndex((o) => o.toLowerCase() === target.en.toLowerCase());

  return (
    <>
      <span className="inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide mb-4 text-blue bg-blue-light">
        Similar words
      </span>
      {gap ? (
        <>
          <div className="text-[14.5px] text-ink-faint mb-5">Choose the word that fits</div>
          <div className="text-[17px] leading-relaxed mb-1.5">
            {target.enSentence.slice(0, gap.index)}
            <span className="inline-block min-w-[90px] border-b-2 border-blue text-blue font-semibold text-center">____</span>
            {target.enSentence.slice(gap.index + gap.matched.length)}
          </div>
        </>
      ) : (
        <div className="text-[14.5px] text-ink-faint mb-5">
          Which word means: <b className="text-ink font-semibold">{target.de.join(" / ")}</b>?
        </div>
      )}
      <div className="flex flex-col gap-2.5 mt-2">
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
              className={"text-left border-[1.5px] rounded-xl px-4 py-3.5 text-[15.5px] font-medium text-ink flex items-center gap-3 transition-colors " + cls}
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
