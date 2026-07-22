"use client";

import { useState } from "react";
import { classifyAnswer, findGap } from "@/lib/utils";
import type { AnswerResultKind } from "@/lib/types";
import { Badge, ContextNote, FeedbackPanel, AnswerInput, ExerciseFooter, HintButton, HintIcon, PrimaryButton, useHints, DetailRow, boldenWord } from "./shared";
import type { ExerciseProps } from "./types";
import TranslateExercise from "./TranslateExercise";

export default function GapExercise(props: ExerciseProps) {
  const { item, onAnswered, onNext } = props;
  const word = item.words[0];
  const gap = findGap(word.enSentence, word);

  const [value, setValue] = useState("");
  const [result, setResult] = useState<AnswerResultKind | null>(null);
  const { reveal, showHint, hintsUsed } = useHints(word, false);

  if (!gap) return <TranslateExercise {...props} />;

  const before = word.enSentence.slice(0, gap.index);
  const after = word.enSentence.slice(gap.index + gap.matched.length);
  const accepted = [gap.matched, word.en];

  function check(skipped: boolean) {
    if (result) return;
    const raw = skipped ? "" : value;
    const cls = classifyAnswer(raw, accepted);
    const res: AnswerResultKind = skipped ? "incorrect" : cls.result;
    setResult(res);
    onAnswered([{ wordId: word.id, format: "gap", result: res, errorType: skipped ? "skipped" : cls.errorType, hintsUsed }]);
  }

  return (
    <>
      <Badge word={word} />
      <div className="text-[13.5px] text-ink-faint mb-3">Fill in the missing word</div>
      <div className="text-[16px] leading-relaxed mb-1.5">
        {before}
        <span className="inline-block min-w-[90px] border-b-2 border-blue text-blue font-semibold text-center">
          {result ? gap.matched : "?"}
        </span>
        {after}
      </div>
      <div className="text-sm text-ink-faint mb-3">
        German meaning: <b className="text-ink font-semibold">{word.de.join(" / ")}</b>
      </div>
      <AnswerInput
        value={value}
        onChange={setValue}
        status={result}
        disabled={!!result}
        placeholder="Type the missing word…"
        onEnter={() => check(false)}
      />
      {reveal && <div className="text-[13px] text-blue-dark bg-blue-light rounded-lg px-3 py-2 mt-2">{reveal}</div>}
      {!result && (
        <ExerciseFooter>
          <div className="flex gap-2">
            <HintButton onClick={showHint}>
              <HintIcon /> Hint
            </HintButton>
            <HintButton onClick={() => check(true)}>Skip</HintButton>
          </div>
          <PrimaryButton onClick={() => check(false)}>
            Check <span className="text-[11px] font-mono bg-line-soft border border-line rounded px-1.5 text-ink-soft">↵</span>
          </PrimaryButton>
        </ExerciseFooter>
      )}
      {result && (
        <FeedbackPanel result={result} onContinue={onNext}>
          <DetailRow label="Full sentence">
            {boldenWord(word.enSentence, word)}
            <br />
            <span className="text-ink-faint">{word.deSentence}</span>
          </DetailRow>
          <ContextNote word={word} />
        </FeedbackPanel>
      )}
    </>
  );
}
