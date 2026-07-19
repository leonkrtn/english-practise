"use client";

import { useMemo, useState } from "react";
import { classifyAnswer, findGap, type ErrorType } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { AnswerInput, FeedbackPanel, PrimaryButton } from "./shared";
import type { ExerciseProps } from "./types";
import type { Word } from "@/lib/vocab";

interface Part {
  word: Word;
  before: string;
  after: string;
  matched: string;
}

export default function MultigapExercise({ item, onAnswered, onNext }: ExerciseProps) {
  const words = item.words;
  const parts = useMemo<Part[]>(
    () =>
      words.map((word) => {
        const gap = findGap(word.enSentence, word);
        if (gap) {
          return {
            word,
            before: word.enSentence.slice(0, gap.index),
            after: word.enSentence.slice(gap.index + gap.matched.length),
            matched: gap.matched,
          };
        }
        return { word, before: word.enSentence + " (", after: ")", matched: word.en };
      }),
    [words]
  );

  const [values, setValues] = useState<string[]>(() => parts.map(() => ""));
  const [statuses, setStatuses] = useState<(AnswerResultKind | null)[] | null>(null);

  function check() {
    if (statuses) return;
    let allCorrect = true;
    let anyCorrect = false;
    const results: (AnswerResultKind | null)[] = [];
    const entries = parts.map((p, i) => {
      const cls = classifyAnswer(values[i], [p.matched, p.word.en]);
      results.push(cls.result);
      if (cls.result === "correct") anyCorrect = true;
      else allCorrect = false;
      return { wordId: p.word.id, format: "multigap", result: cls.result, errorType: cls.errorType as ErrorType, hintsUsed: 0 };
    });
    setStatuses(results);
    onAnswered(entries);
    const overall: AnswerResultKind = allCorrect ? "correct" : anyCorrect ? "almost" : "incorrect";
    setOverall(overall);
  }
  const [overall, setOverall] = useState<AnswerResultKind | null>(null);

  return (
    <>
      <div className="text-[14.5px] text-ink-faint mb-5">Fill in the missing words</div>
      {parts.map((p, i) => (
        <div key={i} className="mb-4 last:mb-0">
          <div className="text-[17px] leading-relaxed mb-1.5">
            {p.before}
            <AnswerInput
              value={values[i]}
              onChange={(v) => setValues((arr) => arr.map((x, idx) => (idx === i ? v : x)))}
              status={statuses ? statuses[i] : null}
              disabled={!!statuses}
              placeholder=""
              onEnter={check}
              autoFocus={i === 0}
            />
            {p.after}
          </div>
          <div className="text-sm text-ink-faint">German: {p.word.de.join(" / ")}</div>
        </div>
      ))}
      {!statuses && (
        <div className="flex justify-end mt-6">
          <PrimaryButton onClick={check}>Check All</PrimaryButton>
        </div>
      )}
      {overall && (
        <FeedbackPanel result={overall} onContinue={onNext}>
          {parts.map((p) => (
            <div className="mb-2 last:mb-0" key={p.word.id}>
              <b className="font-semibold text-ink">{p.word.en}</b> — {p.word.de.join(" / ")}
            </div>
          ))}
        </FeedbackPanel>
      )}
    </>
  );
}
